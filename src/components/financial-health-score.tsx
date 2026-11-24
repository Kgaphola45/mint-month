"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import {
  ShieldCheck,
  PiggyBank,
  CreditCard,
  PieChart,
  Clock,
  Wallet,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  X,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { HealthPillarAssessment, HealthPillarId } from "@/types";

function getPillarIcon(id: HealthPillarId) {
  switch (id) {
    case "savings_rate":
      return PiggyBank;
    case "debt_to_income":
      return CreditCard;
    case "emergency_fund":
      return ShieldCheck;
    case "budget_adherence":
      return PieChart;
    case "commitments":
      return Clock;
    case "income_stability":
      return Wallet;
    default:
      return Sparkles;
  }
}

export function FinancialHealthScore() {
  const { getFinancialHealthScore, selectedMonth } = useExpenseStore();
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const explainerDialogRef = useRef<HTMLDialogElement>(null);
  const explainerTitleId = useId();

  const health = getFinancialHealthScore(selectedMonth);

  // Native <dialog> control with light-dismiss compliance
  useEffect(() => {
    const dialog = explainerDialogRef.current;
    if (!dialog) return;

    if (isExplainerOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isExplainerOpen]);

  const scrollToAnchor = (anchor?: string) => {
    if (!anchor) return;
    if (anchor.startsWith("/")) {
      window.location.href = anchor;
      return;
    }
    const element = document.querySelector(anchor);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getTierColorClass = (tier: "healthy" | "warning" | "critical") => {
    switch (tier) {
      case "healthy":
        return "bg-emerald-50 text-emerald-800 border-emerald-200/80";
      case "warning":
        return "bg-amber-50 text-amber-900 border-amber-200/80";
      case "critical":
        return "bg-rose-50 text-rose-900 border-rose-200/80";
    }
  };

  const getBarColorClass = (tier: "healthy" | "warning" | "critical") => {
    switch (tier) {
      case "healthy":
        return "bg-emerald-600";
      case "warning":
        return "bg-amber-500";
      case "critical":
        return "bg-rose-500";
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-7">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#0D0D0C]/[0.06]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] sm:text-[15px] font-normal text-[#0D0D0C]/56">
              Financial Resilience & Longevity Index
            </span>
            <span className="px-2.5 py-0.5 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FBF6EF] text-[11px] text-[#0D0D0C] font-normal">
              Tier {health.tierNumber}: {health.grade}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C] mt-1 font-serif">
            Financial Health Score
          </h2>
          <p className="text-sm text-[#0D0D0C]/56 mt-1 max-w-2xl">
            A comprehensive monthly assessment of your savings rate, debt-to-income, emergency cushion, budget adherence, fixed commitments, and income stability.
          </p>
        </div>

        <button
          onClick={() => setIsExplainerOpen(true)}
          className="h-9 px-4 rounded-full border border-[#0D0D0C]/[0.12] hover:bg-[#FBF6EF] text-xs font-medium text-[#0D0D0C] inline-flex items-center gap-1.5 transition-all shrink-0 self-start md:self-center"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#0D0D0C]/60" />
          <span>Scoring Rubric</span>
        </button>
      </div>

      {/* 2. Primary Score Card (Vela Hero Ring & Executive Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 sm:p-7 rounded-[22px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.08]">
        {/* Left: Progress Ring */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center text-center space-y-3">
          <div className="relative flex items-center justify-center">
            {/* Semantic <progress> ring with conic-gradient fallback */}
            <div
              className="w-36 h-36 rounded-full flex items-center justify-center relative"
              style={{
                background: `conic-gradient(#0D0D0C ${health.overallScore * 3.6}deg, rgba(13, 13, 12, 0.08) 0deg)`,
              }}
            >
              {/* Inner cutout to form ring */}
              <div className="w-[114px] h-[114px] rounded-full bg-[#FBF6EF] flex flex-col items-center justify-center shadow-inner">
                <span className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-[#0D0D0C] leading-none">
                  {health.overallScore}
                </span>
                <span className="text-[11px] font-sans font-normal text-[#0D0D0C]/45 uppercase tracking-wider mt-1">
                  out of 100
                </span>
              </div>
            </div>
            {/* Hidden semantic progress for screen readers */}
            <progress
              value={health.overallScore}
              max={100}
              aria-label="Financial health score out of 100"
              aria-valuetext={`${health.overallScore} out of 100 points, rated ${health.grade}`}
              className="sr-only"
            >
              {health.overallScore}%
            </progress>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs font-medium shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{health.grade} ({health.overallScore}/100)</span>
          </div>
        </div>

        {/* Right: Executive Context & Quick Benchmark Summary */}
        <div className="lg:col-span-8 space-y-4">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#0D0D0C]">
              {health.headline}
            </h3>
            <p className="text-xs sm:text-sm text-[#0D0D0C]/70 mt-1 leading-relaxed">
              {health.summaryText}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-[#0D0D0C]/[0.08]">
            <div className="p-2.5 rounded-xl bg-[#FFFDFA] border border-[#0D0D0C]/[0.06]">
              <span className="text-[10px] uppercase font-semibold text-[#0D0D0C]/50 block">
                Savings Rate
              </span>
              <div className="text-sm font-serif font-medium text-[#0D0D0C] mt-0.5">
                {health.savingsRatePercent.toFixed(1)}%
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FFFDFA] border border-[#0D0D0C]/[0.06]">
              <span className="text-[10px] uppercase font-semibold text-[#0D0D0C]/50 block">
                Debt-to-Income
              </span>
              <div className="text-sm font-serif font-medium text-[#0D0D0C] mt-0.5">
                {health.debtToIncomePercent.toFixed(1)}%
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FFFDFA] border border-[#0D0D0C]/[0.06]">
              <span className="text-[10px] uppercase font-semibold text-[#0D0D0C]/50 block">
                Emergency Vault
              </span>
              <div className="text-sm font-serif font-medium text-[#0D0D0C] mt-0.5">
                {health.emergencyFundMonths.toFixed(1)} mo
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FFFDFA] border border-[#0D0D0C]/[0.06]">
              <span className="text-[10px] uppercase font-semibold text-[#0D0D0C]/50 block">
                Fixed Outlays
              </span>
              <div className="text-sm font-serif font-medium text-[#0D0D0C] mt-0.5">
                {health.commitmentsRatioPercent.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Actionable Improvement Plan (Prescriptive Roadmap) */}
      {health.topRecommendations.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0D0D0C] text-[#FFFDFA] space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="font-serif text-lg font-medium text-[#FFFDFA]">
                How to Boost Your Score
              </h3>
            </div>
            <span className="text-[11px] text-[#FFFDFA]/60 hidden sm:inline">
              Prioritized high-leverage steps
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {health.topRecommendations.map((rec, idx) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl bg-white/[0.07] border border-white/[0.1] flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#FFFDFA]/60 font-medium">
                      Step {idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-semibold">
                      +{rec.pointsBoost} pts
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#FFFDFA]">
                    {rec.title}
                  </h4>
                  <p className="text-[11px] text-[#FFFDFA]/75 leading-relaxed">
                    {rec.actionText}
                  </p>
                </div>

                {rec.targetAnchor && (
                  <button
                    onClick={() => scrollToAnchor(rec.targetAnchor)}
                    className="pt-2 text-[11px] font-medium text-amber-300 hover:text-amber-200 inline-flex items-center gap-1 border-t border-white/[0.08]"
                  >
                    <span>Take Action</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Detailed 6-Pillar Assessment Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[#0D0D0C]">
            Pillar-by-Pillar Breakdown (100 Points Total)
          </h3>
          <span className="text-xs text-[#0D0D0C]/50">
            6 core dimensions evaluated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {health.pillars.map((pillar) => {
            const Icon = getPillarIcon(pillar.id);
            return (
              <div
                key={pillar.id}
                className="p-5 rounded-2xl bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] hover:border-[#0D0D0C]/[0.2] transition-all flex flex-col justify-between space-y-4 shadow-xs"
              >
                {/* Header & Score */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] flex items-center justify-center text-[#0D0D0C] shrink-0">
                        <Icon className="w-4 h-4 stroke-[1.8]" />
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-medium text-[#0D0D0C] leading-tight">
                          {pillar.title}
                        </h4>
                        <span className="text-[11px] text-[#0D0D0C]/50 block mt-0.5">
                          {pillar.metricValue}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getTierColorClass(
                        pillar.statusTier
                      )}`}
                    >
                      {pillar.statusLabel}
                    </span>
                  </div>

                  {/* Progress Bar & Points */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#0D0D0C]/50 font-normal">Score</span>
                      <span className="font-medium text-[#0D0D0C]">
                        {pillar.score} / {pillar.maxScore} pts
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#0D0D0C]/[0.07] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getBarColorClass(
                          pillar.statusTier
                        )}`}
                        style={{ width: `${pillar.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Prescriptive Advice */}
                <div className="p-3 rounded-xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.05] space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-[#0D0D0C]/50 block flex items-center justify-between">
                    <span>How to Improve</span>
                    {pillar.potentialPointsGain > 0 && (
                      <span className="text-amber-800 font-bold">
                        +{pillar.potentialPointsGain} pts available
                      </span>
                    )}
                  </span>
                  <p className="text-[11px] text-[#0D0D0C]/80 leading-relaxed">
                    {pillar.prescription}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Native <dialog> Modal for Scoring Rubric & South African Standards */}
      <dialog
        ref={explainerDialogRef}
        {...({ closedby: "any" } as any)}
        aria-labelledby={explainerTitleId}
        onClick={(e) => {
          if (e.target === explainerDialogRef.current) {
            const rect = explainerDialogRef.current.getBoundingClientRect();
            const isInDialog =
              rect.top <= e.clientY &&
              e.clientY <= rect.top + rect.height &&
              rect.left <= e.clientX &&
              e.clientX <= rect.left + rect.width;
            if (!isInDialog) {
              setIsExplainerOpen(false);
            }
          }
        }}
        onCancel={() => setIsExplainerOpen(false)}
        className="vela-native-dialog max-w-xl m-auto"
      >
        <div className="p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#0D0D0C]/[0.08]">
            <div>
              <h3 id={explainerTitleId} className="font-serif text-xl font-medium text-[#0D0D0C]">
                Financial Health Scoring Rubric
              </h3>
              <p className="text-xs text-[#0D0D0C]/50 mt-0.5">
                How each dimension is measured against South African personal finance benchmarks.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsExplainerOpen(false)}
              className="w-8 h-8 rounded-full border border-[#0D0D0C]/[0.1] flex items-center justify-center text-[#0D0D0C]/60 hover:text-[#0D0D0C] hover:bg-[#0D0D0C]/[0.05]"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 text-xs text-[#0D0D0C]/80 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] space-y-1">
              <span className="font-semibold text-[#0D0D0C] block">
                1. Savings Rate (20 Points)
              </span>
              <p>
                Measures the percentage of monthly take-home pay allocated to ring-fenced savings vaults and Stokvels. The gold standard is 20%+ under the 50/30/20 guideline.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] space-y-1">
              <span className="font-semibold text-[#0D0D0C] block">
                2. Debt-to-Income (DTI) Ratio (20 Points)
              </span>
              <p>
                Calculates monthly debt obligations relative to take-home earnings. South African credit guidelines consider under 28% healthy, while exceeding 45% flags high default risk.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] space-y-1">
              <span className="font-semibold text-[#0D0D0C] block">
                3. Emergency Fund Coverage (20 Points)
              </span>
              <p>
                Measures how many months of essential living costs (groceries, housing, debt, utilities) your liquid Emergency Fund vault can sustain. 3 to 6 months provides fortress security.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] space-y-1">
              <span className="font-semibold text-[#0D0D0C] block">
                4. Budget Adherence (15 Points)
              </span>
              <p>
                Evaluates whether you stayed inside your monthly category spending limits. Unspent caps create surplus cash to accelerate debt snowballing or wealth accumulation.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] space-y-1">
              <span className="font-semibold text-[#0D0D0C] block">
                5. Committed Fixed Costs (15 Points)
              </span>
              <p>
                Analyzes what portion of income is spoken for by debit orders, subscriptions, and contract payments before discretionary spending begins. Under 40% ensures high flexibility.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] space-y-1">
              <span className="font-semibold text-[#0D0D0C] block">
                6. Income Stability (10 Points)
              </span>
              <p>
                Tracks regularity and confirmation of your net take-home salary and payday date in your profile, providing reliable runway forecasting.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[#0D0D0C]/[0.08]">
            <button
              type="button"
              onClick={() => setIsExplainerOpen(false)}
              className="px-5 py-2 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs font-medium hover:bg-[#0D0D0C]/90 shadow-sm"
            >
              Close Rubric
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
