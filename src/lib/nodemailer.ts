import nodemailer from "nodemailer";

const outlookUser = process.env.OUTLOOK_USER || "proit45ma@outlook.com";
const outlookPass = process.env.OUTLOOK_APP_PASSWORD || "syutoatawbwcamcc";

export const transporter = nodemailer.createTransport({
  host: process.env.OUTLOOK_HOST || "smtp.office365.com",
  port: Number(process.env.OUTLOOK_PORT) || 587,
  secure: false, // Port 587 uses STARTTLS
  auth: {
    user: outlookUser,
    pass: outlookPass,
  },
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false,
  },
});

export function getFromAddress(): string {
  if (process.env.OUTLOOK_FROM) {
    return process.env.OUTLOOK_FROM;
  }
  return `"Mint Month" <${outlookUser}>`;
}
