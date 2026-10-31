"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

export function DailyChart() {
  const { selectedMonth, getDailySpending, getMonthSummary, currency, setQuickAddOpen } =
    useExpenseStore();
  const summary = getMonthSummary(selectedMonth);
  const dailyData = getDailySpending(selectedMonth);

  // Find peak spending day
  const peakDay = useMemo(() => {
    return dailyData.reduce(
      (max, d) => (d.spent > max.spent ? d : max),
      { day: 0, spent: 0, date: "", count: 0 }
    );
  }, [dailyData]);

  // Empty state: cream card + thin line-art illustration (1px stroke) + white space + black pill button
  if (summary.totalSpent === 0) {
    return (
      <div className="p-12 sm:p-16 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center min-h-[380px] text-center">
        <div className="w-16 h-16 rounded-full border border-[#0D0D0C]/[0.12] flex items-center justify-center text-[#0D0D0C]/60 mb-5">
          <BarChart3 className="w-8 h-8 stroke-[1]" />
        </div>
        <h4 className="text-xl font-medium text-[#0D0D0C] tracking-[-0.02em]">
          No Daily Activity
        </h4>
        <p className="text-sm text-[#0D0D0C]/56 max-w-sm mt-1.5 mb-7">
          Start logging expenses to observe your daily spending flow across {summary.month}.
        </p>
        <button
          onClick={() => setQuickAddOpen(true)}
          className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm"
        >
          + Add First Expense
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[16px] font-normal text-[#0D0D0C]/56">
            Daily Spending Flow
          </h3>
          <p className="text-xs text-[#0D0D0C]/42 mt-0.5">
            Day-by-day cash outflows
          </p>
        </div>

        {peakDay.spent > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#0D0D0C]/[0.08] bg-[#FBF6EF] text-xs font-normal text-[#0D0D0C]">
            <span>
              Peak: Day {peakDay.day} ({formatCurrency(peakDay.spent, currency, true)})
            </span>
          </div>
        )}
      </div>

      <div className="w-full h-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <XAxis
              dataKey="day"
              stroke="rgba(13, 13, 12, 0.2)"
              fontSize={11}
              tickLine={false}
              tick={{ fill: "rgba(13, 13, 12, 0.42)", fontFamily: "var(--font-inter-tight)" }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="rgba(13, 13, 12, 0.2)"
              fontSize={11}
              tickLine={false}
              tick={{ fill: "rgba(13, 13, 12, 0.42)", fontFamily: "var(--font-inter-tight)" }}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
            />
            <Tooltip
              cursor={{ fill: "rgba(13, 13, 12, 0.04)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] rounded-[14px] p-3 shadow-xl">
                      <div className="text-[11px] text-[#0D0D0C]/56">{data.date}</div>
                      <div className="text-base font-medium text-[#0D0D0C] tracking-tight mt-0.5">
                        {formatCurrency(data.spent, currency)}
                      </div>
                      <div className="text-[11px] text-[#0D0D0C]/42">
                        {data.count} transaction{data.count === 1 ? "" : "s"}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="spent" radius={[4, 4, 0, 0]} maxBarSize={28}>
              {dailyData.map((entry, index) => {
                const isPeak = entry.day === peakDay.day && entry.spent > 0;
                return (
                  <Cell
                    key={`bar-${index}`}
                    fill={isPeak ? "#F99654" : "#0D0D0C"}
                    className="transition-opacity hover:opacity-80"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
