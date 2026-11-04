import nodemailer, { Transporter, SendMailOptions } from "nodemailer";

  function cleanEnv(val?: string): string {
    if (!val) return "";
    return val.trim().replace(/^["']|["']$/g, "").trim();
  }

  export function getSmtpCredentials(): {
    user: string;
    pass: string;
    host: string;
  } {
    const user = cleanEnv(
      process.env.GMAIL_USER ||
      process.env.SMTP_USER ||
      process.env.EMAIL_USER ||
      process.env.NEXT_PUBLIC_GMAIL_USER
    );
    const rawPass = cleanEnv(
      process.env.GMAIL_APP_PASSWORD ||
      process.env.GMAIL_PASSWORD ||
      process.env.SMTP_PASS ||
      process.env.EMAIL_PASS
    );
    const host = cleanEnv(process.env.SMTP_HOST) || "smtp.gmail.com";

    // Gmail App Passwords are 16 chars often displayed with spaces; strip internal spaces for Gmail
    const pass = host.includes("gmail") ? rawPass.replace(/\s+/g, "") : rawPass;

    return { user, pass, host };
  }

  export function getGmailTransporter(port: 465 | 587 = 465): Transporter {
    const { user, pass, host } = getSmtpCredentials();

    if (!user || !pass) {
      throw new Error(
        "Missing email credentials. Set GMAIL_USER and GMAIL_APP_PASSWORD in your environment variables."
      );
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port === 587,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  export function getFromAddress(): string {
    const { user } = getSmtpCredentials();
    const customFrom = cleanEnv(process.env.EMAIL_FROM || process.env.SMTP_FROM);
    if (customFrom) return customFrom;
    return user ? `"Mint Month" <${user}>` : `"Mint Month" <noreply@mintmonth.app>`;
  }

  export const transporter = {
    sendMail: async (options: SendMailOptions) => {
      const { user, pass } = getSmtpCredentials();

      if (user && pass) {
        const fromAddress = options.from || `"Mint Month" <${user}>`;
        const mailPayload: SendMailOptions = {
          ...options,
          from: fromAddress,
        };

        try {
          // Primary attempt: Port 465 (Implicit SSL/TLS - most reliable on Vercel Serverless)
          const client465 = getGmailTransporter(465);
          return await client465.sendMail(mailPayload);
        } catch (err465) {
          console.warn("SMTP port 465 failed, retrying on port 587:", err465);
          // Fallback attempt: Port 587 (STARTTLS)
          const client587 = getGmailTransporter(587);
          return await client587.sendMail(mailPayload);
        }
      }

      // Optional fallback: Resend HTTP API if RESEND_API_KEY is configured on Vercel
      const resendApiKey = cleanEnv(process.env.RESEND_API_KEY);
      if (resendApiKey) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: cleanEnv(process.env.EMAIL_FROM) || "Mint Month <onboarding@resend.dev>",
            to: Array.isArray(options.to) ? options.to : [String(options.to)],
            subject: options.subject || "Mint Month Notification",
            html: typeof options.html === "string" ? options.html : undefined,
          }),
        });

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Resend API error (${res.status}): ${errBody}`);
        }
        return await res.json();
      }

      throw new Error(
        "Missing email credentials. Configure GMAIL_USER and GMAIL_APP_PASSWORD in Vercel Environment Variables."
      );
    },
    verify: (callback?: (err: Error | null, success: boolean) => void) => {
      const client = getGmailTransporter(465);
      return client.verify(callback as any);
    },
  };
