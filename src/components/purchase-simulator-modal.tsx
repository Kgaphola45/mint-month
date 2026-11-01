"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  X,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Plus,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency, getTodayDateStr } from "@/lib/utils";
import { CURRENCIES } from "@/lib/currencies";

const QUICK_AMOUNTS = [150, 350, 750, 1450, 2500, 5000];

export function PurchaseSimulatorModal() {
  const {
    simulatorModalOpen,
    setSimulatorModalOpen,
    selectedMonth,
    currency,
    categories,
    getSafeToSpend,
    addExpense,
  } = useExpenseStore();

  const currentCurrency = CURRENCIES[currency] || CURRENCIES.ZAR;

  const [amountStr, setAmountStr] = useState<string>("1450");
  const [description, setDescription] = useState<string>("Running shoes");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("cat-shopping");

  const safe = getSafeToSpend(selectedMonth);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && simulatorModalOpen) {
        setSimulatorModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [simulatorModalOpen, setSimulatorModalOpen]);

  if (!simulatorModalOpen) return null;

  const currentDailyAllowance = Math.max(0, safe.dailyAllowance);
  const safeToSpendRemaining = safe.safeToSpendRemaining;
  const daysRemaining = safe.daysRemaining > 0 ? safe.daysRemaining : 1;
  const daysUntilPayday = safe.daysUntilPayday;

  const amount = Math.max(0, parseFloat(amountStr) || 0);
  const simulatedRemaining = safeToSpendRemaining - amount;
  const simulatedDailyAllowance =
    daysRemaining > 0
      ? Math.round((simulatedRemaining / daysRemaining) * 100) / 100
      : simulatedRemaining;

  const dailyReduction = Math.max(0, currentDailyAllowance - Math.max(0, simulatedDailyAllowance));
  const bufferPercentageUsed =
    safeToSpendRemaining > 0
      ? Math.min(100, Math.round((amount / safeToSpendRemaining) * 100))
      : 100;

  // Determine editorial impact verdict
  let statusBadge = {
    bg: "bg-[#DFE9D4]",
    text: "text-[#0D0D0C]",
    label: "Comfortably Affordable",
    icon: CheckCircle2,
  };

  if (simulatedRemaining < 0) {
    statusBadge = {
      bg: "bg-rose-100",
      text: "text-rose-800",
      label: "Exceeds Discretionary Buffer",
      icon: AlertCircle,
    };
  } else if (simulatedDailyAllowance < 75) {
    statusBadge = {
      bg: "bg-[#ECD6E2]",
      text: "text-[#0D0D0C]",
      label: "Significantly Tightens Daily Pace",
      icon: AlertTriangle,
    };
  } else if (simulatedDailyAllowance < 200) {
    statusBadge = {
      bg: "bg-[#F8DCC7]",
      text: "text-[#0D0D0C]",
      label: "Moderate Allowance Impact",
      icon: Sparkles,
    };
  }

  const StatusIcon = statusBadge.icon;

  const handleLogAsExpense = () => {
    if (amount <= 0) return;

    addExpense({
      amount,
      categoryId: selectedCategoryId || categories[0]?.id || "cat-other",
      note: description.trim() || "Simulated purchase",
      date: getTodayDateStr(),
      paymentMethod: "Card",
    });

    try {
      confetti({
        particleCount: 36,
        spread: 55,
        origin: { y: 0.65 },
        colors: ["#0D0D0C", "#96CE96", "#F99654"],
      });
    } catch {
      // ignore
    }

    setSimulatorModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D0D0C]/45 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] rounded-[28px] p-6 sm:p-8 shadow-[0_24px_56px_rgba(0,0,0,0.12)] space-y-6 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#0D0D0C]/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D0D0C]" />
              <span className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#0D0D0C]/50">
                Purchase Decision Simulator
              </span>
              <kbd className="hidden sm:inline-block text-[10px] font-mono bg-[#0D0D0C]/[0.06] text-[#0D0D0C]/60 px-1.5 py-0.5 rounded">
                Hotkey: A
              </kbd>
            </div>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C]">
              Can I Afford It?
            </h2>
            <p className="text-xs sm:text-sm text-[#0D0D0C]/56 mt-1 leading-relaxed">
              Test how a potential purchase impacts your daily guilt-free runway before swiping.
            </p>
          </div>

          <button
            onClick={() => setSimulatorModalOpen(false)}
            className="w-9 h-9 rounded-full border border-[#0D0D0C]/[0.1] flex items-center justify-center text-[#0D0D0C]/60 hover:text-[#0D0D0C] hover:bg-[#FBF6EF] transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        {/* Input: Purchase Amount & Optional Item Name */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/60">
              Purchase Amount ({currentCurrency.symbol} - {currentCurrency.code})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-medium text-[#0D0D0C]/40">
                {currentCurrency.symbol}
              </span>
              <input
                type="number"
                min="0"
                step="any"
                autoFocus
                placeholder="0"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full h-14 pl-11 pr-4 rounded-[18px] border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-3xl font-medium text-[#0D0D0C] placeholder:text-[#0D0D0C]/25 focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDFA] transition-all font-sans tracking-[-0.032em]"
              />
            </div>
          </div>

          {/* Quick Amount Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-[#0D0D0C]/45 font-medium mr-1">Presets:</span>
            {QUICK_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmountStr(val.toString())}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${amount === val
                  ? "bg-[#0D0D0C] text-[#FFFDFA] border-[#0D0D0C]"
                  : "bg-[#FFFDFA] text-[#0D0D0C]/75 border-[#0D0D0C]/[0.1] hover:border-[#0D0D0C]/30 hover:bg-[#FBF6EF]"
                  }`}
              >
                +{currentCurrency.symbol}{val.toLocaleString()}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/60">
                Item Description (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Running shoes, Dinner, Flight"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-11 px-3.5 rounded-[16px] border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm text-[#0D0D0C] placeholder:text-[#0D0D0C]/35 focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDFA] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/60">
                Category
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-[16px] border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm text-[#0D0D0C] focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDFA] transition-all cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live Simulation Comparison Card */}
        <div className="p-5 sm:p-6 rounded-[22px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-medium uppercase tracking-[0.06em] text-[#0D0D0C]/50">
              Daily Guilt-Free Allowance Shift
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#0D0D0C]/60">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {daysUntilPayday > 0
                  ? `${daysUntilPayday} days until payday (${safe.paydayDay}th)`
                  : `${daysRemaining} days remaining`}
              </span>
            </div>
          </div>

          {/* Numbers comparison: Current -> New */}
          <div className="grid grid-cols-2 gap-4 items-center">
            {/* Before */}
            <div className="p-4 rounded-[18px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.06]">
              <span className="text-[11px] uppercase tracking-wider text-[#0D0D0C]/45 font-medium block">
                Current Pace
              </span>
              <div className="text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C] mt-1 font-sans">
                {formatCurrency(currentDailyAllowance, currency)}
                <span className="text-xs font-normal text-[#0D0D0C]/45 ml-1">/ day</span>
              </div>
              <span className="text-[11px] text-[#0D0D0C]/50 mt-1 block">
                Pool: {formatCurrency(Math.max(0, safeToSpendRemaining), currency)}
              </span>
            </div>

            {/* After */}
            <div
              className={`p-4 rounded-[18px] border transition-all ${simulatedRemaining < 0
                ? "bg-rose-50 border-rose-200"
                : simulatedDailyAllowance < 75
                  ? "bg-[#ECD6E2]/40 border-[#ECD6E2]"
                  : "bg-[#FFFDFA] border-[#0D0D0C]/[0.06]"
                }`}
            >
              <span className="text-[11px] uppercase tracking-wider text-[#0D0D0C]/45 font-medium block flex items-center justify-between">
                <span>Simulated Pace</span>
                {amount > 0 && (
                  <span className="text-rose-600 font-semibold text-[10px]">
                    -{formatCurrency(dailyReduction, currency)}/d
                  </span>
                )}
              </span>
              <div
                className={`text-2xl sm:text-3xl font-medium tracking-tight mt-1 font-sans ${simulatedRemaining < 0
                  ? "text-rose-700"
                  : simulatedDailyAllowance < 75
                    ? "text-[#0D0D0C]"
                    : "text-emerald-700"
                  }`}
              >
                {formatCurrency(Math.max(0, simulatedDailyAllowance), currency)}
                <span className="text-xs font-normal text-[#0D0D0C]/45 ml-1">/ day</span>
              </div>
              <span className="text-[11px] text-[#0D0D0C]/50 mt-1 block">
                {simulatedRemaining < 0 ? (
                  <strong className="text-rose-700">
                    Over by {formatCurrency(Math.abs(simulatedRemaining), currency)}
                  </strong>
                ) : (
                  `Pool: ${formatCurrency(simulatedRemaining, currency)}`
                )}
              </span>
            </div>
          </div>

          {/* Buffer usage progress bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-[#0D0D0C]/60">
              <span>Discretionary Buffer Impact</span>
              <span>{amount > 0 ? `${bufferPercentageUsed}% of remaining pool` : "0%"}</span>
            </div>
            <div className="w-full h-2 bg-[#0D0D0C]/[0.08] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${simulatedRemaining < 0
                  ? "bg-rose-600"
                  : bufferPercentageUsed > 65
                    ? "bg-[#F99654]"
                    : "bg-[#0D0D0C]"
                  }`}
                style={{ width: `${Math.min(100, bufferPercentageUsed)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Editorial Verdict Banner */}
        <div className={`p-4 rounded-[20px] ${statusBadge.bg} ${statusBadge.text} space-y-1.5`}>
          <div className="flex items-center gap-2 font-medium text-xs">
            <StatusIcon className="w-4 h-4 shrink-0" />
            <span className="uppercase tracking-[0.04em] font-semibold">{statusBadge.label}</span>
          </div>
          <p className="text-xs sm:text-[13px] leading-relaxed opacity-90 pl-6">
            {amount > 0 ? (
              simulatedRemaining < 0 ? (
                <>
                  Buying this of <strong>{formatCurrency(amount, currency)}</strong> exceeds your
                  remaining safe-to-spend buffer by{" "}
                  <strong>{formatCurrency(Math.abs(simulatedRemaining), currency)}</strong>. Swiping
                  for this will require dipping into fixed commitments or savings before payday.
                </>
              ) : (
                <>
                  Buying this will reduce your guilt-free allowance from{" "}
                  <strong>{formatCurrency(currentDailyAllowance, currency)}/day</strong> &rarr;{" "}
                  <strong>{formatCurrency(simulatedDailyAllowance, currency)}/day</strong> for the
                  remaining <strong>{daysRemaining} days</strong> until payday on the{" "}
                  {safe.paydayDay}th.
                </>
              )
            ) : (
              <>Enter a purchase amount above to simulate the exact impact on your daily runway.</>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setSimulatorModalOpen(false)}
            className="w-1/3 h-12 rounded-full border border-[#0D0D0C]/[0.15] hover:bg-[#FBF6EF] text-xs font-medium text-[#0D0D0C] transition-colors"
          >
            Reconsider
          </button>

          <button
            type="button"
            onClick={handleLogAsExpense}
            disabled={amount <= 0}
            className="w-2/3 h-12 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs sm:text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 stroke-[2]" />
            <span>Proceed & Log Expense ({formatCurrency(amount, currency)})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
