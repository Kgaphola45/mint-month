"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  PiggyBank,
  CalendarCheck,
  AlertTriangle,
  ArrowUpRight,
  Edit3,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency, getBudgetStatus } from "@/lib/utils";

export function StatsCards() {
  const { selectedMonth, getMonthSummary, currency, setBudgetModalOpen } =
    useExpenseStore();
  const summary = getMonthSummary(selectedMonth);

  const budgetStatus = getBudgetStatus(summary.totalSpent, summary.totalBudget);

  // Projected spend at end of month based on daily run rate
  const projectedMonthTotal = Math.round(summary.dailyAverage * summary.daysInMonth);
  const isPacingOverBudget =
    summary.totalBudget > 0 && projectedMonthTotal > summary.totalBudget;

  const cards = [
    {
      title: "Total Spent",
      value: formatCurrency(summary.totalSpent, currency),
      subtitle: `${summary.daysPassed} days tracked`,
      icon: Wallet,
      iconColor: "text-mint-500",
      bgColor: "bg-mint-500/10",
      indicator: (
        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
          <CalendarCheck className="w-3.5 h-3.5 text-mint-500" />
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
      icon: PiggyBank,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10",
      onClick: () => setBudgetModalOpen(true),
      actionBadge: (
        <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline">
          <Edit3 className="w-3 h-3" /> Edit
        </span>
      ),
      indicator: summary.totalCategoriesWithBudget > 0 ? (
        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          ✓ {summary.sortedCount} sorted
        </span>
      ) : null,
      progress: summary.totalBudget > 0 ? (
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${budgetStatus.progressColor}`}
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
          : "Exceeded limit!",
      icon: summary.remaining >= 0 ? TrendingDown : AlertTriangle,
      iconColor: summary.remaining >= 0 ? "text-emerald-500" : "text-rose-500",
      bgColor: summary.remaining >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10",
      alert: budgetStatus.status === "danger" || summary.remaining < 0,
      indicator: (
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
            summary.remaining >= 0
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse"
          }`}
        >
          {summary.remaining >= 0 ? "Within Budget" : "Overspent"}
        </span>
      ),
    },
    {
      title: "Daily Average",
      value: formatCurrency(summary.dailyAverage, currency),
      subtitle: `Projected: ${formatCurrency(projectedMonthTotal, currency, true)}`,
      icon: TrendingUp,
      iconColor: isPacingOverBudget ? "text-amber-500" : "text-purple-500",
      bgColor: isPacingOverBudget ? "bg-amber-500/10" : "bg-purple-500/10",
      indicator: isPacingOverBudget ? (
        <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
          <AlertTriangle className="w-3 h-3" /> Pace High
        </span>
      ) : (
        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-0.5">
          <ArrowUpRight className="w-3 h-3 text-purple-500" /> On Track
        </span>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            onClick={card.onClick}
            className={`group relative p-5 rounded-3xl bg-card border border-border/60 hover:border-border transition-all duration-200 shadow-sm hover:shadow-card dark:hover:shadow-card-dark ${
              card.onClick ? "cursor-pointer" : ""
            } ${card.alert ? "border-rose-500/40 bg-rose-500/[0.02]" : ""}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                {card.title}
              </span>
              <div className="flex items-center gap-2">
                {card.actionBadge}
                <div
                  className={`w-9 h-9 rounded-2xl ${card.bgColor} ${card.iconColor} flex items-center justify-center transition-transform group-hover:scale-105`}
                >
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
                {card.value}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate">{card.subtitle}</span>
                {card.indicator}
              </div>
            </div>

            {card.progress}
          </motion.div>
        );
      })}
    </div>
  );
}

