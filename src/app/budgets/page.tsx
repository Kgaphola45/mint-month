"use client";

import React from "react";
import confetti from "canvas-confetti";
import {
  PiggyBank,
  CheckCircle2,
  Circle,
  Edit3,
  Check,
  ShieldAlert,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency, formatMonthYear, getBudgetStatus } from "@/lib/utils";
import { CategoryIcon } from "@/components/category-icon";

export default function BudgetsPage() {
  const {
    selectedMonth,
    getMonthSummary,
    getCategorySpending,
    currency,
    setBudgetModalOpen,
    toggleCategorySorted,
    toggleTotalSorted,
  } = useExpenseStore();

  const summary = getMonthSummary(selectedMonth);
  const categoryStats = getCategorySpending(selectedMonth);
  const overallStatus = getBudgetStatus(summary.totalSpent, summary.totalBudget);

  const budgetedCategories = categoryStats.filter((c) => c.budget > 0);
  const sortedCount = budgetedCategories.filter((c) => c.isSorted).length;
  const allSorted =
    budgetedCategories.length > 0 && sortedCount === budgetedCategories.length;

  const handleToggleSorted = (catId: string, isCurrentlySorted: boolean) => {
    toggleCategorySorted(selectedMonth, catId);
    if (!isCurrentlySorted) {
      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.7 },
          colors: ["#10b981", "#34d399", "#059669"],
        });
      } catch {
        // ignore
      }
    }
  };

  const overbudgetCategories = categoryStats.filter(
    (c) => c.budget > 0 && c.spent > c.budget
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>Budget Tracker</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-mint-500/10 text-mint-600 dark:text-mint-400 border border-mint-500/20">
              Rands Only (ZAR)
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Set, monitor, and tick off sorted budgets for {formatMonthYear(selectedMonth)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBudgetModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md active:scale-95 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>Set Limits</span>
          </button>
        </div>
      </div>

      {/* Critical Overspending Callout if any */}
      {overbudgetCategories.length > 0 && (
        <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-500 text-white shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">
              Overspending detected in {overbudgetCategories.length}{" "}
              {overbudgetCategories.length === 1 ? "category" : "categories"}!
            </h4>
            <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-0.5">
              {overbudgetCategories.map((c) => c.category.name).join(", ")} exceeded their target limits.
            </p>
          </div>
        </div>
      )}

      {/* Total Monthly Cap Card + Sorted Counter */}
      <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-blue-500" />
                Monthly Budget Cap
              </span>
              {allSorted && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> All Sorted!
                </span>
              )}
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-foreground">
              {summary.totalBudget > 0
                ? formatCurrency(summary.totalBudget, currency)
                : "No Budget Cap Set"}
            </div>
            <p className="text-xs text-muted-foreground">
              Spent {formatCurrency(summary.totalSpent, currency)} of{" "}
              {formatCurrency(summary.totalBudget, currency)} total cap
            </p>
          </div>

          {/* Sorted Status Pill & Gauge */}
          <div className="w-full md:max-w-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    allSorted
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    {sortedCount} of {budgetedCategories.length} Budgets Sorted
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Click the tick on any card below when settled
                  </span>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-mint-600 dark:text-mint-400">
                {budgetedCategories.length > 0
                  ? `${Math.round((sortedCount / budgetedCategories.length) * 100)}%`
                  : "0%"}
              </span>
            </div>

            {/* Sorted progress bar */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    budgetedCategories.length > 0
                      ? (sortedCount / budgetedCategories.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Total Progress Bar */}
        {summary.totalBudget > 0 && (
          <div className="pt-3 border-t border-border/40 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className={overallStatus.color}>
                {overallStatus.percentage}% Consumed
              </span>
              <span className="text-muted-foreground font-mono">
                {summary.remaining >= 0
                  ? `${formatCurrency(summary.remaining, currency)} remaining safe`
                  : `${formatCurrency(Math.abs(summary.remaining), currency)} over limit`}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${overallStatus.progressColor}`}
                style={{ width: `${Math.min(overallStatus.percentage, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Category Wise Budget Breakdown Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Category Budgets & Ticks
          </h3>
          <span className="text-xs text-muted-foreground font-medium">
            Tap the tick to mark a budget sorted / paid
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryStats.map((item) => {
            const hasBudget = item.budget > 0;
            const status = getBudgetStatus(item.spent, item.budget);
            const remaining = item.budget - item.spent;
            const isSorted = item.isSorted;

            return (
              <div
                key={item.category.id}
                className={`p-5 rounded-3xl bg-card border transition-all duration-200 shadow-sm flex flex-col justify-between ${
                  isSorted
                    ? "border-emerald-500/50 bg-emerald-500/[0.03] shadow-glow/10"
                    : status.isOver
                    ? "border-rose-500/40 bg-rose-500/[0.02]"
                    : "border-border/60 hover:border-border"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: item.category.color }}
                      >
                        <CategoryIcon name={item.category.icon} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4
                            className={`text-sm font-bold truncate ${
                              isSorted ? "text-foreground line-through opacity-80" : "text-foreground"
                            }`}
                          >
                            {item.category.name}
                          </h4>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {item.transactionCount} expenses logged
                        </span>
                      </div>
                    </div>

                    {/* Tick / Mark Sorted Action Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleSorted(item.category.id, isSorted)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
                        isSorted
                          ? "bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-500/30"
                          : "bg-muted/70 text-muted-foreground hover:bg-emerald-500/15 hover:text-emerald-600 dark:hover:text-emerald-400 border border-border/60"
                      }`}
                      title={isSorted ? "Mark as unsorted" : "Mark as sorted / paid"}
                    >
                      <Check className={`w-3.5 h-3.5 ${isSorted ? "stroke-[3]" : "stroke-[2]"}`} />
                      <span>{isSorted ? "Sorted ✓" : "Tick"}</span>
                    </button>
                  </div>

                  {/* Amounts */}
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="text-[11px] text-muted-foreground block">
                        Spent
                      </span>
                      <span className="text-xl font-bold font-mono text-foreground">
                        {formatCurrency(item.spent, currency)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-muted-foreground block">
                        Target Limit
                      </span>
                      <span className="text-sm font-semibold font-mono text-muted-foreground">
                        {hasBudget ? formatCurrency(item.budget, currency) : "No limit"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                {hasBudget ? (
                  <div className="mt-3 pt-3 border-t border-border/40 space-y-1.5">
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isSorted ? "bg-emerald-500" : status.progressColor
                        }`}
                        style={{ width: `${Math.min(status.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span
                        className={`font-semibold ${
                          isSorted ? "text-emerald-600 dark:text-emerald-400" : status.color
                        }`}
                      >
                        {isSorted
                          ? "✓ Sorted & Settled"
                          : status.isOver
                          ? "Over Budget!"
                          : status.status === "warning"
                          ? "Approaching Limit"
                          : "Within Budget"}
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {remaining >= 0
                          ? `${formatCurrency(remaining, currency)} left`
                          : `${formatCurrency(Math.abs(remaining), currency)} over`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setBudgetModalOpen(true)}
                    className="mt-3 pt-3 border-t border-border/40 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline text-left"
                  >
                    + Set limit for {item.category.name}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
