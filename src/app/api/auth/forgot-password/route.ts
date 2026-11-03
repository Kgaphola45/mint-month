import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { transporter } from "@/lib/nodemailer";
import { serverDb } from "@/lib/server-db";
import { getSupabaseAdminClient } from "@/lib/supabase/client";

// In-memory rate limiter: Map<email, { count: number, resetTime: number }>
interface RateLimitEntry {
  count: number;
  resetTime: number;
}
const rateLimiter = new Map<string, RateLimitEntry>();

function checkRateLimit(email: string): { allowed: boolean; remaining: number } {
  const normalized = email.trim().toLowerCase();
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 3;

  const entry = rateLimiter.get(normalized);

  if (!entry || now > entry.resetTime) {
    rateLimiter.set(normalized, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxRequests - entry.count };
}

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = forgotPasswordSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { ok: false, error: parseResult.error.issues[0]?.message || "Invalid email" },
        { status: 400 }
      );
    }

    const { email } = parseResult.data;
    const normalizedEmail = email.toLowerCase();

    // 1. Rate limiting (max 3 requests per 15 min per email)
    const rate = checkRateLimit(normalizedEmail);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: "Too many reset attempts. Please wait 15 minutes before trying again.",
        },
        { status: 429 }
      );
    }

    // 2. Check if user actually exists before generating & sending code
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers();
      if (!listErr && usersData?.users) {
        const userExists = usersData.users.some(
          (u) => u.email?.toLowerCase() === normalizedEmail
        );
        if (!userExists) {
          return NextResponse.json(
            {
              ok: false,
              error: "No account found with this email address. Please register an account first.",
            },
            { status: 404 }
          );
        }
      }
    }

    // 3. Generate 6-digit OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Hash OTP with SHA-256 before saving to DB
    const otpHash = serverDb.hashOtp(rawOtp);

    // 4. Save to DB with 10 min expiry (used = false)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    serverDb.createPasswordReset(normalizedEmail, otpHash, expiresAt);

    // 5. Send email via Gmail transport
    try {
      await transporter.sendMail({
        to: normalizedEmail,
        subject: `Your Mint Month reset code: ${rawOtp}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Mint Month reset code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FBF6EF; font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0D0D0C;">
  <div style="background:#FBF6EF;padding:36px 20px;font-family:'Inter Tight', -apple-system, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #FFFDFA; border: 1px solid rgba(13, 13, 12, 0.08); border-radius: 24px; padding: 36px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);">
            <tr>
              <td>
                <table border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="width: 12px; height: 12px; background-color: #0D0D0C; border-radius: 50%;"></td>
                    <td style="padding-left: 10px; font-size: 16px; font-weight: 600; letter-spacing: -0.02em; color: #0D0D0C;">
                      mint month
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding-top: 24px;">
                <h1 style="font-size: 42px; font-weight: 600; letter-spacing: -0.032em; margin: 0; color: #0D0D0C; line-height: 1;">
                  ${rawOtp}
                </h1>
                <p style="color: rgba(13, 13, 12, 0.56); font-size: 14px; margin: 12px 0 0 0;">
                  Expires in 10 minutes. Track in your terms.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding-top: 24px; border-top: 1px solid rgba(13, 13, 12, 0.06); margin-top: 24px;">
                <p style="margin: 0; font-size: 12px; color: rgba(13, 13, 12, 0.45); line-height: 1.5;">
                  If you did not request this verification code, you can safely disregard this message.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`,
      });

      return NextResponse.json({
        ok: true,
        sent: true,
        email: normalizedEmail,
      });
    } catch {
      // Never log OTP or passwords
      console.error("EMAIL_FAILED_USE_DEV_BYPASS");

      const isProd = process.env.NODE_ENV === "production";
      if (isProd) {
        return NextResponse.json(
          { ok: false, error: "Email service failed" },
          { status: 500 }
        );
      }

      // In dev mode, return devBypassOtp for local testing
      return NextResponse.json({
        ok: true,
        sent: false,
        email: normalizedEmail,
        devBypassOtp: rawOtp,
        devOtp: rawOtp,
      });
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
