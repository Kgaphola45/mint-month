"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  PiggyBank,
  AlertTriangle,
  Check,
  TrendingUp,
  Percent,
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
    categories,
    currency,
    getCategorySpending,
    setBudget,
  } = useExpenseStore();

  const currentCurrency = CURRENCIES[currency] || CURRENCIES.INR;
  const currentBudget = budgets.find((b) => b.month === selectedMonth);
  const categoryStats = getCategorySpending(selectedMonth);

  const [totalBudget, setTotalBudget] = useState<string>("");
  const [catLimits, setCatLimits] = useState<Record<string, string>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (budgetModalOpen) {
      if (currentBudget) {
        setTotalBudget(currentBudget.total > 0 ? currentBudget.total.toString() : "");
        const limits: Record<string, string> = {};
        for (const [catId, amt] of Object.entries(currentBudget.categories || {})) {
          if (amt > 0) limits[catId] = amt.toString();
        }
        setCatLimits(limits);
      } else {
        setTotalBudget("");
        setCatLimits({});
      }
      setSavedSuccess(false);
    }
  }, [budgetModalOpen, currentBudget]);

  if (!budgetModalOpen) return null;

  const handleClose = () => {
    setBudgetModalOpen(false);
  };

  const handleCategoryLimitChange = (catId: string, value: string) => {
    setCatLimits((prev) => ({
      ...prev,
      [catId]: value,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedTotal = parseFloat(totalBudget) || 0;
    const parsedCats: Record<string, number> = {};

    for (const [catId, val] of Object.entries(catLimits)) {
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) {
        parsedCats[catId] = num;
      }
    }

    setBudget({
      month: selectedMonth,
      total: parsedTotal,
      categories: parsedCats,
      sortedCategories: currentBudget?.sortedCategories || [],
      isTotalSorted: currentBudget?.isTotalSorted || false,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      handleClose();
    }, 600);
  };

  // Calculate sum of category budgets
  const sumCategoryLimits = Object.values(catLimits).reduce(
    (sum, v) => sum + (parseFloat(v) || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-border/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Monthly Budget Limits
              </h2>
              <p className="text-xs text-muted-foreground">
                Set total and category targets for {formatMonthYear(selectedMonth)}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6">
          {savedSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              Budget limits saved successfully!
            </div>
          )}

          {/* Total Monthly Budget Field */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/60">
            <label className="block text-xs font-semibold text-foreground mb-1 uppercase tracking-wider">
              Total Monthly Budget Cap
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Overall spending ceiling across all categories for this month.
            </p>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-lg font-bold font-mono text-muted-foreground">
                {currentCurrency.symbol}
              </span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 50000"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-lg font-bold font-mono rounded-xl bg-card border border-border focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-foreground"
              />
            </div>

            {sumCategoryLimits > 0 && (
              <div className="mt-2 text-[11px] text-muted-foreground flex justify-between">
                <span>Sum of category limits:</span>
                <span className="font-mono font-semibold text-foreground">
                  {formatCurrency(sumCategoryLimits, currency)}
                </span>
              </div>
            )}
          </div>

          {/* Category-wise Budgets */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Category Limits & Progress
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> &lt;75%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> 75-90%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> &gt;90%
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {categories.map((cat) => {
                const stat = categoryStats.find((s) => s.category.id === cat.id);
                const spent = stat ? stat.spent : 0;
                const limitVal = catLimits[cat.id] || "";
                const limitNum = parseFloat(limitVal) || 0;
                const progressStatus = getBudgetStatus(spent, limitNum);

                return (
                  <div
                    key={cat.id}
                    className="p-3.5 rounded-2xl bg-card border border-border/60 hover:border-border transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: cat.color }}
                        >
                          <CategoryIcon name={cat.icon} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-foreground block truncate">
                            {cat.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            Spent: {formatCurrency(spent, currency)}
                          </span>
                        </div>
                      </div>

                      <div className="relative w-36 shrink-0">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-muted-foreground">
                          {currentCurrency.symbol}
                        </span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          placeholder="No limit"
                          value={limitVal}
                          onChange={(e) =>
                            handleCategoryLimitChange(cat.id, e.target.value)
                          }
                          className="w-full pl-7 pr-2.5 py-1.5 text-xs font-mono font-medium rounded-xl bg-muted/40 border border-border focus:outline-none focus:border-blue-500 text-foreground text-right"
                        />
                      </div>
                    </div>

                    {/* Progress Bar when budget limit is set */}
                    {limitNum > 0 && (
                      <div className="space-y-1">
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${progressStatus.progressColor}`}
                            style={{
                              width: `${Math.min(progressStatus.percentage, 100)}%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10.5px]">
                          <span
                            className={`font-semibold ${progressStatus.color} flex items-center gap-1`}
                          >
                            {progressStatus.isOver && (
                              <AlertTriangle className="w-3 h-3 text-rose-500" />
                            )}
                            {progressStatus.percentage}% used
                          </span>
                          <span className="text-muted-foreground font-mono">
                            {limitNum - spent >= 0
                              ? `${formatCurrency(limitNum - spent, currency)} left`
                              : `${formatCurrency(Math.abs(limitNum - spent), currency)} overspent`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/40 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Budget</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

