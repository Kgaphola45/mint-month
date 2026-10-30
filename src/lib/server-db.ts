import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface PasswordResetRecord {
  id: string;
  email: string;
  otpHash: string;
  expiresAt: string; // ISO date string
  used: boolean;
  createdAt: string; // ISO date string
}

export interface ResetTokenRecord {
  token: string;
  email: string;
  expiresAt: string; // ISO date string
  used: boolean;
  createdAt: string; // ISO date string
}

export interface AuthDatabaseSchema {
  passwordResets: PasswordResetRecord[];
  resetTokens: ResetTokenRecord[];
  userPasswords: Record<string, string>; // email -> bcrypt hash
}

// In-memory rate limiting map: email -> timestamps[]
const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(email: string): { allowed: boolean; remaining: number } {
  const normalized = email.trim().toLowerCase();
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 3;

  const timestamps = (rateLimitMap.get(normalized) || []).filter(
    (t) => now - t < windowMs
  );

  if (timestamps.length >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  timestamps.push(now);
  rateLimitMap.set(normalized, timestamps);
  return { allowed: true, remaining: maxRequests - timestamps.length };
}

// In-memory state cache
let memoryDb: AuthDatabaseSchema = {
  passwordResets: [],
  resetTokens: [],
  userPasswords: {},
};

function getDbFilePath(): string {
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {
      // ignore in read-only environments
    }
  }
  return path.join(dir, "auth-db.json");
}

function loadDb(): AuthDatabaseSchema {
  try {
    const filePath = getDbFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      memoryDb = JSON.parse(data);
    }
  } catch {
    // fallback to in-memory
  }
  return memoryDb;
}

function saveDb(): void {
  try {
    const filePath = getDbFilePath();
    fs.writeFileSync(filePath, JSON.stringify(memoryDb, null, 2), "utf-8");
  } catch {
    // fallback to in-memory
  }
}

export const serverDb = {
  // Hash helper
  hashOtp(otp: string): string {
    return crypto.createHash("sha256").update(otp.trim()).digest("hex");
  },

  // Save a new password reset OTP
  createPasswordReset(email: string, otpHash: string, expiresAt: Date): PasswordResetRecord {
    loadDb();
    const record: PasswordResetRecord = {
      id: `pr_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
      email: email.trim().toLowerCase(),
      otpHash,
      expiresAt: expiresAt.toISOString(),
      used: false,
      createdAt: new Date().toISOString(),
    };

    memoryDb.passwordResets.push(record);
    saveDb();
    return record;
  },

  // Find latest valid, unused OTP for email
  findValidOtp(email: string, otpHash: string): PasswordResetRecord | null {
    loadDb();
    const normalized = email.trim().toLowerCase();
    const now = new Date();

    const matching = memoryDb.passwordResets
      .filter(
        (r) =>
          r.email === normalized &&
          r.otpHash === otpHash &&
          !r.used &&
          new Date(r.expiresAt) > now
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return matching[0] || null;
  },

  // Mark an OTP as used
  markOtpUsed(id: string): void {
    loadDb();
    const record = memoryDb.passwordResets.find((r) => r.id === id);
    if (record) {
      record.used = true;
      saveDb();
    }
  },

  // Save a new reset token
  createResetToken(email: string, token: string, expiresAt: Date): ResetTokenRecord {
    loadDb();
    const record: ResetTokenRecord = {
      token,
      email: email.trim().toLowerCase(),
      expiresAt: expiresAt.toISOString(),
      used: false,
      createdAt: new Date().toISOString(),
    };

    memoryDb.resetTokens.push(record);
    saveDb();
    return record;
  },

  // Find valid unused reset token
  findValidResetToken(token: string): ResetTokenRecord | null {
    loadDb();
    const now = new Date();
    const record = memoryDb.resetTokens.find(
      (t) => t.token === token && !t.used && new Date(t.expiresAt) > now
    );
    return record || null;
  },

  // Invalidate / mark reset token as used
  markResetTokenUsed(token: string): void {
    loadDb();
    const record = memoryDb.resetTokens.find((t) => t.token === token);
    if (record) {
      record.used = true;
      saveDb();
    }
  },

  // Update user's password hash in server DB
  updateUserPassword(email: string, passwordHash: string): void {
    loadDb();
    const normalized = email.trim().toLowerCase();
    memoryDb.userPasswords[normalized] = passwordHash;
    saveDb();
  },

  // Permanently delete user data from server DB
  deleteUserAccount(email: string): boolean {
    loadDb();
    const normalized = email.trim().toLowerCase();

    // Purge password reset records
    memoryDb.passwordResets = memoryDb.passwordResets.filter(
      (r) => r.email !== normalized
    );

    // Purge reset tokens
    memoryDb.resetTokens = memoryDb.resetTokens.filter(
      (t) => t.email !== normalized
    );

    // Purge saved password hash
    if (memoryDb.userPasswords[normalized]) {
      delete memoryDb.userPasswords[normalized];
    }

    saveDb();
    return true;
  },
};

