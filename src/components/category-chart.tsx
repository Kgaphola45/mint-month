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

export function CategoryChart() {
  const { selectedMonth, getCategorySpending, getMonthSummary, currency } =
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

  if (activeCategories.length === 0 || totalSpent === 0) {
    return (
      <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm flex flex-col items-center justify-center min-h-[340px] text-center">
        <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
          <PieChartIcon className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">No Spending Data</h4>
        <p className="text-xs text-muted-foreground max-w-xs mt-1">
          No expenses recorded for this month yet. Add your first expense to see your category breakdown.
        </p>
      </div>
    );
  }

  const chartData = activeCategories.map((c) => ({
    name: c.category.name,
    value: c.spent,
    color: c.category.color,
    icon: c.category.icon,
    percentage: Math.round((c.spent / totalSpent) * 100),
  }));

  const activeItem = activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-foreground uppercase tracking-wider text-muted-foreground">
            Category Breakdown
          </h3>
          <p className="text-xs text-muted-foreground">
            Distribution of expenses for this month
          </p>
        </div>
        <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-xl bg-muted/70 text-foreground">
          {activeCategories.length} categories
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Donut Chart with center label */}
        <div className="relative w-full h-[220px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={92}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                animationDuration={600}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="transparent"
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border rounded-xl p-2.5 shadow-xl text-xs space-y-1">
                        <div className="flex items-center gap-2 font-semibold text-foreground">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: data.color }}
                          />
                          <span>{data.name}</span>
                        </div>
                        <div className="flex justify-between gap-4 font-mono text-muted-foreground">
                          <span>{formatCurrency(data.value, currency)}</span>
                          <span className="font-bold text-foreground">
                            {data.percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Donut label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {activeItem ? (
              <>
                <span className="text-[11px] font-semibold text-muted-foreground max-w-[100px] truncate">
                  {activeItem.name}
                </span>
                <span className="text-base font-bold font-mono text-foreground">
                  {activeItem.percentage}%
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {formatCurrency(activeItem.value, currency, true)}
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] font-medium text-muted-foreground">
                  Total
                </span>
                <span className="text-base font-bold font-mono text-foreground">
                  {formatCurrency(totalSpent, currency, true)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  100%
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend List */}
        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
          {activeCategories.map((item, idx) => {
            const percentage = Math.round((item.spent / totalSpent) * 100);
            const isHovered = activeIndex === idx;

            return (
              <div
                key={item.category.id}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${isHovered
                    ? "bg-muted/80 scale-[1.01]"
                    : "hover:bg-muted/40"
                  }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: item.category.color }}
                  >
                    <CategoryIcon
                      name={item.category.icon}
                      className="w-3.5 h-3.5"
                    />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-foreground truncate">
                      {item.category.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {item.transactionCount} {item.transactionCount === 1 ? "expense" : "expenses"}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold font-mono text-foreground">
                    {formatCurrency(item.spent, currency)}
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground">
                    {percentage}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
