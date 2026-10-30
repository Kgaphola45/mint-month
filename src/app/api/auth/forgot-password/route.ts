import { NextRequest, NextResponse } from "next/server";
import { getResendClient } from "@/lib/resend";
import { serverDb, checkRateLimit } from "@/lib/server-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body || {};

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

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

    // 2. Generate 6-digit OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Hash OTP with SHA-256 (Never store plain OTP)
    const otpHash = serverDb.hashOtp(rawOtp);

    // 4. Save to DB with expiresAt = now + 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    serverDb.createPasswordReset(normalizedEmail, otpHash, expiresAt);

    // 5. Send email via Resend with Vela editorial styling
    try {
      const resend = getResendClient();
      await resend.emails.send({
        from: "Mint Month <onboarding@resend.dev>",
        to: normalizedEmail,
        subject: "Your Mint Month reset code",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Mint Month reset code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FBF6EF; font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0D0D0C;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FBF6EF; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="520" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #FFFDF8; border: 1px solid rgba(13, 13, 12, 0.08); border-radius: 24px; padding: 40px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);">
          <!-- Logo / Header -->
          <tr>
            <td>
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width: 13px; height: 13px; background-color: #0D0D0C; border-radius: 50%;"></td>
                  <td style="padding-left: 10px; font-size: 18px; font-weight: 600; letter-spacing: -0.02em; color: #0D0D0C;">
                    mint month
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding-top: 32px;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 500; letter-spacing: -0.02em; color: #0D0D0C; line-height: 1.2;">
                Reset your password
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(13, 13, 12, 0.56); line-height: 1.5;">
                Enter this 6-digit verification code to reset your account password.
              </p>
            </td>
          </tr>

          <!-- OTP Code Box -->
          <tr>
            <td style="padding-top: 32px; padding-bottom: 24px;">
              <div style="background-color: #FBF6EF; border: 1px solid rgba(13, 13, 12, 0.08); border-radius: 18px; padding: 24px 20px; text-align: center;">
                <div style="font-size: 48px; font-weight: 600; letter-spacing: 0.18em; color: #0D0D0C; line-height: 1; font-variant-numeric: tabular-nums;">
                  ${rawOtp}
                </div>
                <div style="margin-top: 12px; font-size: 12px; font-weight: 500; color: rgba(13, 13, 12, 0.56);">
                  Expires in 10 minutes
                </div>
              </div>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding-top: 12px; border-top: 1px solid rgba(13, 13, 12, 0.06);">
              <p style="margin: 0; font-size: 12px; color: rgba(13, 13, 12, 0.5); line-height: 1.6;">
                If you did not request this code, you can safely ignore this email. No changes will be made to your account.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 24px; font-size: 11px; color: rgba(13, 13, 12, 0.4); text-align: center;">
              Mint Month · Minimal, privacy-first expense tracker
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`,
      });
    } catch (err: any) {
      // In development or if Resend test mode is restricted, log safe error message without exposing key or OTP
      console.error("Resend delivery notice:", err?.message || "Delivery error");
    }

    // Always return { ok: true } even if user not found (security protocol)
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
