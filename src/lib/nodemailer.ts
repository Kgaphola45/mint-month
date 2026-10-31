import nodemailer, { Transporter, SendMailOptions } from "nodemailer";

export function getGmailTransporter(): Transporter {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Missing Gmail credentials. Add to .env.local");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user.trim(),
      pass: pass.trim().replace(/\s+/g, ""),
    },
  });
}

export const transporter = {
  sendMail: async (options: SendMailOptions) => {
    const client = getGmailTransporter();
    const fromAddress = options.from || `"Mint Month" <${process.env.GMAIL_USER}>`;
    return client.sendMail({
      ...options,
      from: fromAddress,
    });
  },
  verify: (callback?: (err: Error | null, success: boolean) => void) => {
    const client = getGmailTransporter();
    return client.verify(callback as any);
  },
};
