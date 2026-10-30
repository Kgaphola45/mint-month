"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  CalendarClock,
  Check,
  RotateCcw,
  Plus,
  CreditCard,
  Building2,
  Banknote,
  Zap,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency, formatMonthYear } from "@/lib/utils";
import { CategoryIcon } from "./category-icon";
import { PaymentMethod } from "@/types";

export function RecurringTimeline() {
  const {
    selectedMonth,
    currency,
    getRecurringTimeline,
    toggleRecurringCleared,
    setQuickAddOpen,
  } = useExpenseStore();

  const [filter, setFilter] = useState<"all" | "pending" | "cleared">("all");

  const { items, summary } = getRecurringTimeline(selectedMonth);

  const filteredItems = items.filter((item) => {
    if (filter === "pending") return !item.isCleared;
    if (filter === "cleared") return item.isCleared;
    return true;
  });

  const handleToggle = (expenseId: string, currentlyCleared: boolean) => {
    toggleRecurringCleared(selectedMonth, expenseId);
    if (!currentlyCleared) {
      try {
        confetti({
          particleCount: 28,
          spread: 45,
          origin: { y: 0.75 },
          colors: ["#0D0D0C", "#96CE96", "#F99654"],
        });
      } catch {
        // ignore
      }
    }
  };

  const paymentIcons: Record<PaymentMethod, React.ReactNode> = {
    Card: <CreditCard className="w-3 h-3 stroke-[1.5]" />,
    Bank: <Building2 className="w-3 h-3 stroke-[1.5]" />,
    Cash: <Banknote className="w-3 h-3 stroke-[1.5]" />,
    EFT: <Building2 className="w-3 h-3 stroke-[1.5]" />,
    "Instant EFT": <Zap className="w-3 h-3 stroke-[1.5]" />,
  };

  if (items.length === 0) {
    return (
      <div className="p-8 sm:p-12 rounded-[24px] bg-[#FFFDF8] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-16 h-16 rounded-full border border-[#0D0D0C]/[0.12] flex items-center justify-center text-[#0D0D0C]/60 mb-5">
          <CalendarClock className="w-8 h-8 stroke-[1]" />
        </div>
        <h4 className="text-xl font-medium text-[#0D0D0C] tracking-[-0.02em]">
          No Recurring Bills Scheduled
        </h4>
        <p className="text-sm text-[#0D0D0C]/56 max-w-sm mt-1.5 mb-6">
          Add fixed debit orders (contracts, data, subscriptions) to track what runs before month-end.
        </p>
        <button
          onClick={() => setQuickAddOpen(true)}
          className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-[#0D0D0C] text-[#FFFDF8] text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2]" />
          <span>+ Add Recurring Bill</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-[24px] bg-[#FFFDF8] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-6">
      {/* Top Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#0D0D0C]/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-normal text-[#0D0D0C]/56">
              Debit Orders & Recurring Timeline
            </span>
            <span className="px-2.5 py-0.5 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FBF6EF] text-[11px] text-[#0D0D0C] font-normal">
              {formatMonthYear(selectedMonth)}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C] mt-1">
            Upcoming This Month
          </h2>
          <p className="text-xs text-[#0D0D0C]/42 mt-0.5">
            Monitor which debit orders have cleared vs. what remains scheduled to run
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-1 rounded-full bg-[#FBF6EF] border border-[#0D0D0C]/[0.08]">
            <button
              onClick={() => setFilter("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === "all"
                  ? "bg-[#0D0D0C] text-[#FFFDF8] shadow-sm"
                  : "text-[#0D0D0C]/56 hover:text-[#0D0D0C]"
              }`}
            >
              All ({summary.totalCount})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === "pending"
                  ? "bg-[#0D0D0C] text-[#FFFDF8] shadow-sm"
                  : "text-[#0D0D0C]/56 hover:text-[#0D0D0C]"
              }`}
            >
              Still to Run ({summary.pendingCount})
            </button>
            <button
              onClick={() => setFilter("cleared")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === "cleared"
                  ? "bg-[#0D0D0C] text-[#FFFDF8] shadow-sm"
                  : "text-[#0D0D0C]/56 hover:text-[#0D0D0C]"
              }`}
            >
              Cleared ({summary.clearedCount})
            </button>
          </div>

          <button
            onClick={() => setQuickAddOpen(true)}
            className="px-4 py-2 rounded-full border border-[#0D0D0C]/20 hover:border-[#0D0D0C] text-xs font-medium text-[#0D0D0C] hover:bg-[#0D0D0C] hover:text-[#FFFDF8] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2]" />
            <span>New Bill</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Committed */}
        <div className="p-5 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] flex flex-col justify-between">
          <span className="text-xs text-[#0D0D0C]/56">
            Total Monthly Committed
          </span>
          <div className="text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C] my-1">
            {formatCurrency(summary.totalCommitted, currency)}
          </div>
          <span className="text-[11px] text-[#0D0D0C]/42">
            {summary.totalCount} fixed debit orders & bills
          </span>
        </div>

        {/* Cleared So Far */}
        <div className="p-5 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#0D0D0C]/56">
              Cleared So Far
            </span>
            <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              {summary.percentageCleared}%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C] my-1">
            {formatCurrency(summary.clearedAmount, currency)}
          </div>
          <span className="text-[11px] text-[#0D0D0C]/42">
            {summary.clearedCount} of {summary.totalCount} bills debited
          </span>
        </div>

        {/* Still to Run Before Month-End */}
        <div className="p-5 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#0D0D0C]/56">
              Still to Run (Buffer Needed)
            </span>
            {summary.pendingCount > 0 && (
              <span className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                {summary.pendingCount} pending
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C] my-1">
            {formatCurrency(summary.pendingAmount, currency)}
          </div>
          <span className="text-[11px] text-[#0D0D0C]/42">
            Remaining unbilled commitments
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-1.5 bg-[#0D0D0C]/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0D0D0C] rounded-full transition-all duration-500"
            style={{ width: `${summary.percentageCleared}%` }}
          />
        </div>
      </div>

      {/* Timeline List of Recurring Bills */}
      <div className="divide-y divide-[#0D0D0C]/[0.05] pt-2">
        {filteredItems.map((bill) => {
          return (
            <div
              key={bill.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-[#FBF6EF]/50 -mx-3 px-3 rounded-[18px] transition-colors"
            >
              {/* Left Column: Day Badge + Merchant + Category */}
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Day Badge */}
                <div className="w-14 shrink-0 flex flex-col items-center justify-center p-1.5 rounded-full border border-[#0D0D0C]/[0.08] bg-[#FBF6EF]">
                  <span className="text-[10px] text-[#0D0D0C]/42 uppercase leading-none">Day</span>
                  <span className="text-sm font-medium text-[#0D0D0C] leading-none mt-0.5">
                    {String(bill.day).padStart(2, "0")}
                  </span>
                </div>

                {/* Category Icon */}
                <div
                  className="w-10 h-10 rounded-full border border-[#0D0D0C]/[0.08] flex items-center justify-center shrink-0 bg-[#FFFDF8]"
                  style={{ color: bill.category.color || "#0D0D0C" }}
                >
                  <CategoryIcon iconName={bill.category.icon} className="w-4 h-4 stroke-[1.5]" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-medium text-[#0D0D0C] truncate ${
                        bill.isCleared ? "line-through opacity-70" : ""
                      }`}
                    >
                      {bill.note}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#0D0D0C]/[0.08] bg-[#FBF6EF] text-[#0D0D0C]/60 flex items-center gap-1">
                      {paymentIcons[bill.paymentMethod]}
                      <span>{bill.paymentMethod}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#0D0D0C]/56 mt-0.5">
                    <span className="font-normal text-[#0D0D0C]/70">
                      {bill.category.name}
                    </span>
                    <span>•</span>
                    <span>Scheduled for day {bill.day}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Amount + Status Pill + Interactive Clear Tick */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 ml-16 sm:ml-0">
                <div className="text-right">
                  <span className="text-base sm:text-lg font-medium tracking-tight text-[#0D0D0C] block">
                    {formatCurrency(bill.amount, currency)}
                  </span>
                  <span className="text-[11px] text-[#0D0D0C]/42">
                    monthly
                  </span>
                </div>

                {/* Dynamic Status Pill */}
                <div className="flex items-center gap-2">
                  {bill.isCleared ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-normal border border-[#0D0D0C]/[0.1] bg-[#FBF6EF] text-[#0D0D0C] flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[2]" />
                      <span>Cleared</span>
                    </span>
                  ) : bill.status === "today" ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium border border-amber-300 bg-amber-50 text-amber-800 flex items-center gap-1">
                      <span>⚡ Runs Today</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-normal border border-[#0D0D0C]/[0.1] bg-[#FFFDF8] text-[#0D0D0C]/60">
                      {bill.daysUntil > 0 ? `In ${bill.daysUntil} days` : "Scheduled"}
                    </span>
                  )}

                  {/* Toggle Cleared / Pending Action */}
                  <button
                    onClick={() => handleToggle(bill.expenseId, bill.isCleared)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      bill.isCleared
                        ? "bg-[#0D0D0C] text-[#FFFDF8] hover:bg-[#0D0D0C]/80"
                        : "border border-[#0D0D0C]/20 hover:border-[#0D0D0C] text-[#0D0D0C] hover:bg-[#0D0D0C]/[0.05]"
                    }`}
                    title={bill.isCleared ? "Mark as pending" : "Mark as cleared"}
                  >
                    {bill.isCleared ? (
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5 stroke-[1.8] text-[#0D0D0C]/60" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
