"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Lock, Calendar, Wallet, Sparkles } from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency, formatMonthYear } from "@/lib/utils";

export function PaydayModal() {
  const {
    paydayModalOpen,
    setPaydayModalOpen,
    selectedMonth,
    incomes,
    paydayDay,
    setMonthIncome,
    setDefaultIncome,
    setPaydayDay,
    getSafeToSpend,
    currency,
  } = useExpenseStore();

  const safe = getSafeToSpend(selectedMonth);

  const [salaryInput, setSalaryInput] = useState<string>("");
  const [paydayInput, setPaydayInput] = useState<number>(25);
  const [applyDefault, setApplyDefault] = useState<boolean>(true);

  useEffect(() => {
    if (paydayModalOpen) {
      const currentIncome =
        incomes[selectedMonth] || incomes.default || 25000;
      setSalaryInput(currentIncome.toString());
      setPaydayInput(paydayDay || 25);
    }
  }, [paydayModalOpen, selectedMonth, incomes, paydayDay]);

  if (!paydayModalOpen) return null;

  const handleClose = () => {
    setPaydayModalOpen(false);
  };

  const parsedSalary = parseFloat(salaryInput) || 0;
  const locked = safe.fixedCommitments;
  const living = safe.budgetedLiving;
  const previewSafePool = Math.max(0, parsedSalary - locked);
  const previewRemaining = previewSafePool - safe.nonRecurringSpent;
  const previewDaily =
    safe.daysRemaining > 0
      ? Math.round((previewRemaining / safe.daysRemaining) * 100) / 100
      : previewRemaining;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedSalary <= 0) return;

    if (applyDefault) {
      setDefaultIncome(parsedSalary);
      setMonthIncome(selectedMonth, parsedSalary);
    } else {
      setMonthIncome(selectedMonth, parsedSalary);
    }

    setPaydayDay(paydayInput);
    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0D0D0C]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] rounded-[28px] w-full max-w-lg shadow-[0_24px_48px_rgba(0,0,0,0.12)] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-[#0D0D0C]/[0.08] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#0D0D0C]/50">
                Payday Planner
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#DFE9D4] text-[#0D0D0C] text-[11px] font-medium">
                {formatMonthYear(selectedMonth)}
              </span>
            </div>
            <h3 className="text-2xl font-medium tracking-tight text-[#0D0D0C] mt-0.5">
              Salary & Safe-to-Spend
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2.5 rounded-full border border-[#0D0D0C]/[0.08] hover:bg-[#FBF6EF] text-[#0D0D0C]/60 hover:text-[#0D0D0C] transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 overflow-y-auto space-y-5">
          {/* Salary Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/60">
              Monthly Take-Home Salary (After Tax)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#0D0D0C]/40">
                R
              </span>
              <input
                type="number"
                step="any"
                min="1000"
                required
                placeholder="25000"
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
                className="w-full h-12 pl-8 pr-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm font-medium text-[#0D0D0C] placeholder:text-[#0D0D0C]/35 focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDFA] transition-all"
              />
            </div>
            <p className="text-[11px] text-[#0D0D0C]/50 pl-2">
              The net amount deposited into your bank account on payday.
            </p>
          </div>

          {/* Payday date selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/60">
              Payday Day of the Month
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="31"
                required
                value={paydayInput}
                onChange={(e) => setPaydayInput(parseInt(e.target.value, 10) || 25)}
                className="w-24 h-12 px-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm font-medium text-[#0D0D0C] focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDFA] transition-all text-center"
              />
              <span className="text-xs text-[#0D0D0C]/60">
                th of every month (standard SA salary cycle is 25th)
              </span>
            </div>
          </div>

          {/* Live Safe-to-Spend Breakdown */}
          <div className="p-4 sm:p-5 rounded-[22px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-[#0D0D0C]/60 pb-2 border-b border-[#0D0D0C]/[0.06]">
              <span>Automated Payday Deduction</span>
              <span>Amount</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#0D0D0C]">
                <div className="flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5 stroke-[1.5] text-[#0D0D0C]/60" />
                  <span>Take-Home Pay</span>
                </div>
                <span className="font-medium">{formatCurrency(parsedSalary, currency)}</span>
              </div>

              <div className="flex items-center justify-between text-[#0D0D0C]/75">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 stroke-[1.5] text-rose-600" />
                  <span>Locked Debit Orders & Contracts ({safe.fixedCommitmentsCount})</span>
                </div>
                <span className="font-medium text-rose-600">
                  - {formatCurrency(locked, currency)}
                </span>
              </div>

              {living > 0 && (
                <div className="flex items-center justify-between text-[#0D0D0C]/60">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0D0D0C]/30 ml-1" />
                    <span>Budgeted Living Essentials</span>
                  </div>
                  <span>- {formatCurrency(living, currency)}</span>
                </div>
              )}
            </div>

            <div className="pt-2.5 border-t border-[#0D0D0C]/[0.08] flex items-baseline justify-between">
              <div>
                <span className="text-[11px] font-medium text-[#0D0D0C]/50 uppercase tracking-[0.04em] block">
                  Projected Daily Allowance
                </span>
                <span className="text-2xl font-medium tracking-tight text-[#0D0D0C]">
                  {formatCurrency(previewDaily, currency)}
                  <span className="text-xs font-normal text-[#0D0D0C]/50"> / day</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#0D0D0C]/50 block">Safe Reserve Pool</span>
                <span className="text-sm font-medium text-[#0D0D0C]">
                  {formatCurrency(previewRemaining, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Toggle: Set as default for every month */}
          <label className="flex items-center gap-3 p-3.5 rounded-[18px] border border-[#0D0D0C]/[0.08] bg-[#FFFDFA] cursor-pointer hover:bg-[#FBF6EF]/50 transition-colors">
            <input
              type="checkbox"
              checked={applyDefault}
              onChange={(e) => setApplyDefault(e.target.checked)}
              className="w-4 h-4 rounded text-[#0D0D0C] accent-[#0D0D0C] cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-medium text-[#0D0D0C] block">
                Use this salary as default for every month
              </span>
              <span className="text-[#0D0D0C]/50">
                Future months will automatically calculate using this income.
              </span>
            </div>
          </label>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="h-12 px-6 rounded-full border border-[#0D0D0C]/[0.12] text-[#0D0D0C]/75 hover:text-[#0D0D0C] hover:bg-[#FBF6EF] text-sm font-medium transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="h-12 px-7 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm inline-flex items-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[2]" />
              <span>Save & Calculate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

