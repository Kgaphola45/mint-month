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
    <div className="space-y-8">
      {/* Overview Head-to-Head Card */}
      <div className="p-8 rounded-[24px] bg-[#FFFDF8] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[16px] font-normal text-[#0D0D0C]/56">
              Month-over-Month Comparison
            </h3>
            <p className="text-xs text-[#0D0D0C]/42 mt-0.5">
              {formatMonthYear(selectedMonth)} vs {formatMonthYear(prevMonthStr)}
            </p>
          </div>

          <div
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
              isSpendingLess
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : diffAmount > 0
                ? "bg-rose-50 text-rose-800 border-rose-200"
                : "bg-[#FBF6EF] text-[#0D0D0C] border-[#0D0D0C]/[0.08]"
            }`}
          >
            {isSpendingLess ? (
              <>
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{percentageDiff}% Less Spent</span>
              </>
            ) : diffAmount > 0 ? (
              <>
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{percentageDiff}% More Spent</span>
              </>
            ) : (
              <span>Identical Spending</span>
            )}
          </div>
        </div>

        {/* Head-to-Head numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Current Month */}
          <div className="p-6 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
            <span className="text-xs text-[#0D0D0C]/56 block mb-1">
              {formatMonthYear(selectedMonth)} (Current)
            </span>
            <div className="text-3xl font-medium tracking-tight text-[#0D0D0C]">
              {formatCurrency(currentSummary.totalSpent, currency)}
            </div>
            <div className="text-xs text-[#0D0D0C]/42 mt-1">
              Budget: {formatCurrency(currentSummary.totalBudget, currency, true)}
            </div>
          </div>

          {/* Previous Month */}
          <div className="p-6 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
            <span className="text-xs text-[#0D0D0C]/56 block mb-1">
              {formatMonthYear(prevMonthStr)} (Previous)
            </span>
            <div className="text-3xl font-medium tracking-tight text-[#0D0D0C]">
              {formatCurrency(prevSummary.totalSpent, currency)}
            </div>
            <div className="text-xs text-[#0D0D0C]/42 mt-1">
              Budget: {formatCurrency(prevSummary.totalBudget, currency, true)}
            </div>
          </div>

          {/* Net Difference */}
          <div className="p-6 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
            <span className="text-xs text-[#0D0D0C]/56 block mb-1">
              Net Change
            </span>
            <div className="text-3xl font-medium tracking-tight text-[#0D0D0C]">
              {diffAmount > 0 ? "+" : ""}
              {formatCurrency(diffAmount, currency)}
            </div>
            <div className="text-xs text-[#0D0D0C]/56 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#0D0D0C]/50" />
              <span>
                {isSpendingLess
                  ? `Saved ${formatCurrency(Math.abs(diffAmount), currency)} vs last month`
                  : `Spent ${formatCurrency(diffAmount, currency)} more than last month`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Month Spending Trend Line Chart */}
      <div className="p-8 rounded-[24px] bg-[#FFFDF8] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[16px] font-normal text-[#0D0D0C]/56">
              6-Month Spending Trajectory
            </h3>
            <p className="text-xs text-[#0D0D0C]/42 mt-0.5">
              Multi-month historical momentum vs target budget
            </p>
          </div>
        </div>

        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historicalTrends}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="2 2"
                vertical={false}
                stroke="rgba(13, 13, 12, 0.06)"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "rgba(13, 13, 12, 0.42)", fontFamily: "var(--font-inter-tight)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "rgba(13, 13, 12, 0.42)", fontFamily: "var(--font-inter-tight)" }}
                tickFormatter={(v) => formatCurrency(v, currency, true)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#FFFDF8] border border-[#0D0D0C]/[0.1] rounded-[14px] p-3 shadow-xl text-xs space-y-1.5">
                        <div className="font-medium text-[#0D0D0C]">
                          {data.label}
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-[#0D0D0C]/56">Spent:</span>
                          <span className="font-medium text-[#0D0D0C]">
                            {formatCurrency(data.spent, currency)}
                          </span>
                        </div>
                        {data.budget > 0 && (
                          <div className="flex justify-between gap-4 text-[#0D0D0C]/56">
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
                wrapperStyle={{ fontSize: 12, paddingBottom: 10, fontFamily: "var(--font-inter-tight)" }}
              />
              <Line
                name="Actual Spent"
                type="monotone"
                dataKey="spent"
                stroke="#0D0D0C"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#0D0D0C", strokeWidth: 2, stroke: "#FFFDF8" }}
                activeDot={{ r: 6 }}
              />
              <Line
                name="Budget Limit"
                type="monotone"
                dataKey="budget"
                stroke="#F99654"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Delta Breakdown */}
      <div className="p-8 rounded-[24px] bg-[#FFFDF8] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="mb-6">
          <h3 className="text-[16px] font-normal text-[#0D0D0C]/56">
            Category Spending Shifts
          </h3>
          <p className="text-xs text-[#0D0D0C]/42 mt-0.5">
            Where your allocations moved most between months
          </p>
        </div>

        <div className="divide-y divide-[#0D0D0C]/[0.05]">
          {categoryDiffs.map((item) => {
            const isDown = item.delta < 0;
            return (
              <div
                key={item.category.id}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full border border-[#0D0D0C]/[0.08] flex items-center justify-center shrink-0 bg-[#FFFDF8]"
                    style={{ color: item.category.color || "#0D0D0C" }}
                  >
                    <CategoryIcon iconName={item.category.icon} className="w-4 h-4 stroke-[1.5]" />
                  </div>
                  <div className="truncate">
                    <span className="text-sm font-medium text-[#0D0D0C] block truncate">
                      {item.category.name}
                    </span>
                    <span className="text-xs text-[#0D0D0C]/42">
                      {formatCurrency(item.currentSpent, currency)} vs{" "}
                      {formatCurrency(item.prevSpent, currency)}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-sm font-medium flex items-center justify-end gap-1 ${
                      isDown
                        ? "text-emerald-700"
                        : item.delta > 0
                        ? "text-rose-700"
                        : "text-[#0D0D0C]/56"
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
                  <span className="text-[10px] text-[#0D0D0C]/42">
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
