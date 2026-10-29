"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, Flame } from "lucide-react";

export function DailyChart() {
  const { selectedMonth, getDailySpending, getMonthSummary, currency } =
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

  if (summary.totalSpent === 0) {
    return (
      <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm flex flex-col items-center justify-center min-h-[340px] text-center">
        <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
          <BarChart3 className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">No Daily Activity</h4>
        <p className="text-xs text-muted-foreground max-w-xs mt-1">
          Start logging expenses to observe your daily spending flow across {summary.month}.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold tracking-tight uppercase tracking-wider text-muted-foreground">
            Daily Spending Flow
          </h3>
          <p className="text-xs text-muted-foreground">
            Day-by-day expenditure pattern
          </p>
        </div>

        {peakDay.spent > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 fill-amber-500/20" />
            <span>
              Peak: Day {peakDay.day} ({formatCurrency(peakDay.spent, currency, true)})
            </span>
          </div>
        )}
      </div>

      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dailyData}
            margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
          >
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              interval={window && window.innerWidth < 640 ? 4 : 2}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => formatCurrency(v, currency, true)}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted) / 0.4)", radius: 6 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-xl p-2.5 shadow-xl text-xs space-y-1">
                      <div className="font-semibold text-foreground">
                        Day {data.day} ({data.date})
                      </div>
                      <div className="flex justify-between gap-4 font-mono text-muted-foreground">
                        <span>Spent:</span>
                        <span className="font-bold text-mint-500">
                          {formatCurrency(data.spent, currency)}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {data.count} {data.count === 1 ? "expense" : "expenses"}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {summary.dailyAverage > 0 && (
              <ReferenceLine
                y={summary.dailyAverage}
                stroke="#10b981"
                strokeDasharray="3 3"
                strokeOpacity={0.6}
              />
            )}
            <Bar dataKey="spent" radius={[6, 6, 2, 2]}>
              {dailyData.map((entry, index) => {
                const isPeak = entry.day === peakDay.day && entry.spent > 0;
                return (
                  <Cell
                    key={`bar-${index}`}
                    fill={
                      isPeak
                        ? "#f59e0b" // Warm Amber for peak
                        : entry.spent > 0
                        ? "#10b981" // Mint Emerald for active spending
                        : "hsl(var(--muted) / 0.4)" // subtle empty bar
                    }
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-mint-500" />
            Normal Days
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            Highest Day
          </span>
        </div>
        <span className="font-mono text-[11px]">
          Avg: {formatCurrency(summary.dailyAverage, currency, true)}/day
        </span>
      </div>
    </div>
  );
}

