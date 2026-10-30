import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body || {};

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { ok: false, error: "Email is required to delete account." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Purge user credentials and tokens from server database
    serverDb.deleteUserAccount(normalizedEmail);

    return NextResponse.json({
      ok: true,
      message: "Account records permanently deleted from server.",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to delete account on server." },
      { status: 500 }
    );
  }
}

