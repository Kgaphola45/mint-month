"use client";

import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";
import { format, subMonths, parse } from "date-fns";
import {
  TrendingDown,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Lock,
  Wallet,
  Clock,
  Layers,
  CreditCard,
  Building2,
  Banknote,
  Zap,
  BarChart3,
  Flame,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency, formatMonthYear, getTodayDateStr } from "@/lib/utils";
import { CategoryIcon } from "./category-icon";
import {
  computeCumulativePace,
  computeDayOfWeekDistribution,
  computeCashflowArchitecture,
  computeTopOutflows,
  computePaymentMethodBreakdown,
} from "@/lib/analytics";
import { PaymentMethod } from "@/types";

export function MonthComparison() {
  const {
    selectedMonth,
    getMonthSummary,
    getCategorySpending,
    getHistoricalTrends,
    getExpensesForMonth,
    getRecurringTimeline,
    getCategoryById,
    incomes,
    currency,
  } = useExpenseStore();

  const [activeTab, setActiveTab] = useState<"all" | "pace" | "patterns" | "outflows">("all");

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

  const currentExpenses = useMemo(
    () => getExpensesForMonth(selectedMonth),
    [getExpensesForMonth, selectedMonth]
  );
  const prevExpenses = useMemo(
    () => getExpensesForMonth(prevMonthStr),
    [getExpensesForMonth, prevMonthStr]
  );

  const currentCatSpending = getCategorySpending(selectedMonth);
  const prevCatSpending = getCategorySpending(prevMonthStr);
  const historicalTrends = getHistoricalTrends(6);
  const timeline = getRecurringTimeline(selectedMonth);

  const todayStr = getTodayDateStr();
  const currentIncome = incomes[selectedMonth] || incomes.default || 25000;

  // 1. Spending difference calculations
  const diffAmount = currentSummary.totalSpent - prevSummary.totalSpent;
  const isSpendingLess = diffAmount < 0;
  const percentageDiff =
    prevSummary.totalSpent > 0
      ? Math.round((Math.abs(diffAmount) / prevSummary.totalSpent) * 100)
      : 0;

  // 2. Cumulative Pace Analytics
  const cumulativeData = useMemo(() => {
    return computeCumulativePace(
      currentExpenses,
      prevExpenses,
      selectedMonth,
      prevMonthStr,
      currentSummary.totalBudget,
      todayStr
    );
  }, [currentExpenses, prevExpenses, selectedMonth, prevMonthStr, currentSummary.totalBudget, todayStr]);

  // 3. Day of Week Distribution
  const dayOfWeekSummary = useMemo(() => {
    return computeDayOfWeekDistribution(currentExpenses);
  }, [currentExpenses]);

  // 4. Cashflow Architecture (50/30/20)
  const cashflowArch = useMemo(() => {
    return computeCashflowArchitecture(
      currentExpenses,
      timeline.summary.totalCommitted,
      currentIncome
    );
  }, [currentExpenses, timeline.summary.totalCommitted, currentIncome]);

  // 5. Top 5 Outflow Drivers
  const topOutflows = useMemo(() => {
    return computeTopOutflows(currentExpenses, 5);
  }, [currentExpenses]);

  // 6. Payment Method Breakdown
  const paymentBreakdown = useMemo(() => {
    return computePaymentMethodBreakdown(currentExpenses);
  }, [currentExpenses]);

  // 7. Category comparisons
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

    return list
      .filter((item) => item.currentSpent > 0 || item.prevSpent > 0)
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  }, [currentCatSpending, prevCatSpending]);

  const paymentIcons: Record<PaymentMethod, React.ReactNode> = {
    Card: <CreditCard className="w-3.5 h-3.5 stroke-[1.5]" />,
    Bank: <Building2 className="w-3.5 h-3.5 stroke-[1.5]" />,
    Cash: <Banknote className="w-3.5 h-3.5 stroke-[1.5]" />,
    EFT: <Building2 className="w-3.5 h-3.5 stroke-[1.5]" />,
    "Instant EFT": <Zap className="w-3.5 h-3.5 stroke-[1.5]" />,
  };

  return (
    <div className="space-y-8">
      {/* Overview Head-to-Head Card */}
      <div className="p-6 sm:p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Current Month */}
          <div className="p-5 sm:p-6 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
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
          <div className="p-5 sm:p-6 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
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
          <div className="p-5 sm:p-6 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
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

      {/* 2. Cumulative Spending Burn-Rate Pace Curve */}
      <div className="p-6 sm:p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] sm:text-[15px] font-normal text-[#0D0D0C]/56">
                Cumulative Run-Rate Velocity
              </span>
              <span className="px-2.5 py-0.5 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FBF6EF] text-[11px] text-[#0D0D0C] font-normal">
                Day 1 to 31 Curve
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-[#0D0D0C] mt-1">
              Spending Burn Pace vs. Prior Month & Target
            </h3>
            <p className="text-xs sm:text-sm text-[#0D0D0C]/56 mt-0.5">
              Monitor day-by-day acceleration to see if you are tracking above or below last month's pace.
            </p>
          </div>
        </div>

        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={cumulativeData}
              margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
            >
              <defs>
                <linearGradient id="currentPaceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D0D0C" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0D0D0C" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="2 2"
                vertical={false}
                stroke="rgba(13, 13, 12, 0.06)"
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickFormatter={(d) => `d${d}`}
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
                      <div className="bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] rounded-[16px] p-3.5 shadow-xl text-xs space-y-2 min-w-[190px]">
                        <div className="font-medium text-[#0D0D0C] pb-1 border-b border-[#0D0D0C]/[0.08]">
                          {data.label} ({formatMonthYear(selectedMonth)})
                        </div>
                        {data.currentSpent !== null && (
                          <div className="flex justify-between gap-4">
                            <span className="text-[#0D0D0C]/60 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#0D0D0C]" />
                              This Month:
                            </span>
                            <span className="font-medium text-[#0D0D0C]">
                              {formatCurrency(data.currentSpent, currency)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between gap-4">
                          <span className="text-[#0D0D0C]/60 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#0D0D0C]/35" />
                            Prior Month:
                          </span>
                          <span className="font-normal text-[#0D0D0C]/75">
                            {formatCurrency(data.prevSpent, currency)}
                          </span>
                        </div>
                        {data.budgetPace > 0 && (
                          <div className="flex justify-between gap-4 text-[#0D0D0C]/60">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#F99654]" />
                              Target Pace:
                            </span>
                            <span>{formatCurrency(data.budgetPace, currency)}</span>
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
              <Area
                name={`${formatMonthYear(selectedMonth)} (Current)`}
                type="monotone"
                dataKey="currentSpent"
                stroke="#0D0D0C"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#currentPaceGradient)"
                dot={false}
                activeDot={{ r: 5, fill: "#0D0D0C" }}
              />
              <Line
                name={`${formatMonthYear(prevMonthStr)} (Prior)`}
                type="monotone"
                dataKey="prevSpent"
                stroke="rgba(13, 13, 12, 0.35)"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
              {currentSummary.totalBudget > 0 && (
                <Line
                  name="Linear Budget Target"
                  type="monotone"
                  dataKey="budgetPace"
                  stroke="#F99654"
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                  dot={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Grid: Cashflow Architecture (50/30/20) + Day-of-Week Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cashflow Architecture (50/30/20) */}
        <div className="p-6 sm:p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[14px] font-normal text-[#0D0D0C]/56">
                Cashflow Architecture
              </span>
              <h3 className="text-xl font-medium tracking-tight text-[#0D0D0C] mt-0.5">
                Fixed vs. Discretionary Outflow
              </h3>
            </div>
            <span
              className="px-2.5 py-1 rounded-full text-[11px] font-medium"
              style={{
                backgroundColor: `${cashflowArch.healthColor}20`,
                color: "#0D0D0C",
              }}
            >
              {cashflowArch.healthLabel}
            </span>
          </div>

          <p className="text-xs text-[#0D0D0C]/56">
            Proportion of your monthly income going to non-negotiable commitments vs flexible spending.
          </p>

          {/* Allocation stacked visual bar */}
          <div className="space-y-2 pt-2">
            <div className="w-full h-3 rounded-full bg-[#0D0D0C]/[0.06] overflow-hidden flex">
              <div
                className="h-full bg-[#0D0D0C] transition-all duration-500"
                style={{ width: `${cashflowArch.fixedPercent}%` }}
                title={`Fixed: ${cashflowArch.fixedPercent}%`}
              />
              <div
                className="h-full bg-[#F99654] transition-all duration-500"
                style={{ width: `${cashflowArch.variablePercent}%` }}
                title={`Variable: ${cashflowArch.variablePercent}%`}
              />
              <div
                className="h-full bg-[#96CE96] transition-all duration-500"
                style={{ width: `${cashflowArch.surplusPercent}%` }}
                title={`Surplus: ${cashflowArch.surplusPercent}%`}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#0D0D0C]/60 pt-0.5">
              <span>0%</span>
              <span>Target Fixed: &lt;50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* 3 Breakdown Cards */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-[18px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
              <div className="flex items-center gap-1.5 text-xs text-[#0D0D0C]/56 mb-1">
                <Lock className="w-3 h-3 stroke-[1.5]" />
                <span>Fixed</span>
              </div>
              <div className="text-lg font-medium text-[#0D0D0C]">
                {cashflowArch.fixedPercent}%
              </div>
              <span className="text-[11px] text-[#0D0D0C]/50 block mt-0.5">
                {formatCurrency(cashflowArch.fixedAmount, currency, true)}
              </span>
            </div>

            <div className="p-3.5 rounded-[18px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
              <div className="flex items-center gap-1.5 text-xs text-[#0D0D0C]/56 mb-1">
                <Wallet className="w-3 h-3 stroke-[1.5]" />
                <span>Flexible</span>
              </div>
              <div className="text-lg font-medium text-[#0D0D0C]">
                {cashflowArch.variablePercent}%
              </div>
              <span className="text-[11px] text-[#0D0D0C]/50 block mt-0.5">
                {formatCurrency(cashflowArch.variableAmount, currency, true)}
              </span>
            </div>

            <div className="p-3.5 rounded-[18px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
              <div className="flex items-center gap-1.5 text-xs text-[#0D0D0C]/56 mb-1">
                <Sparkles className="w-3 h-3 stroke-[1.5]" />
                <span>Surplus</span>
              </div>
              <div className="text-lg font-medium text-[#0D0D0C]">
                {cashflowArch.surplusPercent}%
              </div>
              <span className="text-[11px] text-[#0D0D0C]/50 block mt-0.5">
                {formatCurrency(cashflowArch.surplusAmount, currency, true)}
              </span>
            </div>
          </div>
        </div>

        {/* Day-of-Week Spending Heatmap & Distribution */}
        <div className="p-6 sm:p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[14px] font-normal text-[#0D0D0C]/56">
                Spending Rhythm
              </span>
              <h3 className="text-xl font-medium tracking-tight text-[#0D0D0C] mt-0.5">
                Day-of-Week Velocity
              </h3>
            </div>
            <div className="px-2.5 py-1 rounded-full text-[11px] bg-[#F4EBC6] text-[#0D0D0C] font-medium flex items-center gap-1">
              <Flame className="w-3 h-3 stroke-[2] text-[#0D0D0C]" />
              <span>Peak: {dayOfWeekSummary.peakDay}</span>
            </div>
          </div>

          <p className="text-xs text-[#0D0D0C]/56">
            Weekday average: {formatCurrency(dayOfWeekSummary.weekdayDailyAvg, currency)}/day · Weekend average: {formatCurrency(dayOfWeekSummary.weekendDailyAvg, currency)}/day.
          </p>

          <div className="w-full h-[180px] pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dayOfWeekSummary.days}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="2 2"
                  vertical={false}
                  stroke="rgba(13, 13, 12, 0.06)"
                />
                <XAxis
                  dataKey="shortName"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "rgba(13, 13, 12, 0.5)", fontFamily: "var(--font-inter-tight)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "rgba(13, 13, 12, 0.42)", fontFamily: "var(--font-inter-tight)" }}
                  tickFormatter={(v) => formatCurrency(v, currency, true)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] rounded-[14px] p-3 shadow-xl text-xs space-y-1">
                          <div className="font-medium text-[#0D0D0C]">
                            {data.dayName}
                          </div>
                          <div className="text-sm font-medium text-[#0D0D0C]">
                            {formatCurrency(data.spent, currency)}
                          </div>
                          <div className="text-[11px] text-[#0D0D0C]/50">
                            {data.count} transaction{data.count === 1 ? "" : "s"} ({data.percentage}%)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="spent" radius={[6, 6, 0, 0]}>
                  {dayOfWeekSummary.days.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.dayName === dayOfWeekSummary.peakDay
                          ? "#0D0D0C"
                          : "rgba(13, 13, 12, 0.22)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Grid: Top 5 Outflow Drivers & Payment Method Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Outflow Drivers */}
        <div className="p-6 sm:p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-normal text-[#0D0D0C]/56">
                Outflow Drivers
              </span>
              <span className="px-2.5 py-0.5 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FBF6EF] text-[11px] text-[#0D0D0C]">
                Top 5
              </span>
            </div>
            <h3 className="text-xl font-medium tracking-tight text-[#0D0D0C] mt-0.5">
              Largest Single Outflows This Month
            </h3>
            <p className="text-xs text-[#0D0D0C]/56 mt-0.5">
              High-impact purchases and fixed contracts driving the majority of this month's spending.
            </p>
          </div>

          <div className="divide-y divide-[#0D0D0C]/[0.05] pt-1">
            {topOutflows.map((item, idx) => {
              const cat = getCategoryById(item.categoryId);
              return (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 text-center text-xs font-medium text-[#0D0D0C]/40">
                      #{idx + 1}
                    </span>
                    <div
                      className="w-8 h-8 rounded-full border border-[#0D0D0C]/[0.08] flex items-center justify-center shrink-0 bg-[#FFFDFA]"
                      style={{ color: cat.color || "#0D0D0C" }}
                    >
                      <CategoryIcon iconName={cat.icon} className="w-4 h-4 stroke-[1.5]" />
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-medium text-[#0D0D0C] truncate flex items-center gap-2">
                        <span>{item.note}</span>
                        {item.isRecurring && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#0D0D0C]/[0.06] text-[#0D0D0C]/70">
                            Recurring
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#0D0D0C]/45">
                        {cat.name} · {item.date}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-medium text-[#0D0D0C]">
                      {formatCurrency(item.amount, currency)}
                    </div>
                    <span className="text-[10px] text-[#0D0D0C]/45">
                      {item.percentageOfTotal}% of month
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Channels Distribution */}
        <div className="p-6 sm:p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-5">
          <div>
            <span className="text-[14px] font-normal text-[#0D0D0C]/56">
              Payment Channels
            </span>
            <h3 className="text-xl font-medium tracking-tight text-[#0D0D0C] mt-0.5">
              Payment Method Breakdown
            </h3>
            <p className="text-xs text-[#0D0D0C]/56 mt-0.5">
              Spending distribution across cards, EFTs, debit orders, and cash.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {paymentBreakdown.map((pm) => (
              <div key={pm.method} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#0D0D0C]">
                    <span className="text-[#0D0D0C]/60">
                      {paymentIcons[pm.method] || <CreditCard className="w-3.5 h-3.5" />}
                    </span>
                    <span className="font-medium">{pm.method}</span>
                    <span className="text-[#0D0D0C]/40">
                      ({pm.count} txn{pm.count === 1 ? "" : "s"})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-[#0D0D0C]">
                      {formatCurrency(pm.amount, currency)}
                    </span>
                    <span className="text-[#0D0D0C]/50 ml-1.5">({pm.percentage}%)</span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-[#0D0D0C]/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0D0D0C] transition-all duration-300"
                    style={{ width: `${pm.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. 6-Month Historical Spending Trajectory */}
      <div className="p-6 sm:p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
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
                      <div className="bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] rounded-[14px] p-3 shadow-xl text-xs space-y-1.5">
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
                dot={{ r: 4, fill: "#0D0D0C", strokeWidth: 2, stroke: "#FFFDFA" }}
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

      {/* 6. Category Delta Breakdown */}
      <div className="p-6 sm:p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
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
                    className="w-9 h-9 rounded-full border border-[#0D0D0C]/[0.08] flex items-center justify-center shrink-0 bg-[#FFFDFA]"
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
