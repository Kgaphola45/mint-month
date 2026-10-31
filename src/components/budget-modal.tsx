"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  PiggyBank,
  Check,
  Repeat,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency, formatMonthYear, getBudgetStatus } from "@/lib/utils";
import { CURRENCIES } from "@/lib/currencies";
import { CategoryIcon } from "./category-icon";

export function BudgetModal() {
  const {
    budgetModalOpen,
    setBudgetModalOpen,
    selectedMonth,
    budgets,
    recurringBudgets,
    categories,
    currency,
    getCategorySpending,
    setBudget,
  } = useExpenseStore();

  const currentCurrency = CURRENCIES[currency] || CURRENCIES.ZAR;
  const currentBudget = budgets.find((b) => b.month === selectedMonth);
  const categoryStats = getCategorySpending(selectedMonth);

  const [totalBudget, setTotalBudget] = useState<string>("");
  const [catLimits, setCatLimits] = useState<Record<string, string>>({});
  const [recurringCatIds, setRecurringCatIds] = useState<string[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (budgetModalOpen) {
      const mergedLimits: Record<string, string> = {};
      const activeRecurring = new Set<string>(
        currentBudget?.recurringCategories || Object.keys(recurringBudgets || {})
      );

      for (const [catId, amt] of Object.entries(recurringBudgets || {})) {
        if (amt > 0) mergedLimits[catId] = amt.toString();
      }

      if (currentBudget?.categories) {
        for (const [catId, amt] of Object.entries(currentBudget.categories)) {
          if (amt > 0) mergedLimits[catId] = amt.toString();
        }
      }

      const totalVal =
        currentBudget?.total && currentBudget.total > 0
          ? currentBudget.total.toString()
          : "";

      setTotalBudget(totalVal);
      setCatLimits(mergedLimits);
      setRecurringCatIds(Array.from(activeRecurring));
      setSavedSuccess(false);
    }
  }, [budgetModalOpen, currentBudget, selectedMonth, recurringBudgets]);

  if (!budgetModalOpen) return null;

  const handleClose = () => {
    setBudgetModalOpen(false);
    setSavedSuccess(false);
  };

  const handleLimitChange = (catId: string, value: string) => {
    setCatLimits((prev) => ({ ...prev, [catId]: value }));
  };

  const handleToggleRecurring = (catId: string) => {
    setRecurringCatIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleMakeAllRecurring = () => {
    const withBudget = categories
      .filter((c) => parseFloat(catLimits[c.id] || "0") > 0)
      .map((c) => c.id);
    setRecurringCatIds(withBudget);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const numericCatLimits: Record<string, number> = {};
    let sumLimits = 0;

    for (const [catId, val] of Object.entries(catLimits)) {
      const parsed = parseFloat(val);
      if (!isNaN(parsed) && parsed > 0) {
        numericCatLimits[catId] = parsed;
        sumLimits += parsed;
      }
    }

    const parsedTotal = parseFloat(totalBudget);
    const finalTotal =
      !isNaN(parsedTotal) && parsedTotal > 0 ? parsedTotal : sumLimits;

    setBudget({
      month: selectedMonth,
      total: finalTotal,
      categories: numericCatLimits,
      recurringCategories: recurringCatIds,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      handleClose();
    }, 800);
  };

  const sumCategoryLimits = Object.values(catLimits).reduce((acc, curr) => {
    const num = parseFloat(curr);
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0D0D0C]/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl max-h-[90vh] bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] rounded-[28px] shadow-2xl flex flex-col overflow-hidden z-10">
        {/* Header */}
        <div className="px-7 pt-6 pb-4 flex items-center justify-between border-b border-[#0D0D0C]/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FBF6EF] text-[#0D0D0C] flex items-center justify-center">
              <PiggyBank className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-[#0D0D0C]">
                Budget Settings for {formatMonthYear(selectedMonth)}
              </h2>
              <p className="text-xs text-[#0D0D0C]/56 mt-0.5">
                Set category limits and choose items that automatically appear in every month
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-[#FBF6EF] text-[#0D0D0C]/60 hover:text-[#0D0D0C] transition-colors"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-7 overflow-y-auto space-y-6">
          {savedSuccess && (
            <div className="p-3.5 rounded-[16px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4" />
              Budget limits saved and recurring preferences updated!
            </div>
          )}

          {/* Quick Notice about Every-Month Repeat */}
          <div className="p-4 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-[#0D0D0C]">
              <Repeat className="w-4 h-4 shrink-0 stroke-[1.8]" />
              <span className="text-[#0D0D0C]/80">
                <strong>Every-Month Option:</strong> Toggle 🔁 on any category to make it persist across every month.
              </span>
            </div>
            <button
              type="button"
              onClick={handleMakeAllRecurring}
              className="px-3 py-1.5 rounded-full border border-[#0D0D0C]/20 hover:border-[#0D0D0C] text-[#0D0D0C] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] font-medium text-xs shrink-0 transition-all"
            >
              Repeat All
            </button>
          </div>

          {/* Total Monthly Budget Field */}
          <div className="p-5 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.08]">
            <label className="block text-xs font-normal text-[#0D0D0C]/56 mb-1">
              Total Monthly Budget Cap (Optional)
            </label>
            <p className="text-xs text-[#0D0D0C]/42 mb-3">
              Leave blank to automatically sum your active category budgets.
            </p>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-lg font-medium text-[#0D0D0C]/40">
                {currentCurrency.symbol}
              </span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder={sumCategoryLimits > 0 ? sumCategoryLimits.toString() : "e.g. 15000"}
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-2xl font-medium tracking-tight rounded-[16px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] focus:outline-none focus:border-[#0D0D0C] text-[#0D0D0C]"
              />
            </div>

            {sumCategoryLimits > 0 && (
              <div className="mt-2.5 text-xs text-[#0D0D0C]/56 flex justify-between">
                <span>Sum of category limits:</span>
                <span className="font-medium text-[#0D0D0C]">
                  {formatCurrency(sumCategoryLimits, currency)}
                </span>
              </div>
            )}
          </div>

          {/* Category-wise Budgets with Every-Month Options */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-normal text-[#0D0D0C]/56">
                Category Limits & Every-Month Controls
              </h3>
            </div>

            <div className="space-y-3">
              {categories.map((cat) => {
                const stat = categoryStats.find((s) => s.category.id === cat.id);
                const spent = stat ? stat.spent : 0;
                const limitVal = catLimits[cat.id] || "";
                const limitNum = parseFloat(limitVal) || 0;
                const progressStatus = getBudgetStatus(spent, limitNum);
                const isRecurring = recurringCatIds.includes(cat.id);

                return (
                  <div
                    key={cat.id}
                    className={`p-4 rounded-[20px] bg-[#FBF6EF] border transition-colors space-y-2.5 ${
                      isRecurring
                        ? "border-[#0D0D0C]/30 bg-[#FBF6EF]"
                        : "border-[#0D0D0C]/[0.06] hover:border-[#0D0D0C]/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-[#0D0D0C]/[0.08] bg-[#FFFDFA]"
                          style={{ color: cat.color || "#0D0D0C" }}
                        >
                          <CategoryIcon iconName={cat.icon} className="w-4 h-4 stroke-[1.5]" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-medium text-[#0D0D0C] block truncate">
                            {cat.name}
                          </span>
                          <span className="text-[11px] text-[#0D0D0C]/56">
                            Spent: {formatCurrency(spent, currency)}
                          </span>
                        </div>
                      </div>

                      {/* Right: Repeat Option Toggle + Amount Input */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleRecurring(cat.id)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                            isRecurring
                              ? "bg-[#0D0D0C] text-[#FFFDFA]"
                              : "border border-[#0D0D0C]/[0.15] text-[#0D0D0C]/60 hover:text-[#0D0D0C] bg-[#FFFDFA]"
                          }`}
                          title="Toggle to make this budget appear in every month"
                        >
                          <Repeat className="w-3 h-3 stroke-[2]" />
                          <span className="hidden sm:inline">
                            {isRecurring ? "Every Month" : "Repeat"}
                          </span>
                        </button>

                        <div className="relative w-28 sm:w-32">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#0D0D0C]/40">
                            {currentCurrency.symbol}
                          </span>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            placeholder="Limit"
                            value={catLimits[cat.id] || ""}
                            onChange={(e) => handleLimitChange(cat.id, e.target.value)}
                            className="w-full pl-7 pr-3 py-1.5 text-xs font-medium rounded-full bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] focus:outline-none focus:border-[#0D0D0C] text-[#0D0D0C]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Visual budget meter for this category */}
                    {limitNum > 0 && (
                      <div className="pt-2 border-t border-[#0D0D0C]/[0.06] flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-[#0D0D0C]/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300 bg-[#0D0D0C]"
                            style={{
                              width: `${Math.min(progressStatus.percentage, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-[#0D0D0C]/56 shrink-0">
                          {progressStatus.percentage}% used
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#0D0D0C]/[0.06]">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-full border border-[#0D0D0C]/20 text-xs font-medium text-[#0D0D0C] hover:bg-[#FBF6EF] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-12 px-7 rounded-full bg-[#0D0D0C] text-[#FFFDFA] hover:bg-[#0D0D0C]/90 text-sm font-medium transition-all shadow-sm active:scale-95"
            >
              Save Budgets
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
