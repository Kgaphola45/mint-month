"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ArrowLeft, RefreshCw, ShieldCheck, Info } from "lucide-react";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const initialDevOtp = searchParams.get("devOtp") || "";
  const initialSession = searchParams.get("session") || "";
  const wasSent = searchParams.get("sent") === "1";

  const [otpDigits, setOtpDigits] = useState<string[]>(() => {
    if (initialDevOtp && initialDevOtp.length === 6) {
      return initialDevOtp.split("");
    }
    return ["", "", "", "", "", ""];
  });

  const [devOtp, setDevOtp] = useState<string>(initialDevOtp);
  const [sessionToken, setSessionToken] = useState<string>(initialSession);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 60-second countdown timer for resending
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Focus input on mount
  useEffect(() => {
    if (!initialDevOtp) {
      inputRefs.current[0]?.focus();
    }
  }, [initialDevOtp]);

  const handleChange = (index: number, value: string) => {
    const clean = value.replace(/[^0-9]/g, "");
    if (!clean) {
      const updated = [...otpDigits];
      updated[index] = "";
      setOtpDigits(updated);
      return;
    }

    const char = clean.slice(-1);
    const updated = [...otpDigits];
    updated[index] = char;
    setOtpDigits(updated);

    if (index < 5 && char) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasted) return;

    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || "";
    }
    setOtpDigits(updated);

    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const fullOtp = otpDigits.join("");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailParam.trim(),
          otp: fullOtp,
          otpSessionToken: sessionToken || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Invalid or expired code. Please try again.");
        setLoading(false);
        return;
      }

      router.push(
        `/reset-password?token=${encodeURIComponent(data.resetToken)}&email=${encodeURIComponent(
          emailParam.trim()
        )}`
      );
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending || !emailParam) return;
    setResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailParam.trim(),
          localUserExists: true,
        }),
      });

      const data = await res.json();

      setTimer(60);
      setResendSuccess(true);

      if (data?.otpSessionToken) {
        setSessionToken(data.otpSessionToken);
      }

      const bypass = data?.devBypassOtp || data?.devOtp;
        if (bypass && typeof bypass === "string" && bypass.length === 6) {
          setDevOtp(bypass);
          setOtpDigits(bypass.split(""));
        } else {
          setDevOtp("");
          setOtpDigits(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        }

        setTimeout(() => setResendSuccess(false), 5000);
      } catch {
        setError("Failed to resend code. Please try again.");
      } finally {
        setResending(false);
      }
    };

    return (
      <div className="min-h-[82vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] rounded-[28px] p-7 sm:p-9 shadow-[0_24px_48px_rgba(0,0,0,0.06)] space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D0D0C]" />
              <span className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#0D0D0C]/50">
                Two-Step Verification
              </span>
            </div>
            <h1 className="text-3xl font-medium tracking-tight text-[#0D0D0C]">
              Verify code
            </h1>
            <p className="text-sm text-[#0D0D0C]/56 mt-1.5 leading-relaxed">
              Enter the 6-digit verification code for{" "}
              <span className="font-medium text-[#0D0D0C]">
                {emailParam || "your email"}
              </span>
              . The code expires in 10 minutes.
            </p>
          </div>

          {devOtp && (
            <div className="p-4 rounded-[18px] bg-[#F6DE68]/30 border border-[#F6DE68]/70 text-xs text-[#0D0D0C] space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <Info className="w-4 h-4 shrink-0 text-[#0D0D0C]" />
                <span>Instant Verification Code</span>
              </div>
              <p className="font-medium text-[#0D0D0C] bg-[#FFFDFA] p-2.5 rounded-[12px] border border-[#0D0D0C]/[0.1]">
                Your verification code is: <strong className="font-mono text-sm tracking-widest">{devOtp}</strong> (pre-filled below).
              </p>
            </div>
          )}

          {wasSent && (
            <div className="p-3.5 rounded-[16px] bg-[#96CE96]/30 border border-[#96CE96]/60 text-xs text-[#0D0D0C] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0D0D0C] shrink-0" />
              <span>Code sent! Please check your inbox and Junk/Spam folder.</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-[16px] bg-[#ECD6E2]/60 border border-[#ECD6E2] text-xs text-[#0D0D0C] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D0D0C] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resendSuccess && (
            <div className="p-3.5 rounded-[16px] bg-[#96CE96]/30 border border-[#96CE96]/60 text-xs text-[#0D0D0C] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0D0D0C] shrink-0" />
              <span>A fresh 6-digit code has been generated.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 6 OTP Boxes */}
            <div className="flex items-center justify-between gap-2 sm:gap-2.5">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  pattern="[0-9]*"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 sm:w-13 sm:h-16 text-center text-2xl font-semibold rounded-[16px] border border-[#0D0D0C]/[0.14] bg-[#FBF6EF] text-[#0D0D0C] focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDFA] transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]"
                />
              ))}
            </div>

            {/* Black Pill Submit Button */}
            <button
              type="submit"
              disabled={loading || fullOtp.length !== 6}
              className="w-full h-12 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? "Verifying..." : "Verify Code"}</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </button>
          </form>

          {/* Resend Timer & Links */}
          <div className="space-y-3 pt-1 text-center">
            <div className="text-xs text-[#0D0D0C]/60">
              {timer > 0 ? (
                <span>
                  Resend code in <strong className="text-[#0D0D0C] font-semibold">{timer}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="inline-flex items-center gap-1.5 text-xs text-[#0D0D0C] font-medium hover:underline underline-offset-4"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                  <span>Resend verification code</span>
                </button>
              )}
            </div>

            <div>
              <Link
                href="/forgot-password"
                className="inline-flex items-center gap-1.5 text-xs text-[#0D0D0C]/60 hover:text-[#0D0D0C] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Use a different email address</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  export default function VerifyOtpPage() {
    return (
      <Suspense
        fallback={
          <div className="min-h-[82vh] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#0D0D0C]/20 border-t-[#0D0D0C] animate-spin" />
          </div>
        }
      >
        <VerifyOtpContent />
      </Suspense>
    );
  }
