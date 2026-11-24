import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { transporter } from "@/lib/nodemailer";

const welcomeSchema = z.object({
  email: z.string().trim().email("Valid email is required"),
  name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = welcomeSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { ok: false, error: parseResult.error.issues[0]?.message || "Valid email is required" },
        { status: 400 }
      );
    }

    const { email, name } = parseResult.data;
    const normalizedEmail = email.toLowerCase();
    const displayName = name && typeof name === "string" ? name.trim() : "Valued Member";

    try {
      await transporter.sendMail({
        to: normalizedEmail,
        subject: `Welcome to Mint Month, ${displayName} — Your vault is active`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Mint Month</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FBF6EF; font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0D0D0C;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FBF6EF; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="520" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #FFFDFA; border: 1px solid rgba(13, 13, 12, 0.08); border-radius: 24px; padding: 40px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);">
          <!-- Header -->
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

          <!-- Welcome Message -->
          <tr>
            <td style="padding-top: 32px;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 500; letter-spacing: -0.02em; color: #0D0D0C; line-height: 1.2;">
                Welcome, ${displayName}
              </h1>
              <p style="margin: 12px 0 0 0; font-size: 14px; color: rgba(13, 13, 12, 0.65); line-height: 1.6;">
                Your private financial vault has been successfully set up. Track your monthly debit orders, category budgets, and know your exact <strong>Safe-to-Spend</strong> balance every single day.
              </p>
            </td>
          </tr>

          <!-- Highlights Card -->
          <tr>
            <td style="padding-top: 24px; padding-bottom: 24px;">
              <div style="background-color: #FBF6EF; border: 1px solid rgba(13, 13, 12, 0.08); border-radius: 18px; padding: 20px;">
                <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: rgba(13, 13, 12, 0.5);">
                  Account Summary
                </div>
                <div style="margin-top: 10px; font-size: 14px; color: #0D0D0C; line-height: 1.7;">
                  <div>• <strong>Email:</strong> ${normalizedEmail}</div>
                  <div>• <strong>Privacy:</strong> Client-side encrypted & local-first</div>
                  <div>• <strong>Features:</strong> Debit order tracker, payday countdown, instalments</div>
                </div>
              </div>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding-top: 12px; border-top: 1px solid rgba(13, 13, 12, 0.06);">
              <p style="margin: 0; font-size: 12px; color: rgba(13, 13, 12, 0.5); line-height: 1.6;">
                If you did not sign up for Mint Month with this email, please ignore this notice.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 24px; font-size: 11px; color: rgba(13, 13, 12, 0.4); text-align: center;">
              Mint Month · Minimal, editorial personal finance
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

      return NextResponse.json({
        ok: true,
        sent: true,
      });
    } catch (sendErr: unknown) {
      const errMsg = sendErr instanceof Error ? sendErr.message : String(sendErr);
      console.error("EMAIL_DISPATCH_FALLBACK (welcome):", errMsg);

      return NextResponse.json({
        ok: true,
        sent: false,
        devBypassOtp: true,
        emailError: errMsg,
      });
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
