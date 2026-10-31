import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { serverDb } from "@/lib/server-db";

const verifyOtpSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address"),
  otp: z
    .string()
    .trim()
    .length(6, "Verification code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Verification code must contain only numbers"),
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

    const { email, otp } = parseResult.data;
    const normalizedEmail = email.toLowerCase();

    // Hash incoming OTP with SHA-256
    const otpHash = serverDb.hashOtp(otp);

    // Look up latest record where used=false and expiresAt > now
    const record = serverDb.findValidOtp(normalizedEmail, otpHash);

    if (!record) {
      return NextResponse.json(
        { ok: false, error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    // Mark OTP as used (one-time use guarantee)
    serverDb.markOtpUsed(record.id);

    // Generate secure 32-byte reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    serverDb.createResetToken(normalizedEmail, resetToken, tokenExpiry);

    return NextResponse.json({
      ok: true,
      resetToken,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
