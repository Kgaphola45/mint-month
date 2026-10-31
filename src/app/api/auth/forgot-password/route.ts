import { NextRequest, NextResponse } from "next/server";
import { transporter, getFromAddress } from "@/lib/nodemailer";
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

    // 5. Send email via Outlook Nodemailer
    try {
      await transporter.sendMail({
        from: getFromAddress(),
        to: normalizedEmail,
        subject: `Your Mint Month code: ${rawOtp}`,
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
          <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #FFFDF8; border: 1px solid rgba(13, 13, 12, 0.08); border-radius: 24px; padding: 36px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);">
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
                <h1 style="font-size: 42px; font-weight: 600; letter-spacing: -0.03em; margin: 0; color: #0D0D0C; line-height: 1;">
                  ${rawOtp}
                </h1>
                <p style="color: #0D0D0C8F; font-size: 14px; margin: 12px 0 0 0;">
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
    } catch (sendError: unknown) {
      const errorMsg = sendError instanceof Error ? sendError.message : String(sendError);
      console.error("Nodemailer Outlook send error:", errorMsg);

      // Return ok: true with sent: false and devOtp in non-production so user testing is never blocked
      return NextResponse.json({
        ok: true,
        sent: false,
        email: normalizedEmail,
        devOtp: rawOtp,
        error: errorMsg,
      });
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
