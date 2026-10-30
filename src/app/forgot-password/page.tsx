"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok && res.status !== 200) {
        setError(data.error || "Unable to send reset code. Please try again.");
        setLoading(false);
        return;
      }

      // Navigate to OTP verification page with delivery metadata
      const queryParams = new URLSearchParams({
        email: email.trim(),
      });
      if (data.sandbox) {
        queryParams.set("sandbox", "1");
        if (data.devOtp) queryParams.set("devOtp", data.devOtp);
        if (data.allowedEmail) queryParams.set("allowedEmail", data.allowedEmail);
      } else if (data.sent) {
        queryParams.set("sent", "1");
      }

      router.push(`/verify-otp?${queryParams.toString()}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#FFFDF8] border border-[#0D0D0C]/[0.1] rounded-[28px] p-7 sm:p-9 shadow-[0_24px_48px_rgba(0,0,0,0.06)] space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D0D0C]" />
            <span className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#0D0D0C]/50">
              Account Recovery
            </span>
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-[#0D0D0C]">
            Forgot password?
          </h1>
          <p className="text-sm text-[#0D0D0C]/56 mt-1.5 leading-relaxed">
            Enter your email address and we&apos;ll send you a 6-digit one-time code to reset your password.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-[16px] bg-[#ECD6E2]/60 border border-[#ECD6E2] text-xs text-[#0D0D0C] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D0D0C] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/60">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0D0D0C]/40 stroke-[1.5]" />
              <input
                type="email"
                required
                placeholder="you@domain.co.za"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                className="w-full h-12 pl-11 pr-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm text-[#0D0D0C] placeholder:text-[#0D0D0C]/35 focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDF8] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full h-12 rounded-full bg-[#0D0D0C] text-[#FFFDF8] text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? "Sending code..." : "Send code"}</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </button>
        </form>

        <div className="pt-2 text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#0D0D0C]/60 hover:text-[#0D0D0C] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

