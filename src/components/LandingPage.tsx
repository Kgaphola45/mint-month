"use client";

import React, { useState } from "react";
import Link from "next/link";
import { fireConfetti } from "@/lib/confetti";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  Download,
  Receipt,
  PiggyBank,
  TrendingUp,
  BookOpen,
  Zap,
  CheckCircle2,
  HardDrive,
  Calendar,
  Clock,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";

export function LandingPage() {
  const { setAuthModalOpen } = useExpenseStore();

  // Interactive Demo State
  const [demoAmount, setDemoAmount] = useState<number>(1450);
  const [demoRemainingDays, setDemoRemainingDays] = useState<number>(14);

  // Baseline scenario for interactive demo
  const baselineSafePool = 2590; // R2,590 safe discretionary buffer
  const baselineDaily = Math.round((baselineSafePool / demoRemainingDays) * 100) / 100; // ~R185/day

  // Simulated consequence
  const simulatedPool = Math.max(0, baselineSafePool - demoAmount);
  const simulatedDaily = Math.round((simulatedPool / demoRemainingDays) * 100) / 100;
  const isAffordable = demoAmount <= baselineSafePool;

  const handleConfetti = () => {
    fireConfetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#96CE96", "#F99654", "#DFE9D4", "#0D0D0C"],
    });
  };

  return (
    <div className="min-h-screen bg-[#FBF6EF] text-[#0D0D0C] font-sans antialiased relative selection:bg-[#0D0D0C]/10 selection:text-[#0D0D0C] overflow-x-hidden">
      {/* Subtle background radial ambient glows */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(circle at 18% 12%, rgba(246, 222, 104, 0.12), transparent 35%),
            radial-gradient(circle at 85% 18%, rgba(249, 150, 84, 0.10), transparent 40%),
            radial-gradient(circle at 50% 60%, rgba(150, 206, 150, 0.08), transparent 45%),
            radial-gradient(circle at 80% 90%, rgba(236, 214, 226, 0.12), transparent 45%)
          `,
        }}
      />

      {/* 80px tall Landing Header (Vela Editorial Style) */}
      <header className="sticky top-0 z-40 w-full h-20 border-b border-[#0D0D0C]/[0.08] bg-[#FBF6EF]/90 backdrop-blur-md flex items-center transition-colors">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo: dot + "mint month" in one line, 20px, 600 weight */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-3 h-3 rounded-full bg-[#0D0D0C] shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-[20px] tracking-[-0.02em] text-[#0D0D0C]">
              mint month
            </span>
          </Link>

          {/* Right: Sign In + Register (black pill) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setAuthModalOpen(true, "login")}
              className="text-xs font-medium text-[#0D0D0C] hover:text-[#0D0D0C]/70 px-3 py-1.5 transition-colors"
            >
              Sign In
            </button>

            <button
              onClick={() => setAuthModalOpen(true, "register")}
              className="h-10 px-5 rounded-full bg-[#0D0D0C] hover:bg-[#0D0D0C]/90 active:scale-95 text-[#FFFDFA] text-xs font-medium shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FFFDFA] text-xs font-medium text-[#0D0D0C] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>🇿🇦 Built for South Africans • 100% Local-First</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-semibold tracking-[-0.035em] text-[#0D0D0C] leading-[1.06]">
              Your money,
              <br />
              <span className="underline decoration-[#0D0D0C]/20 decoration-2 underline-offset-8">
                on your terms.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#0D0D0C]/65 max-w-xl font-normal leading-relaxed">
              Privacy-first monthly expense tracker for South Africans. No bank linking. No data selling. Just your 30-day tally.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => setAuthModalOpen(true, "register")}
                className="h-12 px-7 rounded-full bg-[#0D0D0C] hover:bg-[#0D0D0C]/90 active:scale-95 text-[#FFFDFA] text-sm font-medium shadow-[0_8px_20px_rgba(13,13,12,0.14)] transition-all flex items-center justify-center gap-2 group"
              >
                <span>Start Tracking Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <a
                href="#interactive-demo"
                className="h-12 px-7 rounded-full border border-[#0D0D0C]/[0.16] hover:border-[#0D0D0C] bg-[#FFFDFA] hover:bg-[#FBF6EF] text-sm font-medium text-[#0D0D0C] shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>See how it works</span>
                <ChevronRight className="w-4 h-4 text-[#0D0D0C]/50" />
              </a>
            </div>

            <div className="flex items-center gap-4 pt-3 text-xs text-[#0D0D0C]/50">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                Zero bank credentials
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                Takes 10 seconds
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                Free forever
              </span>
            </div>
          </div>

          {/* Right Column: Floating Editorial Card Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md w-full">
              {/* Soft blur backdrop aura */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#F6DE68]/20 via-[#F99654]/15 to-[#DFE9D4]/30 rounded-[32px] blur-xl opacity-70" />

              {/* Mockup Card Container */}
              <div className="relative p-6 sm:p-7 rounded-[28px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_24px_56px_-12px_rgba(13,13,12,0.12)] space-y-5">
                {/* Mockup Top Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-[#0D0D0C]/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0D0D0C]" />
                    <span className="text-xs font-semibold text-[#0D0D0C]">November 2026</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] text-[11px] text-[#0D0D0C]/70">
                    Payday: 25th (14d)
                  </span>
                </div>

                {/* Big Safe-to-Spend Callout */}
                <div className="p-4 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] space-y-1">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[#0D0D0C]/45 block">
                    Guilt-Free Daily Allowance
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0D0D0C]">
                      R280.00
                    </span>
                    <span className="text-xs text-[#0D0D0C]/50">/ day</span>
                  </div>
                  <span className="text-[11px] text-[#0D0D0C]/60 block pt-0.5">
                    Safe buffer: R3,920 free of fixed obligations
                  </span>
                </div>

                {/* Multi-Segment Gauge */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-[#0D0D0C]/60">
                    <span>Quarantined Contracts</span>
                    <span>Safe Cushion</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#0D0D0C]/[0.06] overflow-hidden flex">
                    <div className="w-[42%] h-full bg-[#0D0D0C]" title="Debit Orders (42%)" />
                    <div className="w-[28%] h-full bg-[#F99654]" title="Spent so far (28%)" />
                    <div className="w-[30%] h-full bg-[#96CE96]" title="Safe Buffer (30%)" />
                  </div>
                </div>

                {/* Quarantined Debit Orders Preview */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-medium text-[#0D0D0C]/60 block">
                    Upcoming Protected Commitments
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#FBF6EF]/70 border border-[#0D0D0C]/[0.04]">
                      <span className="text-[#0D0D0C]/80 font-medium">VOX Fibre WiFi</span>
                      <span className="font-semibold text-[#0D0D0C]">R899.00</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#FBF6EF]/70 border border-[#0D0D0C]/[0.04]">
                      <span className="text-[#0D0D0C]/80 font-medium">PayJustNow Split</span>
                      <span className="font-semibold text-[#0D0D0C]">R550.00</span>
                    </div>
                  </div>
                </div>

                {/* Floating "What-If" Badge */}
                <div className="p-3 rounded-2xl bg-[#DFE9D4] border border-emerald-300 text-xs font-medium text-[#0D0D0C] flex items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-800 fill-emerald-800" />
                    <span>R0 tomorrow → R301/day (+R21 boost)</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-900 bg-white/40 px-2 py-0.5 rounded-full">
                    What-If
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 4-PILLAR GRID */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0D0D0C]/50">
            Four Pillars
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#0D0D0C]">
            Track. Budget. Analyze. Save.
          </h2>
          <p className="text-sm sm:text-base text-[#0D0D0C]/60">
            Everything you need for mindful cashflow management, stripped of bloat and spreadsheets.
          </p>
        </div>

        {/* 2x2 Grid Desktop, 1 Col Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Card 1: Track */}
          <div className="group relative p-8 sm:p-9 rounded-[26px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_4px_16px_rgba(13,13,12,0.02)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              {/* Glossy 3D style icon container (Lemon glow) */}
              <div className="w-13 h-13 w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FDF0CD] via-[#F6DE68] to-[#FFE885] border border-amber-300/60 shadow-[0_6px_16px_rgba(246,222,104,0.35)] flex items-center justify-center text-[#0D0D0C]">
                <Receipt className="w-5 h-5 stroke-[2]" />
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#0D0D0C]/40">
                  Pillar 01 • Instant Entry
                </span>
                <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#0D0D0C] mt-1">
                  Add expense in 2s
                </h3>
              </div>

              <p className="text-sm text-[#0D0D0C]/65 leading-relaxed">
                Natural language command palette: type <code className="bg-[#FBF6EF] px-1.5 py-0.5 rounded text-xs font-mono text-[#0D0D0C]">Add R250 lunch</code> anywhere to auto-categorize and log outlays without touching your mouse.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-[#0D0D0C]/[0.06] flex items-center justify-between text-xs text-[#0D0D0C]/60">
              <span className="font-medium text-[#0D0D0C]">⌘K Linear Command Palette</span>
              <span>Fast & Keyboard-first</span>
            </div>
          </div>

          {/* Card 2: Budget */}
          <div className="group relative p-8 sm:p-9 rounded-[26px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_4px_16px_rgba(13,13,12,0.02)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              {/* Glossy 3D style icon container (Peach glow) */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F8DCC7] via-[#F99654] to-[#FFA870] border border-orange-300/60 shadow-[0_6px_16px_rgba(249,150,84,0.35)] flex items-center justify-center text-[#FFFDFA]">
                <Lock className="w-5 h-5 stroke-[2]" />
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#0D0D0C]/40">
                  Pillar 02 • Zero Surprises
                </span>
                <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#0D0D0C] mt-1">
                  Ring-fenced debit orders
                </h3>
              </div>

              <p className="text-sm text-[#0D0D0C]/65 leading-relaxed">
                Quarantines fixed contracts, WiFi, and loan repayments on day 1 so your daily allowance is truly guilt-free discretionary cash.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-[#0D0D0C]/[0.06] flex items-center justify-between text-xs text-[#0D0D0C]/60">
              <span className="font-medium text-[#0D0D0C]">Daily Safe-to-Spend Meter</span>
              <span>Protected buffer</span>
            </div>
          </div>

          {/* Card 3: Analyze */}
          <div className="group relative p-8 sm:p-9 rounded-[26px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_4px_16px_rgba(13,13,12,0.02)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              {/* Glossy 3D style icon container (Lavender glow) */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ECD6E2] via-[#E2A7C3] to-[#F1BBD4] border border-pink-300/60 shadow-[0_6px_16px_rgba(226,167,195,0.35)] flex items-center justify-center text-[#0D0D0C]">
                <BookOpen className="w-5 h-5 stroke-[2]" />
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#0D0D0C]/40">
                  Pillar 03 • Storytelling
                </span>
                <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#0D0D0C] mt-1">
                  Month-End Editorial Story
                </h3>
              </div>

              <p className="text-sm text-[#0D0D0C]/65 leading-relaxed">
                On the 1st of every month, read a publication-grade 3-slide magazine review of your category shifts, no-spend days, and debt paydown momentum.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-[#0D0D0C]/[0.06] flex items-center justify-between text-xs text-[#0D0D0C]/60">
              <span className="font-medium text-[#0D0D0C]">Monthly Wrapped Story</span>
              <span>Retina PNG & PDF export</span>
            </div>
          </div>

          {/* Card 4: Save */}
          <div className="group relative p-8 sm:p-9 rounded-[26px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_4px_16px_rgba(13,13,12,0.02)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              {/* Glossy 3D style icon container (Sage glow) */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#DFE9D4] via-[#96CE96] to-[#B3E5B3] border border-emerald-300/60 shadow-[0_6px_16px_rgba(150,206,150,0.35)] flex items-center justify-center text-[#0D0D0C]">
                <Sparkles className="w-5 h-5 stroke-[2]" />
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#0D0D0C]/40">
                  Pillar 04 • Pre-Purchase Decision
                </span>
                <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#0D0D0C] mt-1">
                  Can I Afford It? simulator
                </h3>
              </div>

              <p className="text-sm text-[#0D0D0C]/65 leading-relaxed">
                Test an outlay *before* you swipe: see exactly how buying running shoes or dinner reduces your daily living runway for the rest of the month.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-[#0D0D0C]/[0.06] flex items-center justify-between text-xs text-[#0D0D0C]/60">
              <span className="font-medium text-[#0D0D0C]">Consequence Engine</span>
              <span>Hotkey: A</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRIVACY STRIP */}
      <section className="border-t border-[#0D0D0C]/[0.08] bg-[#FFFDFA]/60 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {/* Column 1 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl border border-[#0D0D0C]/[0.08] bg-[#FFFDFA] flex items-center justify-center text-[#0D0D0C] shrink-0 shadow-sm">
                <HardDrive className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-[#0D0D0C]">
                  Local-First (IndexedDB)
                </h4>
                <p className="text-xs text-[#0D0D0C]/60 leading-relaxed">
                  All transaction ledgers are stored strictly in your browser storage. Zero tracking beacons, no data harvesting.
                </p>
              </div>
            </div>

            {/* Column 2 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl border border-[#0D0D0C]/[0.08] bg-[#FFFDFA] flex items-center justify-center text-[#0D0D0C] shrink-0 shadow-sm">
                <ShieldAlert className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-[#0D0D0C]">
                  No Bank Login Ever
                </h4>
                <p className="text-xs text-[#0D0D0C]/60 leading-relaxed">
                  Never hand over your banking credentials, account numbers, or OTPs. Enter transactions safely on your terms.
                </p>
              </div>
            </div>

            {/* Column 3 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl border border-[#0D0D0C]/[0.08] bg-[#FFFDFA] flex items-center justify-center text-[#0D0D0C] shrink-0 shadow-sm">
                <Download className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-[#0D0D0C]">
                  Export CSV Anytime
                </h4>
                <p className="text-xs text-[#0D0D0C]/60 leading-relaxed">
                  100% data portability. Download your full monthly records in clean CSV spreadsheet or JSON backup formats anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE DEMO ("Try it without signing up") */}
      <section id="interactive-demo" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 lg:p-14 rounded-[32px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_16px_48px_rgba(13,13,12,0.04)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left side text */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] text-xs font-medium text-[#0D0D0C]">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Live Interactive Sandbox</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0D0D0C]">
                Try it without signing up
              </h2>

              <p className="text-sm sm:text-base text-[#0D0D0C]/65 leading-relaxed">
                Test the <strong className="text-[#0D0D0C]">Can I Afford It?</strong> decision engine right now. Simulate an impulse buy (e.g. running shoes, dining out, or tech gear) to see the exact consequence on your daily living allowance before swiping your card.
              </p>

              {/* Preset quick test pills */}
              <div className="pt-2">
                <span className="text-xs text-[#0D0D0C]/50 block mb-2">
                  Tap to test common outlays:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "+R150 Lunch", val: 150 },
                    { label: "+R350 Dinner", val: 350 },
                    { label: "+R750 Weekend out", val: 750 },
                    { label: "+R1,450 Running shoes", val: 1450 },
                    { label: "+R3,200 Getaway", val: 3200 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setDemoAmount(preset.val)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        demoAmount === preset.val
                          ? "bg-[#0D0D0C] text-[#FFFDFA] shadow-sm"
                          : "bg-[#FBF6EF] border border-[#0D0D0C]/[0.1] text-[#0D0D0C] hover:border-[#0D0D0C]/30"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side live interactive simulator */}
            <div className="lg:col-span-6">
              <div className="p-6 sm:p-7 rounded-[26px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] space-y-5">
                <div className="flex items-center justify-between text-xs text-[#0D0D0C]/60 pb-3 border-b border-[#0D0D0C]/[0.06]">
                  <span>Baseline Runway: <strong>14 days to payday</strong></span>
                  <span>Buffer: <strong>R{baselineSafePool.toLocaleString()}</strong></span>
                </div>

                {/* Input Field */}
                <div className="space-y-1.5">
                  <label htmlFor="sim-amount" className="text-xs font-semibold text-[#0D0D0C] block">
                    Planned Purchase Amount (ZAR):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#0D0D0C]/50">
                      R
                    </span>
                    <input
                      id="sim-amount"
                      type="number"
                      min={0}
                      max={10000}
                      step={50}
                      value={demoAmount === 0 ? "" : demoAmount}
                      onChange={(e) => setDemoAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="e.g. 1450"
                      className="w-full h-11 pl-8 pr-4 rounded-xl border border-[#0D0D0C]/[0.15] bg-[#FFFDFA] text-[#0D0D0C] font-semibold text-base focus:outline-none focus:ring-2 focus:ring-[#0D0D0C]"
                    />
                  </div>
                </div>

                {/* Instant Dynamic Verdict Callout */}
                <div
                  className={`p-4 rounded-[18px] border transition-all ${
                    isAffordable
                      ? "bg-[#DFE9D4] border-emerald-300 text-emerald-950"
                      : "bg-rose-100 border-rose-300 text-rose-950"
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium text-xs">
                    {isAffordable ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 stroke-[2]" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-rose-600" />
                    )}
                    <span>
                      {isAffordable ? "You can afford it!" : "Exceeds remaining discretionary cushion"}
                    </span>
                  </div>

                  <div className="text-xl sm:text-2xl font-semibold tracking-tight mt-1 text-[#0D0D0C]">
                    {isAffordable
                      ? `R${Math.round(simulatedDaily)}/day left`
                      : `Encroaches R${Math.abs(simulatedPool)} into debit order reserve`}
                  </div>

                  <p className="text-xs text-[#0D0D0C]/75 mt-1 leading-snug">
                    {isAffordable
                      ? `Buying this for R${demoAmount.toLocaleString()} reduces your daily allowance from R${Math.round(baselineDaily)}/day → R${Math.round(simulatedDaily)}/day for the remaining 14 days.`
                      : `This purchase would leave R0 discretionary cash until payday.`}
                  </p>
                </div>

                {/* Confetti Micro-delight */}
                <button
                  onClick={handleConfetti}
                  className="w-full py-2.5 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FFFDFA] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-xs font-medium text-[#0D0D0C] transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Test Celebrate Conscious Spending</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER CTA */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0D0D0C]/50">
          November 2026 Cycle
        </span>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#0D0D0C] max-w-3xl mx-auto leading-tight">
          Start your November 2026 tally
        </h2>

        <p className="text-base sm:text-lg text-[#0D0D0C]/65 max-w-xl mx-auto">
          Take control of your month without spreadsheets, complicated formulas, or giving away bank credentials.
        </p>

        <div className="pt-2">
          <button
            onClick={() => setAuthModalOpen(true, "register")}
            className="h-12 px-8 rounded-full bg-[#0D0D0C] hover:bg-[#0D0D0C]/90 active:scale-95 text-[#FFFDFA] text-sm font-medium shadow-[0_8px_24px_rgba(13,13,12,0.14)] transition-all inline-flex items-center gap-2 group"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <p className="text-xs text-[#0D0D0C]/45 pt-1">
          Free forever • 500MB • South Africa
        </p>
      </section>

      {/* Hairline Footer */}
      <footer className="border-t border-[#0D0D0C]/[0.08] py-8 px-4 sm:px-6 lg:px-8 bg-[#FFFDFA]/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#0D0D0C]/56">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0D0D0C]" />
            <span className="font-semibold text-[#0D0D0C]">mint month</span>
            <span>© 2026</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setAuthModalOpen(true, "login")}
              className="hover:text-[#0D0D0C] transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthModalOpen(true, "register")}
              className="hover:text-[#0D0D0C] transition-colors"
            >
              Register
            </button>
            <Link href="/settings" className="hover:text-[#0D0D0C] transition-colors">
              Privacy & Settings
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

