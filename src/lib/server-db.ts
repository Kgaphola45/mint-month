import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import { getSupabaseAdminClient, getSupabaseClient } from "./supabase/client";

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

export const OTP_COOKIE_NAME = "mm_otp_session";

function getSigningSecret(): string {
  return (
    process.env.NEXTAUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "mint-month-serverless-hmac-secret-2026"
  );
}

function signPayload(payloadStr: string): string {
  return crypto
    .createHmac("sha256", getSigningSecret())
    .update(payloadStr)
    .digest("base64url");
}

// In-memory rate limiting map: email -> timestamps[]
const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(email: string): { allowed: boolean; remaining: number } {
  const normalized = email.trim().toLowerCase();
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5;

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
      const localDir = path.join(process.cwd(), "data");
      try {
        if (!fs.existsSync(localDir)) {
          fs.mkdirSync(localDir, { recursive: true });
        }
        fs.accessSync(localDir, fs.constants.W_OK);
        return path.join(localDir, "auth-db.json");
      } catch {
        // On Vercel serverless, process.cwd() (/var/task) is read-only; use /tmp
        return path.join(os.tmpdir(), "mint-month-auth-db.json");
      }
    }

    function loadDb(): AuthDatabaseSchema {
      try {
        const filePath = getDbFilePath();
        if (fs.existsSync(filePath)) {
          const data = fs.readFileSync(filePath, "utf-8");
          const parsed = JSON.parse(data);
          if (parsed && typeof parsed === "object") {
            memoryDb = {
              passwordResets: Array.isArray(parsed.passwordResets) ? parsed.passwordResets : [],
              resetTokens: Array.isArray(parsed.resetTokens) ? parsed.resetTokens : [],
              userPasswords: parsed.userPasswords || {},
            };
          }
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

    function getDbSupabase() {
      return getSupabaseAdminClient() || getSupabaseClient();
    }

    export const serverDb = {
      // Hash helper
      hashOtp(otp: string): string {
        return crypto.createHash("sha256").update(otp.trim()).digest("hex");
      },

      // Create stateless HMAC-signed OTP session token (for serverless cold-start resilience)
      createStatelessOtpSession(email: string, otpHash: string, expiresAt: Date): string {
        const payload = JSON.stringify({
          email: email.trim().toLowerCase(),
          otpHash,
          exp: expiresAt.getTime(),
        });
        const encoded = Buffer.from(payload, "utf-8").toString("base64url");
        const sig = signPayload(encoded);
        return `${encoded}.${sig}`;
      },

      // Verify stateless HMAC-signed OTP session token
      verifyStatelessOtpSession(
        token: string | undefined,
        email: string,
        otpHash: string
      ): PasswordResetRecord | null {
        if (!token || !token.includes(".")) return null;
        try {
          const [encoded, sig] = token.split(".");
          if (!encoded || !sig) return null;
          const expectedSig = signPayload(encoded);
          if (sig !== expectedSig) return null;

          const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
          const normalized = email.trim().toLowerCase();
          if (
            parsed.email === normalized &&
            parsed.otpHash === otpHash &&
            typeof parsed.exp === "number" &&
            parsed.exp > Date.now()
          ) {
            return {
              id: `stateless_${parsed.exp}`,
              email: normalized,
              otpHash,
              expiresAt: new Date(parsed.exp).toISOString(),
              used: false,
              createdAt: new Date().toISOString(),
            };
          }
        } catch {
          return null;
        }
        return null;
      },

      // Generate a self-verifying stateless reset token
      generateStatelessResetToken(email: string, expiresAt: Date): string {
        const payload = JSON.stringify({
          email: email.trim().toLowerCase(),
          exp: expiresAt.getTime(),
          nonce: crypto.randomBytes(12).toString("hex"),
        });
        const encoded = Buffer.from(payload, "utf-8").toString("base64url");
        const sig = signPayload(encoded);
        return `${encoded}.${sig}`;
      },

      // Save a new password reset OTP
  async createPasswordReset(
        email: string,
        otpHash: string,
        expiresAt: Date
      ): Promise < PasswordResetRecord > {
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

        // Await sync to Supabase password_resets table so Vercel Lambda doesn't freeze early
        const supabase = getDbSupabase();
        if(supabase) {
              try {
                await(supabase as any).from("password_resets").insert({
                  email: record.email,
                  otp_hash: record.otpHash,
                  expires_at: record.expiresAt,
                  used: false,
                  });
              } catch(err) {
                console.error("Supabase password_resets insert error:", err);
              }
            }

    return record;
        },

        // Find latest valid, unused OTP for email
  async findValidOtp(email: string, otpHash: string): Promise < PasswordResetRecord | null > {
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

            if(matching[0]) {
            return matching[0];
          }

          // Check Supabase password_resets table for serverless cross-instance persistence
          const supabase = getDbSupabase();
          if (supabase) {
            try {
              const { data, error } = await(supabase as any)
                .from("password_resets")
                .select("*")
                .eq("email", normalized)
                .eq("otp_hash", otpHash)
                .eq("used", false);

              if (!error && Array.isArray(data) && data.length > 0) {
                const validRows = data.filter(
                  (row: any) => row.expires_at && new Date(row.expires_at) > now
                );
                if (validRows.length > 0) {
                  const row = validRows[validRows.length - 1];
                  return {
                    id: row.id || `supa_${Date.now()}`,
                    email: row.email,
                    otpHash: row.otp_hash,
                    expiresAt: row.expires_at,
                    used: Boolean(row.used),
                    createdAt: new Date().toISOString(),
                  };
                }
              }
            } catch (err) {
              console.error("Supabase password_resets query error:", err);
            }
          }

          return null;
        },

        // Mark an OTP as used
  async markOtpUsed(id: string, otpHash ?: string): Promise < void> {
            loadDb();
    const record = memoryDb.passwordResets.find((r) => r.id === id);
            const targetHash = otpHash || record?.otpHash;
            if(record) {
              record.used = true;
              saveDb();
            }

              const supabase = getDbSupabase();
              if (supabase && targetHash) {
                try {
                  await(supabase as any)
                    .from("password_resets")
                    .update({ used: true })
          .eq("otp_hash", targetHash);
          } catch {
            // ignore
          }
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

        // Find valid unused reset token (supports both memoryDb and stateless HMAC reset tokens)
        findValidResetToken(token: string): ResetTokenRecord | null {
          loadDb();
          const now = new Date();
          const existing = memoryDb.resetTokens.find((t) => t.token === token);
          if (existing) {
            if (existing.used || new Date(existing.expiresAt) <= now) {
              return null;
            }
            return existing;
          }

          // Verify stateless HMAC-signed reset token for Vercel serverless cold-start compatibility
          if (token.includes(".")) {
            try {
              const [encoded, sig] = token.split(".");
              if (encoded && sig && signPayload(encoded) === sig) {
                const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
                if (
                  parsed?.email &&
                  typeof parsed.exp === "number" &&
                  parsed.exp > Date.now()
                ) {
                  return {
                    token,
                    email: parsed.email,
                    expiresAt: new Date(parsed.exp).toISOString(),
                    used: false,
                    createdAt: new Date().toISOString(),
                  };
                }
              }
            } catch {
              return null;
            }
          }

          return null;
        },

        // Invalidate / mark reset token as used
        markResetTokenUsed(token: string): void {
          loadDb();
    const record = memoryDb.resetTokens.find((t) => t.token === token);
          if(record) {
            record.used = true;
          } else {
            memoryDb.resetTokens.push({
              token,
              email: "",
              expiresAt: new Date(0).toISOString(),
              used: true,
              createdAt: new Date().toISOString(),
            });
          }
    saveDb();
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
