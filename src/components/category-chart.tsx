"use client";

import React, { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency } from "@/lib/utils";
import { CategoryIcon } from "./category-icon";
import { PieChart as PieChartIcon } from "lucide-react";

const EDITORIAL_PALETTE = [
  "#96CE96", // sage
  "#F99654", // peach
  "#F6DE68", // lemon
  "#DE96C8", // rose
  "#F9CBA9", // apricot
  "#0D0D0C", // ink
  "#ECD6E2", // warm lilac
  "#C2B59B", // cream sand
  "#8AA29E", // slate sage
  "#DDA15E", // golden ochre
];

export function CategoryChart() {
  const { selectedMonth, getCategorySpending, getMonthSummary, currency, setQuickAddOpen } =
    useExpenseStore();
  const summary = getMonthSummary(selectedMonth);
  const categoryStats = getCategorySpending(selectedMonth);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Filter to only categories that have spending > 0, sort descending
  const activeCategories = useMemo(() => {
    return categoryStats
      .filter((c) => c.spent > 0)
      .sort((a, b) => b.spent - a.spent);
  }, [categoryStats]);

  const totalSpent = summary.totalSpent;

  // Empty state: cream card + thin line-art illustration (1px stroke) + white space + black pill button
  if (activeCategories.length === 0 || totalSpent === 0) {
    return (
      <div className="p-12 sm:p-16 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center min-h-[380px] text-center">
        <div className="w-16 h-16 rounded-full border border-[#0D0D0C]/[0.12] flex items-center justify-center text-[#0D0D0C]/60 mb-5">
          <PieChartIcon className="w-8 h-8 stroke-[1]" />
        </div>
        <h4 className="text-xl font-medium text-[#0D0D0C] tracking-[-0.02em]">
          No Spending Data
        </h4>
        <p className="text-sm text-[#0D0D0C]/56 max-w-sm mt-1.5 mb-7">
          No expenses recorded for this month yet. Add your first expense to see your category breakdown.
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

  const chartData = activeCategories.map((c, idx) => ({
    name: c.category.name,
    value: c.spent,
    color: c.category.color || EDITORIAL_PALETTE[idx % EDITORIAL_PALETTE.length],
    icon: c.category.icon,
    percentage: Math.round((c.spent / totalSpent) * 100),
  }));

  const activeItem = activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <div className="p-6 sm:p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[16px] font-normal text-[#0D0D0C]/56">
            Category Breakdown
          </h3>
          <p className="text-xs text-[#0D0D0C]/42 mt-0.5">
            Distribution of monthly spending
          </p>
        </div>
        <span className="text-xs font-normal px-3 py-1 rounded-full border border-[#0D0D0C]/[0.08] bg-[#FBF6EF] text-[#0D0D0C]">
          {activeCategories.length} categories
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Donut Chart with center label */}
        <div className="relative w-full h-[230px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={96}
                paddingAngle={2.5}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                animationDuration={600}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#FFFDFA"
                    strokeWidth={2}
                    className="cursor-pointer transition-opacity hover:opacity-85"
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] rounded-[14px] p-3 shadow-xl">
                        <div className="text-xs text-[#0D0D0C]/56">{data.name}</div>
                        <div className="text-base font-medium text-[#0D0D0C] tracking-tight">
                          {formatCurrency(data.value, currency)}
                        </div>
                        <div className="text-[11px] text-[#0D0D0C]/42">
                          {data.percentage}% of total
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center hover indicator */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {activeItem ? (
              <>
                <span className="text-xs text-[#0D0D0C]/56 max-w-[90px] truncate">
                  {activeItem.name}
                </span>
                <span className="text-lg font-medium tracking-tight text-[#0D0D0C]">
                  {activeItem.percentage}%
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] text-[#0D0D0C]/42">Total</span>
                <span className="text-base font-medium tracking-tight text-[#0D0D0C]">
                  {formatCurrency(totalSpent, currency, true)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Category breakdown rows */}
        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
          {chartData.map((item, idx) => (
            <div
              key={item.name}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`flex items-center justify-between p-2.5 rounded-[14px] transition-all cursor-pointer ${
                activeIndex === idx
                  ? "bg-[#FBF6EF] shadow-sm"
                  : "hover:bg-[#FBF6EF]/60"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-normal text-[#0D0D0C] truncate">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium text-[#0D0D0C]">
                  {formatCurrency(item.value, currency)}
                </span>
                <span className="text-[11px] text-[#0D0D0C]/42 min-w-[32px] text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
