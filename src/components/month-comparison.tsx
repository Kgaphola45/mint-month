"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { format, subMonths, parse } from "date-fns";
import {
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Scale,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency, formatMonthYear } from "@/lib/utils";
import { CategoryIcon } from "./category-icon";

export function MonthComparison() {
  const {
    selectedMonth,
    getMonthSummary,
    getCategorySpending,
    getHistoricalTrends,
    currency,
  } = useExpenseStore();

  const currentSummary = getMonthSummary(selectedMonth);

  // Compute previous month
  const prevMonthStr = useMemo(() => {
    try {
      const d = parse(selectedMonth, "yyyy-MM", new Date());
      return format(subMonths(d, 1), "yyyy-MM");
    } catch {
      return "";
    }
  }, [selectedMonth]);

  const prevSummary = getMonthSummary(prevMonthStr);

  const currentCatSpending = getCategorySpending(selectedMonth);
  const prevCatSpending = getCategorySpending(prevMonthStr);

  const historicalTrends = getHistoricalTrends(6);

  // Spending difference calculations
  const diffAmount = currentSummary.totalSpent - prevSummary.totalSpent;
  const isSpendingLess = diffAmount < 0;
  const percentageDiff =
    prevSummary.totalSpent > 0
      ? Math.round((Math.abs(diffAmount) / prevSummary.totalSpent) * 100)
      : 0;

  // Category comparisons
  const categoryDiffs = useMemo(() => {
    const list = currentCatSpending.map((c) => {
      const prev = prevCatSpending.find((p) => p.category.id === c.category.id);
      const prevSpent = prev ? prev.spent : 0;
      const delta = c.spent - prevSpent;
      return {
        category: c.category,
        currentSpent: c.spent,
        prevSpent,
        delta,
      };
    });

    // Only include categories that had spending in either month
    return list
      .filter((item) => item.currentSpent > 0 || item.prevSpent > 0)
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  }, [currentCatSpending, prevCatSpending]);

  return (
    <div className="space-y-6">
      {/* Overview Head-to-Head Card */}
      <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Scale className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Month-over-Month Comparison
              </h3>
              <p className="text-xs text-muted-foreground">
                {formatMonthYear(selectedMonth)} vs {formatMonthYear(prevMonthStr)}
              </p>
            </div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 ${isSpendingLess
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : diffAmount > 0
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "bg-muted text-muted-foreground"
              }`}
          >
            {isSpendingLess ? (
              <>
                <TrendingDown className="w-4 h-4" />
                <span>{percentageDiff}% Less Spent!</span>
              </>
            ) : diffAmount > 0 ? (
              <>
                <TrendingUp className="w-4 h-4" />
                <span>+{percentageDiff}% More Spent</span>
              </>
            ) : (
              <span>Identical Spending</span>
            )}
          </div>
        </div>

        {/* Head-to-Head numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Month */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              {formatMonthYear(selectedMonth)} (Current)
            </span>
            <div className="text-2xl font-bold font-mono text-foreground">
              {formatCurrency(currentSummary.totalSpent, currency)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Budget: {formatCurrency(currentSummary.totalBudget, currency, true)}
            </div>
          </div>

          {/* Previous Month */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              {formatMonthYear(prevMonthStr)} (Previous)
            </span>
            <div className="text-2xl font-bold font-mono text-foreground">
              {formatCurrency(prevSummary.totalSpent, currency)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Budget: {formatCurrency(prevSummary.totalBudget, currency, true)}
            </div>
          </div>

          {/* Net Difference */}
          <div
            className={`p-4 rounded-2xl border ${isSpendingLess
                ? "bg-emerald-500/5 border-emerald-500/30"
                : "bg-rose-500/5 border-rose-500/30"
              }`}
          >
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Net Change
            </span>
            <div
              className={`text-2xl font-bold font-mono ${isSpendingLess
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
                }`}
            >
              {diffAmount > 0 ? "+" : ""}
              {formatCurrency(diffAmount, currency)}
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              {isSpendingLess
                ? `Saved ${formatCurrency(Math.abs(diffAmount), currency)} compared to last month`
                : `Increased spend by ${formatCurrency(diffAmount, currency)}`}
            </div>
          </div>
        </div>
      </div>

      {/* 6-Month Spending Trend Line Chart */}
      <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold tracking-tight uppercase tracking-wider text-muted-foreground">
              6-Month Spending Trajectory
            </h3>
            <p className="text-xs text-muted-foreground">
              Month-over-month trend vs monthly budget
            </p>
          </div>
        </div>

        <div className="w-full h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historicalTrends}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border) / 0.5)"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => formatCurrency(v, currency, true)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border rounded-xl p-3 shadow-xl text-xs space-y-1.5">
                        <div className="font-bold text-foreground">
                          {data.label}
                        </div>
                        <div className="flex justify-between gap-4 font-mono">
                          <span className="text-mint-500 font-semibold">Spent:</span>
                          <span className="font-bold text-foreground">
                            {formatCurrency(data.spent, currency)}
                          </span>
                        </div>
                        {data.budget > 0 && (
                          <div className="flex justify-between gap-4 font-mono text-muted-foreground">
                            <span>Budget:</span>
                            <span>{formatCurrency(data.budget, currency)}</span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
              />
              <Line
                name="Actual Spent"
                type="monotone"
                dataKey="spent"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
              <Line
                name="Budget Limit"
                type="monotone"
                dataKey="budget"
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Delta Breakdown */}
      <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold tracking-tight uppercase tracking-wider text-muted-foreground">
            Category Spending Shifts
          </h3>
          <p className="text-xs text-muted-foreground">
            Where your spending changed most between months
          </p>
        </div>

        <div className="divide-y divide-border/40">
          {categoryDiffs.map((item) => {
            const isDown = item.delta < 0;
            return (
              <div
                key={item.category.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: item.category.color }}
                  >
                    <CategoryIcon name={item.category.icon} className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-semibold text-foreground block truncate">
                      {item.category.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {formatCurrency(item.currentSpent, currency)} vs{" "}
                      {formatCurrency(item.prevSpent, currency)}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-xs font-bold font-mono flex items-center justify-end gap-1 ${isDown
                        ? "text-emerald-600 dark:text-emerald-400"
                        : item.delta > 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-muted-foreground"
                      }`}
                  >
                    {isDown ? (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    ) : item.delta > 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : null}
                    <span>
                      {item.delta > 0 ? "+" : ""}
                      {formatCurrency(item.delta, currency)}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {isDown ? "decreased" : item.delta > 0 ? "increased" : "unchanged"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
