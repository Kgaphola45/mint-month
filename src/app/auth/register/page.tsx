"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Wallet, ArrowRight } from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useExpenseStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [salary, setSalary] = useState("25000");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please provide your full name.");
      return;
    }
    if (password.length < 4) {
      setError("Password should be at least 4 characters.");
      return;
    }

    setLoading(true);
    const parsedSalary = parseFloat(salary) || 25000;
    const res = register({
      name: name.trim(),
      email,
      password,
      monthlySalary: parsedSalary,
    });

    if (res.success) {
      // Trigger Welcome / Account Confirmation email via Outlook
      fetch("/api/auth/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      }).catch(() => {});

      setLoading(false);
      router.push("/");
    } else {
      setLoading(false);
      setError(res.error || "Registration failed.");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] rounded-[28px] p-7 sm:p-9 shadow-[0_24px_48px_rgba(0,0,0,0.06)] space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D0D0C]" />
            <span className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#0D0D0C]/50">
              mint month auth
            </span>
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-[#0D0D0C]">
            Create your account
          </h1>
          <p className="text-sm text-[#0D0D0C]/56 mt-1">
            Start a fresh, private monthly expense and debt tracking vault.
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
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0D0D0C]/40 stroke-[1.5]" />
              <input
                type="text"
                required
                placeholder="e.g. Neo Mokwena"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm text-[#0D0D0C] placeholder:text-[#0D0D0C]/35 focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDFA] transition-all"
              />
            </div>
          </div>

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
                className="w-full h-12 pl-11 pr-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm text-[#0D0D0C] placeholder:text-[#0D0D0C]/35 focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDFA] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/60">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0D0D0C]/40 stroke-[1.5]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm text-[#0D0D0C] placeholder:text-[#0D0D0C]/35 focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDFA] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/60">
              Monthly Take-Home Salary (ZAR)
            </label>
            <div className="relative">
              <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0D0D0C]/40 stroke-[1.5]" />
              <input
                type="number"
                min="1000"
                placeholder="25000"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm text-[#0D0D0C] placeholder:text-[#0D0D0C]/35 focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDFA] transition-all"
              />
            </div>
            <p className="text-[11px] text-[#0D0D0C]/50 pl-2">
              Used to calculate your Safe-to-Spend daily allowance.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </button>
        </form>

        <div className="text-center text-xs text-[#0D0D0C]/60 pt-2">
          Already registered?{" "}
          <Link
            href="/auth/login"
            className="text-[#0D0D0C] font-medium underline underline-offset-4"
          >
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}

