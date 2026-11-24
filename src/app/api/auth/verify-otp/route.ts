import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { serverDb, OTP_COOKIE_NAME } from "@/lib/server-db";

const verifyOtpSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address"),
  otp: z
    .string()
    .trim()
    .length(6, "Verification code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Verification code must contain only numbers"),
  otpSessionToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = verifyOtpSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { ok: false, error: parseResult.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, otp, otpSessionToken } = parseResult.data;
    const normalizedEmail = email.toLowerCase();

    // Hash incoming OTP with SHA-256
    const otpHash = serverDb.hashOtp(otp);

    // 1. Look up latest record in serverDb / Supabase password_resets
    let record = await serverDb.findValidOtp(normalizedEmail, otpHash);

    // 2. Fallback to stateless HMAC-signed session token for Vercel serverless cold-start resilience
    if (!record) {
      const cookieToken = req.cookies.get(OTP_COOKIE_NAME)?.value;
      record = serverDb.verifyStatelessOtpSession(
        otpSessionToken || cookieToken,
        normalizedEmail,
        otpHash
      );
    }

    if (!record) {
      return NextResponse.json(
        { ok: false, error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    // Mark OTP as used (one-time use guarantee)
    await serverDb.markOtpUsed(record.id, otpHash);

    // Generate self-verifying stateless HMAC reset token (10 minutes expiry)
    const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const resetToken = serverDb.generateStatelessResetToken(normalizedEmail, tokenExpiry);

    serverDb.createResetToken(normalizedEmail, resetToken, tokenExpiry);

      const response = NextResponse.json({
        ok: true,
        resetToken,
      });

      response.cookies.delete(OTP_COOKIE_NAME);
      return response;
    } catch {
      return NextResponse.json(
        { ok: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  }
