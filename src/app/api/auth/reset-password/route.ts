import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { serverDb } from "@/lib/server-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resetToken, newPassword } = body || {};

    if (!resetToken || typeof resetToken !== "string") {
      return NextResponse.json(
        { ok: false, error: "Reset token is required." },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Verify token exists, is unused, and not expired
    const record = serverDb.findValidResetToken(resetToken.trim());
    if (!record) {
      return NextResponse.json(
        { ok: false, error: "Invalid or expired reset token. Please request a new code." },
        { status: 400 }
      );
    }

    // Hash password with bcryptjs (10 salt rounds)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password in DB
    serverDb.updateUserPassword(record.email, hashedPassword);

    // Invalidate reset token
    serverDb.markResetTokenUsed(record.token);

    return NextResponse.json({
      ok: true,
      message: "Password successfully updated.",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
