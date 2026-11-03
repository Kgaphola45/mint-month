"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Check,
  ShieldAlert,
  Sparkles,
  Repeat,
  Edit3,
  Columns3,
  LayoutGrid,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency, formatMonthYear, getBudgetStatus } from "@/lib/utils";
import { CategoryIcon } from "@/components/category-icon";
import { DebtTracker } from "@/components/debt-tracker";
import { SortedBoard } from "@/components/sorted-board";

export default function BudgetsPage() {
  const {
    selectedMonth,
    getMonthSummary,
    getCategorySpending,
    currency,
    setBudgetModalOpen,
    toggleCategorySorted,
    toggleCategoryRecurring,
    applyCurrentMonthBudgetsToAllMonths,
  } = useExpenseStore();

  const [appliedNotice, setAppliedNotice] = useState(false);
  const [viewMode, setViewMode] = useState<"board" | "grid">("board");

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
          colors: ["#0D0D0C", "#96CE96", "#F99654"],
        });
      } catch {
        // ignore
      }
    }
  };

  const handleToggleRecurring = (catId: string, amount: number) => {
    toggleCategoryRecurring(selectedMonth, catId, amount);
  };

  const handleApplyToAllMonths = () => {
    applyCurrentMonthBudgetsToAllMonths(selectedMonth);
    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 4000);
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#0D0D0C", "#96CE96", "#F6DE68"],
      });
    } catch {
      // ignore
    }
  };

  const overbudgetCategories = categoryStats.filter(
    (c) => c.budget > 0 && c.spent > c.budget
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#0D0D0C]/[0.08]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#0D0D0C] flex items-center gap-3">
            <span>Budget Tracker</span>
            <span className="text-xs font-normal px-3 py-1 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FFFDFA] text-[#0D0D0C]">
              Rands Only (ZAR)
            </span>
          </h1>
          <p className="text-sm text-[#0D0D0C]/56 mt-1">
            Set, monitor, and tick off sorted budgets for {formatMonthYear(selectedMonth)}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleApplyToAllMonths}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#0D0D0C]/20 hover:border-[#0D0D0C] text-[#0D0D0C] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-xs font-medium transition-all active:scale-95 shadow-sm"
            title="Make current budget repeat in all future and past months"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Apply to Every Month</span>
          </button>

          <button
            onClick={() => setBudgetModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0D0D0C] hover:bg-[#0D0D0C]/90 text-[#FFFDFA] text-xs font-medium transition-all shadow-sm active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Set Limits</span>
          </button>
        </div>
      </div>

      {appliedNotice && (
        <div className="p-4 rounded-[20px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.15] text-[#0D0D0C] text-xs font-medium flex items-center gap-2.5 shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Success: Current monthly category budgets are now set to automatically repeat every month.</span>
        </div>
      )}

      {/* Critical Overspending Alert */}
      {overbudgetCategories.length > 0 && (
        <div className="p-5 rounded-[24px] bg-[#FFFDFA] border border-rose-300 shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex items-start gap-3.5">
          <div className="p-2 rounded-full border border-rose-200 bg-rose-50 text-rose-600 shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#0D0D0C]">
              Overspending detected in {overbudgetCategories.length}{" "}
              {overbudgetCategories.length === 1 ? "category" : "categories"}
            </h4>
            <p className="text-xs text-[#0D0D0C]/56 mt-0.5">
              {overbudgetCategories.map((c) => c.category.name).join(", ")} exceeded their target limits.
            </p>
          </div>
        </div>
      )}

      {/* Total Monthly Cap Card + Sorted Counter & Every-Month badge */}
      <div className="p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[16px] font-normal text-[#0D0D0C]/56">
                Monthly Budget Cap
              </span>
              {summary.recurringCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FBF6EF] text-[#0D0D0C] text-[11px] font-normal flex items-center gap-1">
                  <Repeat className="w-3 h-3" /> {summary.recurringCount} Repeat Every Month
                </span>
              )}
              {allSorted && (
                <span className="px-2.5 py-0.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 text-[11px] font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> All Sorted
                </span>
              )}
            </div>
            <div className="text-[48px] font-medium leading-none tracking-[-0.032em] text-[#0D0D0C]">
              {summary.totalBudget > 0
                ? formatCurrency(summary.totalBudget, currency)
                : "No Budget Cap Set"}
            </div>
            <p className="text-xs text-[#0D0D0C]/56">
              Spent {formatCurrency(summary.totalSpent, currency)} of{" "}
              {formatCurrency(summary.totalBudget, currency)} total limit
            </p>
          </div>

          {/* Sorted Status Pill & Gauge */}
          <div className="w-full md:max-w-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    allSorted
                      ? "bg-[#0D0D0C] text-[#FFFDFA]"
                      : "border border-[#0D0D0C]/[0.15] text-[#0D0D0C]/60"
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <div>
                  <span className="text-xs font-medium text-[#0D0D0C] block">
                    {sortedCount} of {budgetedCategories.length} Budgets Sorted
                  </span>
                  <span className="text-[11px] text-[#0D0D0C]/42">
                    Drag items to the right column below when paid off
                  </span>
                </div>
              </div>

              <span className="text-xs font-medium text-[#0D0D0C]">
                {budgetedCategories.length > 0
                  ? `${Math.round((sortedCount / budgetedCategories.length) * 100)}%`
                  : "0%"}
              </span>
            </div>

            {/* Sorted progress bar */}
            <div className="w-full h-1.5 bg-[#0D0D0C]/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0D0D0C] rounded-full transition-all duration-500"
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
          <div className="pt-4 border-t border-[#0D0D0C]/[0.06] space-y-2">
            <div className="flex items-center justify-between text-xs font-normal">
              <span className="text-[#0D0D0C]/70">
                {overallStatus.percentage}% Consumed
              </span>
              <span className="text-[#0D0D0C]/56">
                {summary.remaining >= 0
                  ? `${formatCurrency(summary.remaining, currency)} remaining safe`
                  : `${formatCurrency(Math.abs(summary.remaining), currency)} over limit`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#0D0D0C]/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-[#0D0D0C]"
                style={{ width: `${Math.min(overallStatus.percentage, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Category Wise Budget Breakdown & Sorted Board */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[20px] font-medium tracking-tight text-[#0D0D0C]">
              {viewMode === "board"
                ? "Monthly Settlement & Sorted Board"
                : "Category Budgets & Every-Month Controls"}
            </h3>
            <p className="text-xs text-[#0D0D0C]/56 mt-0.5">
              {viewMode === "board"
                ? "Drag items to the right as you pay them off to track settled bills"
                : "Tick when paid / sorted • Toggle 🔁 to repeat in every month"}
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] shadow-xs self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                viewMode === "board"
                  ? "bg-[#0D0D0C] text-[#FFFDFA] shadow-xs"
                  : "text-[#0D0D0C]/60 hover:text-[#0D0D0C]"
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Two-Column Board</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-[#0D0D0C] text-[#FFFDFA] shadow-xs"
                  : "text-[#0D0D0C]/60 hover:text-[#0D0D0C]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Category Grid</span>
            </button>
          </div>
        </div>

        {viewMode === "board" ? (
          <SortedBoard onOpenSetLimits={() => setBudgetModalOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categoryStats.map((item) => {
              const hasBudget = item.budget > 0;
              const status = getBudgetStatus(item.spent, item.budget);
              const remaining = item.budget - item.spent;
              const isSorted = item.isSorted;
              const isRecurring = item.isRecurring;

              return (
                <div
                  key={item.category.id}
                  className={`p-6 rounded-[24px] bg-[#FFFDFA] border transition-all duration-200 shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between ${
                    isSorted
                      ? "border-[#0D0D0C] bg-[#FFFDFA]"
                      : isRecurring
                      ? "border-[#0D0D0C]/30"
                      : status.isOver
                      ? "border-rose-300"
                      : "border-[#0D0D0C]/[0.08] hover:border-[#0D0D0C]/20"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full border border-[#0D0D0C]/[0.08] flex items-center justify-center shrink-0 bg-[#FFFDFA]"
                          style={{ color: item.category.color || "#0D0D0C" }}
                        >
                          <CategoryIcon iconName={item.category.icon} className="w-4 h-4 stroke-[1.5]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4
                              className={`text-sm font-medium truncate ${
                                isSorted ? "text-[#0D0D0C] line-through opacity-60" : "text-[#0D0D0C]"
                              }`}
                            >
                              {item.category.name}
                            </h4>
                            {isRecurring && (
                              <span
                                className="px-2 py-0.5 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FBF6EF] text-[#0D0D0C] text-[10px] font-normal flex items-center gap-0.5"
                                title="Appears in every month's budget"
                              >
                                <Repeat className="w-2.5 h-2.5" />
                                Monthly
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#0D0D0C]/42">
                            {item.transactionCount} expense{item.transactionCount === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons: Tick Sorted + Toggle Every Month */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Repeat / Every Month Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleRecurring(item.category.id, item.budget)}
                          className={`p-2 rounded-full text-xs transition-all ${
                            isRecurring
                              ? "bg-[#0D0D0C] text-[#FFFDFA]"
                              : "border border-[#0D0D0C]/[0.15] text-[#0D0D0C]/60 hover:text-[#0D0D0C] hover:bg-[#FBF6EF]"
                          }`}
                          title={
                            isRecurring
                              ? "Appears in every month's budget (Click to make one-off)"
                              : "Make this appear in every month's budget"
                          }
                        >
                          <Repeat className="w-3.5 h-3.5" />
                        </button>

                        {/* Tick / Mark Sorted Action Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleSorted(item.category.id, isSorted)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                            isSorted
                              ? "bg-[#0D0D0C] text-[#FFFDFA]"
                              : "border border-[#0D0D0C]/[0.15] text-[#0D0D0C]/70 hover:border-[#0D0D0C] hover:text-[#0D0D0C]"
                          }`}
                          title={isSorted ? "Mark as unsorted" : "Mark as sorted / paid"}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2]" />
                          <span>{isSorted ? "Sorted" : "Tick"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Amounts */}
                    <div className="flex items-baseline justify-between mb-2">
                      <div>
                        <span className="text-[11px] text-[#0D0D0C]/42 block">
                          Spent
                        </span>
                        <span className="text-2xl font-medium tracking-tight text-[#0D0D0C]">
                          {formatCurrency(item.spent, currency)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-[#0D0D0C]/42 block">
                          Target Limit
                        </span>
                        <span className="text-sm font-normal text-[#0D0D0C]/56">
                          {hasBudget ? formatCurrency(item.budget, currency) : "No limit"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {hasBudget ? (
                    <div className="mt-3 pt-3 border-t border-[#0D0D0C]/[0.06] space-y-1.5">
                      <div className="w-full h-1.5 bg-[#0D0D0C]/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300 bg-[#0D0D0C]"
                          style={{ width: `${Math.min(status.percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-normal text-[#0D0D0C]/70">
                          {isSorted
                            ? "Sorted & Settled"
                            : status.isOver
                            ? "Over Budget"
                            : status.status === "warning"
                            ? "Approaching Limit"
                            : "Within Budget"}
                        </span>
                        <span className="text-[#0D0D0C]/56">
                          {remaining >= 0
                            ? `${formatCurrency(remaining, currency)} left`
                            : `${formatCurrency(Math.abs(remaining), currency)} over`}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setBudgetModalOpen(true)}
                      className="mt-3 pt-3 border-t border-[#0D0D0C]/[0.06] text-xs text-[#0D0D0C] font-medium hover:underline text-left"
                    >
                      + Set limit for {item.category.name}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Debt & Instalment Paydown Tracker */}
      <DebtTracker />
    </div>
  );
}
