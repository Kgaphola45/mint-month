"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Shield,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency, getBudgetStatus } from "@/lib/utils";

export function StatsCards() {
  const { selectedMonth, getMonthSummary, currency, setBudgetModalOpen } =
    useExpenseStore();
  const summary = getMonthSummary(selectedMonth);

  const budgetStatus = getBudgetStatus(summary.totalSpent, summary.totalBudget);

  // Projected spend at end of month based on daily run rate
  const projectedMonthTotal = Math.round(
    summary.dailyAverage * summary.daysInMonth
  );

  const cards = [
    {
      title: "Total Spent",
      value: formatCurrency(summary.totalSpent, currency),
      subtitle: `${summary.daysPassed} days tracked`,
      icon: Wallet,
      indicator: (
        <span className="text-xs font-normal text-[#0D0D0C]/56">
          {summary.daysPassed} of {summary.daysInMonth} days
        </span>
      ),
    },
    {
      title: "Monthly Budget",
      value:
        summary.totalBudget > 0
          ? formatCurrency(summary.totalBudget, currency)
          : "Not Set",
      subtitle:
        summary.totalBudget > 0
          ? `${summary.sortedCount}/${summary.totalCategoriesWithBudget} sorted ✓ • ${budgetStatus.percentage}% used`
          : "Click to set monthly budget",
      icon: BarChart3,
      onClick: () => setBudgetModalOpen(true),
      actionButton: (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setBudgetModalOpen(true);
          }}
          className="px-3 py-1 rounded-[7px] border-[1.4px] border-[#0D0D0C]/20 hover:border-[#0D0D0C] text-xs font-medium text-[#0D0D0C] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] transition-all"
        >
          Edit
        </button>
      ),
      progress: summary.totalBudget > 0 ? (
        <div className="w-full h-1 bg-[#0D0D0C]/[0.06] rounded-full overflow-hidden mt-3">
          <div
            className="h-full rounded-full transition-all duration-500 bg-[#0D0D0C]"
            style={{ width: `${Math.min(budgetStatus.percentage, 100)}%` }}
          />
        </div>
      ) : null,
    },
    {
      title: summary.remaining >= 0 ? "Remaining Safe" : "Over Budget",
      value: formatCurrency(Math.abs(summary.remaining), currency),
      subtitle:
        summary.remaining >= 0
          ? `${formatCurrency(
              summary.daysInMonth - summary.daysPassed > 0
                ? summary.remaining / (summary.daysInMonth - summary.daysPassed)
                : summary.remaining,
              currency,
              true
            )}/day left`
          : "Exceeded monthly limit",
      icon: Shield,
      alert: budgetStatus.status === "danger" || summary.remaining < 0,
      indicator: (
        <span className="text-[11px] font-normal text-[#0D0D0C]/70 px-2.5 py-0.5 rounded-full border border-[#0D0D0C]/[0.1]">
          {summary.remaining >= 0 ? "Within Budget" : "Overspent"}
        </span>
      ),
    },
    {
      title: "Daily Average",
      value: formatCurrency(summary.dailyAverage, currency),
      subtitle: `Projected: ${formatCurrency(projectedMonthTotal, currency, true)}`,
      icon: Calendar,
      indicator: (
        <span className="text-xs font-normal text-[#0D0D0C]/56">
          Daily Run Rate
        </span>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            onClick={card.onClick}
            className={`group relative p-6 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] hover:border-[#0D0D0C]/20 transition-all duration-200 shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between ${
              card.onClick ? "cursor-pointer" : ""
            }`}
          >
            <div>
              {/* Header: 16px label at 56% opacity + Thin line icon (24px, 1.2px stroke) */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[16px] font-normal text-[#0D0D0C]/56">
                  {card.title}
                </span>
                <div className="flex items-center gap-2">
                  {card.actionButton}
                  <div className="w-6 h-6 flex items-center justify-center text-[#0D0D0C]">
                    <Icon className="w-6 h-6 stroke-[1.2]" />
                  </div>
                </div>
              </div>

              {/* Number: 48px, 500 weight, tight tracking -0.032em, ink #0D0D0C */}
              <div className="text-[48px] font-medium leading-none tracking-[-0.032em] text-[#0D0D0C] font-sans my-2">
                {card.value}
              </div>
            </div>

            <div>
              {/* Footer info: 56% opacity */}
              <div className="flex items-center justify-between text-xs text-[#0D0D0C]/56 pt-2">
                <span className="truncate">{card.subtitle}</span>
                {card.indicator}
              </div>

              {card.progress}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
