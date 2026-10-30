import { Resend } from "resend";

let resendInstance: Resend | null = null;

export function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable.");
  }
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}
