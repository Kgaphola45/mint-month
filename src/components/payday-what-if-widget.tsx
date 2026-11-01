"use client";

import React, { useState, useEffect } from "react";
import { fireConfetti } from "@/lib/confetti";
import {
  Calendar,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  Flame,
  Zap,
  Coffee,
  CheckCircle2,
  Target,
  SlidersHorizontal,
  ShieldCheck,
  Award,
  RefreshCw,
  Info,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency, formatMonthYear } from "@/lib/utils";

interface PresetScenario {
  id: string;
  label: string;
  spendAmount: number;
  noSpendDays: number;
  icon: typeof Sparkles;
  description: string;
}

export function PaydayWhatIfWidget() {
  const {
    selectedMonth,
    currency,
    getSafeToSpend,
    setPaydayModalOpen,
  } = useExpenseStore();

  const safe = getSafeToSpend(selectedMonth);

  // Effective days until payday or end of cycle
  const daysUntilPayday = safe.daysUntilPayday;
  const effectiveDays =
    daysUntilPayday > 0 ? daysUntilPayday : Math.max(1, safe.daysRemaining);
  const safeBuffer = Math.max(0, safe.safeToSpendRemaining);

  // Current daily allowance
  const currentDaily =
    effectiveDays > 0
      ? Math.round((safeBuffer / effectiveDays) * 100) / 100
      : safe.dailyAllowance;

  // Tomorrow spend simulation state
  const [activeTab, setActiveTab] = useState<"tomorrow" | "streak">("tomorrow");
  const [spendAmount, setSpendAmount] = useState<number>(0);
  const [noSpendStreakDays, setNoSpendStreakDays] = useState<number>(2);
  const [hasCommittedTomorrow, setHasCommittedTomorrow] = useState<boolean>(false);

  // Check localStorage for commitment
  useEffect(() => {
    try {
      const stored = localStorage.getItem("mint_month_committed_tomorrow");
      if (stored === "true") {
        setHasCommittedTomorrow(true);
      }
    } catch {
      // ignore SSR / storage errors
    }
  }, []);

  const handleCommitTomorrow = () => {
    fireConfetti({
      particleCount: 50,
      spread: 65,
      origin: { y: 0.7 },
      colors: ["#96CE96", "#F99654", "#DFE9D4", "#0D0D0C"],
    });
    setHasCommittedTomorrow(true);
    try {
      localStorage.setItem("mint_month_committed_tomorrow", "true");
    } catch {
      // ignore
    }
  };

  const handleResetCommitment = () => {
    setHasCommittedTomorrow(false);
    try {
      localStorage.removeItem("mint_month_committed_tomorrow");
    } catch {
      // ignore
    }
  };

  // Base tomorrow calculation (spend = 0)
  const tomorrowZeroDaysRemaining = Math.max(1, effectiveDays - 1);
  const tomorrowZeroDaily =
    effectiveDays > 1
      ? Math.round((safeBuffer / tomorrowZeroDaysRemaining) * 100) / 100
      : safeBuffer;
  const tomorrowZeroBoost = Math.max(0, tomorrowZeroDaily - currentDaily);

  // Active simulated calculation
  let simulatedDaily = currentDaily;
  let simulatedDaysRemaining = effectiveDays;
  let simulatedPool = safeBuffer;

  if (activeTab === "tomorrow") {
    if (effectiveDays > 1) {
      simulatedDaysRemaining = effectiveDays - 1;
      simulatedPool = Math.max(0, safeBuffer - spendAmount);
      simulatedDaily =
        Math.round((simulatedPool / simulatedDaysRemaining) * 100) / 100;
    } else {
      simulatedDaysRemaining = 1;
      simulatedPool = Math.max(0, safeBuffer - spendAmount);
      simulatedDaily = simulatedPool;
    }
  } else {
    // Multi-day no spend streak
    const streakDays = Math.min(noSpendStreakDays, Math.max(1, effectiveDays - 1));
    simulatedDaysRemaining = Math.max(1, effectiveDays - streakDays);
    simulatedPool = safeBuffer;
    simulatedDaily =
      Math.round((simulatedPool / simulatedDaysRemaining) * 100) / 100;
  }

  const delta = Math.round((simulatedDaily - currentDaily) * 100) / 100;
  const isPositive = delta > 0;
  const isZeroDelta = Math.abs(delta) < 0.01;

  // Slider max
  const maxSpendSlider = Math.max(1000, Math.round(currentDaily * 3));

  // Quick preset chips for tomorrow
  const PRESET_CHIPS = [
    { label: "R0 (No Spend)", value: 0 },
    { label: "R100 (Coffee & Lunch)", value: 100 },
    { label: "R250 (Mid spend)", value: 250 },
    { label: "R500 (Dinner out)", value: 500 },
  ];

  return (
    <div
      id="what-if-widget"
      className="p-6 sm:p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-6 scroll-mt-8"
    >
      {/* 1. Header & Payday Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#0D0D0C]/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[14px] sm:text-[15px] font-normal text-[#0D0D0C]/56 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              Payday Countdown & What-If Runway
            </span>
            <span className="px-2.5 py-0.5 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FBF6EF] text-[11px] text-[#0D0D0C]">
              {formatMonthYear(selectedMonth)}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C] mt-1">
            What Happens If You Don&apos;t Spend Tomorrow?
          </h2>
          <p className="text-sm text-[#0D0D0C]/56 mt-1">
            Pre-simulate tomorrow&apos;s cashflow impact on your daily living allowance before swiping your card.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setPaydayModalOpen(true)}
            className="h-9 px-4 rounded-full border border-[#0D0D0C]/[0.12] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-xs font-medium inline-flex items-center gap-1.5 transition-all text-[#0D0D0C] shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Payday: {safe.paydayDay}th</span>
          </button>
        </div>
      </div>

      {/* 2. The Core Editorial What-If Headline Banner */}
      <div className="p-5 sm:p-6 rounded-[22px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-[11px] font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 stroke-[2]" />
              <span>
                {daysUntilPayday > 0
                  ? `${daysUntilPayday} ${daysUntilPayday === 1 ? "day" : "days"} to payday`
                  : "Payday is today!"}
              </span>
            </span>

            {effectiveDays > 1 && tomorrowZeroBoost > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#DFE9D4] text-[#0D0D0C] text-[11px] font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-700 stroke-[2.5]" />
                <span>+{formatCurrency(tomorrowZeroBoost, currency)}/day compound boost</span>
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-[#0D0D0C] pt-0.5">
            {effectiveDays > 1 ? (
              <>
                <span className="text-[#0D0D0C]">{effectiveDays} days to payday.</span>{" "}
                <span className="text-[#0D0D0C]/75 font-normal">
                  If you don&apos;t spend tomorrow, daily goes{" "}
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#0D0D0C]">
                  <span>{formatCurrency(currentDaily, currency)}</span>
                  <ArrowRight className="w-4 h-4 inline stroke-[2.5] text-emerald-600" />
                  <span className="text-emerald-700 underline decoration-emerald-300 decoration-2 underline-offset-4">
                    {formatCurrency(tomorrowZeroDaily, currency)}
                  </span>
                </span>
              </>
            ) : effectiveDays === 1 ? (
              <>
                <span>1 day to payday!</span>{" "}
                <span className="text-[#0D0D0C]/75 font-normal">
                  Spend R0 tomorrow and you carry over{" "}
                </span>
                <span className="font-semibold text-emerald-700">
                  {formatCurrency(safeBuffer, currency)}
                </span>{" "}
                into savings!
              </>
            ) : (
              <>
                <span>Payday has arrived! 🎉</span>{" "}
                <span className="text-[#0D0D0C]/75 font-normal">
                  Your new salary deposit resets your daily runway.
                </span>
              </>
            )}
          </h3>

          <p className="text-xs sm:text-sm text-[#0D0D0C]/65">
            {effectiveDays > 1 ? (
              <>
                Banking a zero-spend day locks in{" "}
                <strong className="text-[#0D0D0C]">
                  +{formatCurrency(tomorrowZeroBoost, currency)} extra every single day
                </strong>{" "}
                for the remaining {tomorrowZeroDaysRemaining} days until payday.
              </>
            ) : (
              <>Month completed. Zero-spend habits preserve discretionary cash reserves.</>
            )}
          </p>
        </div>

        {/* Action Button: Commit to R0 Tomorrow */}
        <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
          {hasCommittedTomorrow ? (
            <div className="flex items-center gap-2">
              <div className="px-4 py-2 rounded-full bg-[#DFE9D4] border border-emerald-300 text-xs font-medium text-[#0D0D0C] flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 stroke-[2]" />
                <span>Committed: Tomorrow is R0</span>
              </div>
              <button
                onClick={handleResetCommitment}
                className="text-[11px] text-[#0D0D0C]/45 hover:text-[#0D0D0C] underline"
                title="Reset commitment"
              >
                Reset
              </button>
            </div>
          ) : (
            <button
              onClick={handleCommitTomorrow}
              className="h-10 px-5 rounded-full bg-[#0D0D0C] text-[#FFFDFA] hover:opacity-90 text-xs font-medium inline-flex items-center gap-2 transition-all shadow-sm group"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>Commit to R0 Tomorrow</span>
            </button>
          )}
          <span className="text-[11px] text-[#0D0D0C]/45">
            Free cash buffer: {formatCurrency(safeBuffer, currency)}
          </span>
        </div>
      </div>

      {/* 3. Interactive What-If Simulation Controls */}
      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.06em] text-[#0D0D0C]/50">
              Interactive What-If Simulation
            </span>
          </div>

          {/* Toggle between Tomorrow spend vs No-Spend Streak */}
          <div className="flex items-center p-1 rounded-full bg-[#0D0D0C]/[0.05] border border-[#0D0D0C]/[0.08]">
            <button
              onClick={() => setActiveTab("tomorrow")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeTab === "tomorrow"
                  ? "bg-[#FFFDFA] text-[#0D0D0C] shadow-sm"
                  : "text-[#0D0D0C]/60 hover:text-[#0D0D0C]"
              }`}
            >
              Tomorrow&apos;s Spend
            </button>
            <button
              onClick={() => setActiveTab("streak")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeTab === "streak"
                  ? "bg-[#FFFDFA] text-[#0D0D0C] shadow-sm"
                  : "text-[#0D0D0C]/60 hover:text-[#0D0D0C]"
              }`}
            >
              No-Spend Streak (Multi-Day)
            </button>
          </div>
        </div>

        {activeTab === "tomorrow" ? (
          /* Tomorrow Spend Slider & Presets */
          <div className="p-5 sm:p-6 rounded-[20px] bg-[#FBF6EF]/70 border border-[#0D0D0C]/[0.06] space-y-5">
            {/* Quick preset chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#0D0D0C]/50 mr-1">Quick Scenarios:</span>
              {PRESET_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => setSpendAmount(chip.value)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                    spendAmount === chip.value
                      ? "bg-[#0D0D0C] text-[#FFFDFA] font-medium shadow-sm"
                      : "bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] text-[#0D0D0C]/75 hover:border-[#0D0D0C]/30"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Slider & Custom Amount Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#0D0D0C]/70">
                <label htmlFor="whatif-slider" className="font-medium text-[#0D0D0C]">
                  Simulate Tomorrow&apos;s Outlay:
                </label>
                <div className="flex items-center gap-1.5 font-medium text-sm text-[#0D0D0C]">
                  <span>Amount:</span>
                  <div className="relative inline-block">
                    <input
                      type="number"
                      min={0}
                      max={safeBuffer}
                      step={10}
                      value={spendAmount === 0 ? "0" : spendAmount}
                      onChange={(e) =>
                        setSpendAmount(Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="w-24 px-2 py-0.5 rounded-md border border-[#0D0D0C]/[0.15] bg-[#FFFDFA] text-right text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#0D0D0C]"
                    />
                  </div>
                </div>
              </div>

              <input
                id="whatif-slider"
                type="range"
                min={0}
                max={Math.min(safeBuffer, maxSpendSlider)}
                step={25}
                value={spendAmount}
                onChange={(e) => setSpendAmount(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#0D0D0C]/[0.1] rounded-lg appearance-none cursor-pointer accent-[#0D0D0C]"
              />

              <div className="flex justify-between text-[11px] text-[#0D0D0C]/40">
                <span>R0 (Zero spend)</span>
                <span>R{Math.round(currentDaily)} (Current daily pace)</span>
                <span>{formatCurrency(Math.min(safeBuffer, maxSpendSlider), currency)}</span>
              </div>
            </div>

            {/* Live Consequence Card */}
            <div className="p-4 sm:p-5 rounded-[16px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs text-[#0D0D0C]/50 block">
                  Projected Daily Allowance (Days remaining: {simulatedDaysRemaining})
                </span>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C]">
                    {formatCurrency(simulatedDaily, currency)}
                  </span>
                  <span className="text-xs text-[#0D0D0C]/50">/ day</span>

                  {!isZeroDelta && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                        isPositive
                          ? "bg-[#DFE9D4] text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                      ) : (
                        <TrendingDown className="w-3 h-3 stroke-[2.5]" />
                      )}
                      <span>
                        {isPositive ? "+" : ""}
                        {formatCurrency(delta, currency)}/day
                      </span>
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs text-[#0D0D0C]/65 max-w-sm">
                {spendAmount === 0 ? (
                  <p>
                    🌿 <strong>Maximum Acceleration:</strong> By spending R0 tomorrow, your daily budget increases by{" "}
                    <strong>+{formatCurrency(delta, currency)}/day</strong> for every remaining day until payday.
                  </p>
                ) : isPositive ? (
                  <p>
                    ✨ <strong>Ahead of Pace:</strong> Spending {formatCurrency(spendAmount, currency)} is below your daily allowance, leaving you with an extra{" "}
                    <strong>+{formatCurrency(delta, currency)}/day</strong> thereafter.
                  </p>
                ) : (
                  <p>
                    ⚠️ <strong>Runway Impact:</strong> Spending {formatCurrency(spendAmount, currency)} tomorrow lowers your subsequent daily allowance from {formatCurrency(currentDaily, currency)} to{" "}
                    <strong>{formatCurrency(simulatedDaily, currency)}/day</strong>.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Multi-Day No-Spend Streak Simulator */
          <div className="p-5 sm:p-6 rounded-[20px] bg-[#FBF6EF]/70 border border-[#0D0D0C]/[0.06] space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-[#0D0D0C]/70">
              <span className="font-medium text-[#0D0D0C]">
                How many no-spend days can you bank before payday?
              </span>
              <span className="text-xs text-[#0D0D0C]/50">
                Selected: {noSpendStreakDays} {noSpendStreakDays === 1 ? "day" : "days"}
              </span>
            </div>

            {/* Streak Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[1, 2, 3, 5].map((days) => {
                const disabled = days >= effectiveDays;
                const remDays = Math.max(1, effectiveDays - days);
                const projected = Math.round((safeBuffer / remDays) * 100) / 100;
                const gain = Math.max(0, projected - currentDaily);

                return (
                  <button
                    key={days}
                    disabled={disabled}
                    onClick={() => setNoSpendStreakDays(days)}
                    className={`p-3 rounded-[16px] text-left transition-all border ${
                      noSpendStreakDays === days && !disabled
                        ? "bg-[#0D0D0C] text-[#FFFDFA] border-[#0D0D0C] shadow-sm"
                        : disabled
                        ? "bg-[#0D0D0C]/[0.02] border-[#0D0D0C]/[0.05] text-[#0D0D0C]/30 cursor-not-allowed"
                        : "bg-[#FFFDFA] border-[#0D0D0C]/[0.08] text-[#0D0D0C] hover:border-[#0D0D0C]/25"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span>{days} {days === 1 ? "Day" : "Days"} R0</span>
                      <Flame
                        className={`w-3.5 h-3.5 ${
                          noSpendStreakDays === days
                            ? "text-amber-300 fill-amber-300"
                            : "text-[#0D0D0C]/30"
                        }`}
                      />
                    </div>
                    <div className="text-base font-semibold mt-1">
                      {formatCurrency(projected, currency)}
                      <span className="text-[10px] font-normal opacity-60">/day</span>
                    </div>
                    <div className="text-[10px] opacity-75 mt-0.5">
                      +{formatCurrency(gain, currency)}/day boost
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Streak Explanation */}
            <div className="p-4 rounded-[16px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] text-xs text-[#0D0D0C]/70 flex items-start gap-3">
              <Award className="w-4 h-4 text-amber-600 stroke-[1.5] shrink-0 mt-0.5" />
              <div>
                <strong>The Power of No-Spend Days:</strong> Banking just{" "}
                <span className="text-[#0D0D0C] font-semibold">{noSpendStreakDays} no-spend days</span>{" "}
                between now and payday elevates your daily allowance from{" "}
                <span className="line-through text-[#0D0D0C]/45">{formatCurrency(currentDaily, currency)}</span> to{" "}
                <span className="text-emerald-700 font-semibold">{formatCurrency(simulatedDaily, currency)}/day</span> for the remaining {simulatedDaysRemaining} days!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
