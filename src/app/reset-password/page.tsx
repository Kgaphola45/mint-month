"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { storage } from "@/lib/storage";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Reset token is missing or invalid. Please request a new code.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken: token,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to reset password. Please try again.");
        setLoading(false);
        return;
      }

      // Sync local user credentials if present
      if (emailParam) {
        storage.updateUserPassword(emailParam, newPassword);
      }

      setIsSuccess(true);
      setLoading(false);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[82vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#FFFDF8] border border-[#0D0D0C]/[0.1] rounded-[28px] p-7 sm:p-9 shadow-[0_24px_48px_rgba(0,0,0,0.06)] text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-[#96CE96]/30 border border-[#96CE96] flex items-center justify-center mx-auto text-[#0D0D0C]">
            <CheckCircle2 className="w-8 h-8 stroke-[1.75]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-medium tracking-tight text-[#0D0D0C]">
              Password updated
            </h1>
            <p className="text-sm text-[#0D0D0C]/56 leading-relaxed">
              Your password has been successfully reset. You can now use your new credentials to sign in.
            </p>
          </div>

          <button
            onClick={() => router.push("/auth/login")}
            className="w-full h-12 rounded-full bg-[#0D0D0C] text-[#FFFDF8] text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#FFFDF8] border border-[#0D0D0C]/[0.1] rounded-[28px] p-7 sm:p-9 shadow-[0_24px_48px_rgba(0,0,0,0.06)] space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D0D0C]" />
            <span className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#0D0D0C]/50">
              New Credentials
            </span>
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-[#0D0D0C]">
            Set new password
          </h1>
          <p className="text-sm text-[#0D0D0C]/56 mt-1.5 leading-relaxed">
            Choose a strong password with at least 6 characters for your vault account.
          </p>
        </div>

        {!token && (
          <div className="p-3.5 rounded-[16px] bg-[#F6DE68]/40 border border-[#F6DE68] text-xs text-[#0D0D0C] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#0D0D0C] shrink-0" />
            <span>
              Missing reset token. Please{" "}
              <Link href="/forgot-password" className="underline font-semibold">
                request a new reset link
              </Link>
              .
            </span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-[16px] bg-[#ECD6E2]/60 border border-[#ECD6E2] text-xs text-[#0D0D0C] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D0D0C] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/60">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0D0D0C]/40 stroke-[1.5]" />
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full h-12 pl-11 pr-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm text-[#0D0D0C] placeholder:text-[#0D0D0C]/35 focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDF8] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/60">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0D0D0C]/40 stroke-[1.5]" />
              <input
                type="password"
                required
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full h-12 pl-11 pr-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm text-[#0D0D0C] placeholder:text-[#0D0D0C]/35 focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDF8] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token || !newPassword || !confirmPassword}
            className="w-full h-12 rounded-full bg-[#0D0D0C] text-[#FFFDF8] text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? "Updating password..." : "Update Password"}</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </button>
        </form>

        <div className="pt-2 text-center">
          <Link
            href="/auth/login"
            className="text-xs text-[#0D0D0C]/60 hover:text-[#0D0D0C] transition-colors"
          >
            Cancel and return to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[82vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#0D0D0C]/20 border-t-[#0D0D0C] animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
