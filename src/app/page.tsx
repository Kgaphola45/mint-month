"use client";

import React from "react";
import {
  Sparkles,
  AlertOctagon,
  Plus,
  PiggyBank,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatMonthYear, formatCurrency, getBudgetStatus } from "@/lib/utils";
import { StatsCards } from "@/components/stats-cards";
import { CategoryChart } from "@/components/category-chart";
import { DailyChart } from "@/components/daily-chart";
import { TransactionsList } from "@/components/transactions-list";
import Link from "next/link";

export default function DashboardPage() {
  const {
    selectedMonth,
    getMonthSummary,
    currency,
    setQuickAddOpen,
    setBudgetModalOpen,
  } = useExpenseStore();

  const summary = getMonthSummary(selectedMonth);
  const budgetStatus = getBudgetStatus(summary.totalSpent, summary.totalBudget);

  return (
    <div className="space-y-6">
      {/* Dynamic Overbudget / Critical Alert Banner */}
      {budgetStatus.status === "danger" && summary.totalBudget > 0 && (
        <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0">
              <AlertOctagon className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400">
                {summary.remaining < 0
                  ? `Over Budget Warning: You have exceeded this month's budget by ${formatCurrency(
                      Math.abs(summary.remaining),
                      currency
                    )}!`
                  : `Budget Alert: You've utilized ${budgetStatus.percentage}% of your monthly cap.`}
              </h4>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
                Consider adjusting limits or slowing non-essential spending.
              </p>
            </div>
          </div>

          <button
            onClick={() => setBudgetModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 transition-colors"
          >
            Adjust Budget
          </button>
        </div>
      )}

      {/* Hero Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>{formatMonthYear(selectedMonth)}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-mint-500/10 text-mint-600 dark:text-mint-400 border border-mint-500/20 hidden sm:inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Monthly Tracker
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Snapshot of your monthly spending habits and cash flow
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBudgetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-card hover:bg-muted border border-border/70 text-xs font-semibold text-foreground transition-all shadow-sm active:scale-95"
          >
            <PiggyBank className="w-4 h-4 text-blue-500" />
            <span>Budgets</span>
          </button>
          <button
            onClick={() => setQuickAddOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-mint-500 hover:bg-mint-600 active:scale-95 text-white font-semibold text-xs shadow-glow transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Quick Expense</span>
          </button>
        </div>
      </div>

      {/* 1. Top Summary Cards */}
      <StatsCards />

      {/* 2. Visual Charts Row (Category Donut & Daily Flow) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart />
        <DailyChart />
      </div>

      {/* 3. Lower Section: Recent Transactions & Month Compare Teaser */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TransactionsList limit={6} showViewAll={true} />
        </div>

        {/* Month Highlights & Fast Links Side Widget */}
        <div className="space-y-4">
          {/* Quick Month-over-Month teaser card */}
          <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Month Trends
                </span>
                <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-500">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <h4 className="text-sm font-bold text-foreground">
                How does this month compare?
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                View 6-month historical spending curves and see category shifts from last month.
              </p>
            </div>

            <Link
              href="/compare"
              className="mt-4 flex items-center justify-between p-3 rounded-2xl bg-muted/40 hover:bg-muted text-xs font-semibold text-foreground transition-all group"
            >
              <span>Explore Month Comparison</span>
              <ArrowRight className="w-4 h-4 text-mint-500 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Privacy pledge card */}
          <div className="p-5 rounded-3xl bg-mint-500/[0.04] border border-mint-500/20 text-xs text-muted-foreground space-y-1.5">
            <div className="font-bold text-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-mint-500 animate-pulse" />
              100% Local & Private
            </div>
            <p className="text-[11px] leading-relaxed">
              Mint Month stores your data securely in your browser's local memory. No ads, no trackers, no external cloud sync required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

