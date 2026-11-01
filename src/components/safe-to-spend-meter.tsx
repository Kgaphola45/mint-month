"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Calendar,
  Lock,
  Wallet,
  Sparkles,
  SlidersHorizontal,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency, formatMonthYear } from "@/lib/utils";

export function SafeToSpendMeter() {
  const {
    selectedMonth,
    currency,
    getSafeToSpend,
    setPaydayModalOpen,
    setSimulatorModalOpen,
    setDigestModalOpen,
  } = useExpenseStore();

  const safe = getSafeToSpend(selectedMonth);

  // Percentages for multi-segment breakdown
  const income = safe.monthlyIncome > 0 ? safe.monthlyIncome : 1;
  const lockedPercent = Math.min(
    100,
    Math.round((safe.fixedCommitments / income) * 100)
  );
  const spentPercent = Math.min(
    100 - lockedPercent,
    Math.round((safe.nonRecurringSpent / income) * 100)
  );
  const safePercent = Math.max(0, 100 - lockedPercent - spentPercent);

  const statusConfig = {
    comfortable: {
      badgeBg: "bg-[#DFE9D4]",
      badgeText: "text-[#0D0D0C]",
      label: "Comfortable Pace",
      icon: CheckCircle2,
    },
    balanced: {
      badgeBg: "bg-[#F8DCC7]",
      badgeText: "text-[#0D0D0C]",
      label: "Balanced Spend",
      icon: Sparkles,
    },
    tight: {
      badgeBg: "bg-[#ECD6E2]",
      badgeText: "text-[#0D0D0C]",
      label: "Budget is Tight",
      icon: AlertCircle,
    },
    overspent: {
      badgeBg: "bg-rose-100",
      badgeText: "text-rose-800",
      label: "Discretionary Exceeded",
      icon: AlertCircle,
    },
  }[safe.status];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="p-6 sm:p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#0D0D0C]/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[14px] sm:text-[15px] font-normal text-[#0D0D0C]/56">
              🇿🇦 Payday Planner & Cashflow Reserve
            </span>
            <span className="px-2.5 py-0.5 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FBF6EF] text-[11px] text-[#0D0D0C] font-normal">
              {formatMonthYear(selectedMonth)}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C] mt-1">
            Safe-to-Spend Daily Meter
          </h2>
          <p className="text-sm text-[#0D0D0C]/56 mt-1">
            Guilt-free daily budget calculated by strictly quarantining fixed debit orders and contracts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto shrink-0">
          <div className="px-3.5 py-1.5 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FBF6EF] text-xs font-normal text-[#0D0D0C] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 stroke-[1.5] text-[#0D0D0C]/60" />
            <span>
              Payday: {safe.paydayDay}th
              {safe.daysUntilPayday > 0 ? ` · in ${safe.daysUntilPayday}d` : " · today"}
            </span>
          </div>

          <button
            onClick={() => setSimulatorModalOpen(true)}
            className="h-9 px-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FFFDFA] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-xs font-medium inline-flex items-center gap-1.5 transition-all text-[#0D0D0C] shadow-sm group"
            title="Purchase Decision Simulator (Hotkey: A)"
          >
            <Sparkles className="w-3.5 h-3.5 stroke-[1.5] text-[#0D0D0C]/70 group-hover:text-[#FFFDFA]" />
            <span>Can I Afford It?</span>
            <kbd className="text-[10px] font-mono bg-[#0D0D0C]/[0.06] group-hover:bg-[#FFFDFA]/20 group-hover:text-[#FFFDFA] px-1.5 py-0.5 rounded text-[#0D0D0C]/60">A</kbd>
          </button>

          <button
            onClick={() => setPaydayModalOpen(true)}
            className="h-9 px-4 rounded-full border border-[#0D0D0C]/[0.12] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-xs font-medium inline-flex items-center gap-1.5 transition-all text-[#0D0D0C] shadow-sm"
          >
            <SlidersHorizontal className="w-3 h-3 stroke-[1.5]" />
            <span>Configure Salary</span>
          </button>

          <button
            onClick={() => setDigestModalOpen(true)}
            className="h-9 px-4 rounded-full bg-[#0D0D0C] text-[#FFFDFA] hover:opacity-90 text-xs font-medium inline-flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Mail className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Email Digest</span>
          </button>
        </div>
      </div>

      {/* Main Stat & Status Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-7 rounded-[22px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-medium uppercase tracking-[0.06em] text-[#0D0D0C]/50">
              Guilt-Free Daily Allowance
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 ${statusConfig.badgeBg} ${statusConfig.badgeText}`}
            >
              <StatusIcon className="w-3 h-3 stroke-[2]" />
              <span>{statusConfig.label}</span>
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-[-0.032em] text-[#0D0D0C]">
              {formatCurrency(Math.max(0, safe.dailyAllowance), currency)}
            </span>
            <span className="text-lg sm:text-xl font-normal text-[#0D0D0C]/45">
              / day
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#0D0D0C]/60 pt-0.5">
            {safe.daysRemaining > 0 ? (
              <>
                You can spend up to{" "}
                <strong className="text-[#0D0D0C] font-medium">
                  {formatCurrency(Math.max(0, safe.dailyAllowance), currency)} each day
                </strong>{" "}
                for the next <strong className="text-[#0D0D0C] font-medium">{safe.daysRemaining} days</strong> without touching R
                {safe.fixedCommitments.toLocaleString()} locked for debit orders.
              </>
            ) : (
              <>Month completed. Total safe discretionary surplus preserved.</>
            )}
          </p>
        </div>

        {/* Total Safe Discretionary Pool Pill */}
        <div className="lg:text-right shrink-0 p-4 rounded-[18px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08]">
          <span className="text-xs text-[#0D0D0C]/50 block">Remaining Safe Cushion</span>
          <span className="text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C] mt-0.5 block">
            {formatCurrency(safe.safeToSpendRemaining, currency)}
          </span>
          <span className="text-[11px] text-[#0D0D0C]/50 block mt-0.5">
            out of {formatCurrency(safe.safeToSpendPool, currency)} free buffer
          </span>
        </div>
      </div>

      {/* Visual Multi-Segment Salary Allocation Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#0D0D0C]/60">
          <span>Salary Allocation Breakdown</span>
          <span>
            {formatCurrency(safe.monthlyIncome, currency)} take-home
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-[#0D0D0C]/[0.06] overflow-hidden flex">
          {/* Segment 1: Locked Fixed Commitments */}
          <div
            className="h-full bg-[#0D0D0C] transition-all duration-500"
            style={{ width: `${lockedPercent}%` }}
            title={`Locked Debit Orders: ${formatCurrency(safe.fixedCommitments, currency)} (${lockedPercent}%)`}
          />
          {/* Segment 2: Variable Spent So Far */}
          <div
            className="h-full bg-[#F99654] transition-all duration-500"
            style={{ width: `${spentPercent}%` }}
            title={`Discretionary Spent: ${formatCurrency(safe.nonRecurringSpent, currency)} (${spentPercent}%)`}
          />
          {/* Segment 3: Safe-to-Spend Remaining */}
          <div
            className="h-full bg-[#96CE96] transition-all duration-500"
            style={{ width: `${safePercent}%` }}
            title={`Safe to Spend Remaining: ${formatCurrency(safe.safeToSpendRemaining, currency)} (${safePercent}%)`}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D0D0C]" />
            <span className="text-[#0D0D0C]/75 font-normal">
              Locked Debit Orders ({lockedPercent}%)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F99654]" />
            <span className="text-[#0D0D0C]/75 font-normal">
              Spent so far ({spentPercent}%)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#96CE96]" />
            <span className="text-[#0D0D0C]/75 font-normal">
              Safe to spend ({safePercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* 3 Metric Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. Monthly Take-Home */}
        <div className="p-4 sm:p-5 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
          <div className="flex items-center justify-between text-xs text-[#0D0D0C]/56 mb-1">
            <span>Take-Home Salary</span>
            <Wallet className="w-4 h-4 stroke-[1.5] text-[#0D0D0C]/40" />
          </div>
          <div className="text-xl sm:text-2xl font-medium tracking-tight text-[#0D0D0C]">
            {formatCurrency(safe.monthlyIncome, currency)}
          </div>
          <p className="text-xs text-[#0D0D0C]/50 mt-1">
            Expected net deposit
          </p>
        </div>

        {/* 2. Quarantined Debit Orders */}
        <div className="p-4 sm:p-5 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
          <div className="flex items-center justify-between text-xs text-[#0D0D0C]/56 mb-1">
            <span>Quarantined for Debit Orders</span>
            <Lock className="w-4 h-4 stroke-[1.5] text-[#0D0D0C]/40" />
          </div>
          <div className="text-xl sm:text-2xl font-medium tracking-tight text-[#0D0D0C]">
            {formatCurrency(safe.fixedCommitments, currency)}
          </div>
          <p className="text-xs text-[#0D0D0C]/50 mt-1">
            {safe.pendingCommitments > 0
              ? `${formatCurrency(safe.pendingCommitments, currency)} still to run`
              : "All debit orders cleared"}
          </p>
        </div>

        {/* 3. Discretionary Spent */}
        <div className="p-4 sm:p-5 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
          <div className="flex items-center justify-between text-xs text-[#0D0D0C]/56 mb-1">
            <span>Living & Discretionary Spent</span>
            <TrendingUp className="w-4 h-4 stroke-[1.5] text-[#0D0D0C]/40" />
          </div>
          <div className="text-xl sm:text-2xl font-medium tracking-tight text-[#0D0D0C]">
            {formatCurrency(safe.nonRecurringSpent, currency)}
          </div>
          <p className="text-xs text-[#0D0D0C]/50 mt-1">
            Non-fixed expenses so far
          </p>
        </div>
      </div>

      {/* Peace-of-Mind Callout */}
      <div className="p-4 rounded-[18px] bg-[#F2ECDF]/70 border border-[#0D0D0C]/[0.06] flex items-center gap-3 text-xs text-[#0D0D0C]/75">
        <ShieldCheck className="w-4 h-4 stroke-[1.5] text-[#0D0D0C] shrink-0" />
        <span>
          <strong>Zero Surprise Debit Orders:</strong> Even if your contracts (Laptop, Phone, VOX, TFG) run at month-end, their{" "}
          <strong>{formatCurrency(safe.fixedCommitments, currency)}</strong> is permanently protected and excluded from your daily allowance.
        </span>
      </div>
    </div>
  );
}
