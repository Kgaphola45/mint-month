import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { serverDb } from "@/lib/server-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = body || {};

    if (!email || !otp || typeof otp !== "string") {
      return NextResponse.json(
        { ok: false, error: "Email and 6-digit OTP code are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (cleanOtp.length !== 6) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid 6-digit verification code." },
        { status: 400 }
      );
    }

    // Hash incoming OTP
    const otpHash = serverDb.hashOtp(cleanOtp);

    // Look up latest record where used=false and expiresAt > now
    const record = serverDb.findValidOtp(normalizedEmail, otpHash);

    if (!record) {
      return NextResponse.json(
        { ok: false, error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    // Mark OTP as used (one-time use)
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

