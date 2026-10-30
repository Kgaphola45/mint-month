"use client";

import React, { useState } from "react";
import { X, Lock, Mail, User as UserIcon, Wallet, ArrowRight, Check } from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";

export function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    setAuthModalOpen,
    login,
    register,
  } = useExpenseStore();

  const [mode, setMode] = useState<"login" | "register">(authModalMode || "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [monthlySalary, setMonthlySalary] = useState("25000");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync mode when modal opens
  React.useEffect(() => {
    if (authModalOpen) {
      setMode(authModalMode || "login");
      setError(null);
    }
  }, [authModalOpen, authModalMode]);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "login") {
      const res = login({ email, password });
      setLoading(false);
      if (res.success) {
        handleClose();
      } else {
        setError(res.error || "Invalid email or password");
      }
    } else {
      if (!name.trim()) {
        setError("Please enter your name.");
        setLoading(false);
        return;
      }
      if (password.length < 4) {
        setError("Password should be at least 4 characters.");
        setLoading(false);
        return;
      }

      const parsedSalary = parseFloat(monthlySalary) || 25000;
      const res = register({
        name: name.trim(),
        email,
        password,
        monthlySalary: parsedSalary,
      });

      setLoading(false);
      if (res.success) {
        handleClose();
      } else {
        setError(res.error || "Registration failed");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0D0D0C]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-[#FFFDF8] border border-[#0D0D0C]/[0.1] rounded-[28px] w-full max-w-md shadow-[0_24px_48px_rgba(0,0,0,0.12)] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-[#0D0D0C]/[0.08] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D0D0C]" />
              <span className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#0D0D0C]/50">
                Mint Month Accounts
              </span>
            </div>
            <h3 className="text-2xl font-medium tracking-tight text-[#0D0D0C] mt-1">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2.5 rounded-full border border-[#0D0D0C]/[0.08] hover:bg-[#FBF6EF] text-[#0D0D0C]/60 hover:text-[#0D0D0C] transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-1.5 mx-6 mt-5 bg-[#FBF6EF] rounded-full border border-[#0D0D0C]/[0.08] flex">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-medium rounded-full transition-all ${
              mode === "login"
                ? "bg-[#0D0D0C] text-[#FFFDF8] shadow-sm"
                : "text-[#0D0D0C]/60 hover:text-[#0D0D0C]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-medium rounded-full transition-all ${
              mode === "register"
                ? "bg-[#0D0D0C] text-[#FFFDF8] shadow-sm"
                : "text-[#0D0D0C]/60 hover:text-[#0D0D0C]"
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3.5 rounded-[16px] bg-[#ECD6E2]/50 border border-[#ECD6E2] text-xs text-[#0D0D0C] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D0D0C] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === "register" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/60">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0D0D0C]/40 stroke-[1.5]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Emmanuel Kgaphola"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm text-[#0D0D0C] placeholder:text-[#0D0D0C]/35 focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDF8] transition-all"
                />
              </div>
            </div>
          )}

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
                className="w-full h-12 pl-11 pr-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm text-[#0D0D0C] placeholder:text-[#0D0D0C]/35 focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDF8] transition-all"
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
                className="w-full h-12 pl-11 pr-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm text-[#0D0D0C] placeholder:text-[#0D0D0C]/35 focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDF8] transition-all"
              />
            </div>
          </div>

          {mode === "register" && (
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
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm text-[#0D0D0C] placeholder:text-[#0D0D0C]/35 focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDF8] transition-all"
                />
              </div>
              <p className="text-[11px] text-[#0D0D0C]/50 pl-2">
                Used to compute your Safe-to-Spend daily allowance.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-2 rounded-full bg-[#0D0D0C] text-[#FFFDF8] text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </button>
        </form>
      </div>
    </div>
  );
}

