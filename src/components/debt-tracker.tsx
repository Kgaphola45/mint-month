"use client";

import React from "react";
import { fireConfetti } from "@/lib/confetti";
import {
  Layers,
  Plus,
  Pencil,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency } from "@/lib/utils";
import { DebtInstalment } from "@/types";

export function DebtTracker() {
  const {
    debts,
    currency,
    setDebtModalOpen,
    setEditingDebt,
    incrementDebtInstalment,
    decrementDebtInstalment,
    getDebtSummary,
    getCategoryById,
  } = useExpenseStore();

  const summary = getDebtSummary();

  const handleQuickPay = (debt: DebtInstalment) => {
    const isNowPaidOff = debt.paidInstalments + 1 >= debt.totalInstalments;
    incrementDebtInstalment(debt.id);

    try {
      fireConfetti({
        particleCount: isNowPaidOff ? 60 : 30,
        spread: isNowPaidOff ? 70 : 45,
        origin: { y: 0.7 },
        colors: isNowPaidOff
          ? ["#96CE96", "#F99654", "#ECD6E2", "#0D0D0C"]
          : ["#0D0D0C", "#96CE96", "#F99654"],
      });
    } catch {
      // ignore
    }
  };

  const handleEdit = (debt: DebtInstalment) => {
    setEditingDebt(debt);
    setDebtModalOpen(true);
  };

  const handleAdd = () => {
    setEditingDebt(null);
    setDebtModalOpen(true);
  };

  return (
    <div className="p-6 sm:p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-6">
      {/* Header & New Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#0D0D0C]/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-normal text-[#0D0D0C]/56">
              Instalment Paydown & Contract Horizon
            </span>
            <span className="px-2.5 py-0.5 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FBF6EF] text-[11px] text-[#0D0D0C] font-normal">
              {summary.activeCount} Active · {summary.paidOffCount} Settled
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C] mt-1">
            Debt & Instalment Tracker
          </h2>
          <p className="text-sm text-[#0D0D0C]/56 mt-1">
            Track contracts (PayJustNow, TFG, Phone & Laptop contracts) towards 100% paydown freedom.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2]" />
          <span>New Instalment Plan</span>
        </button>
      </div>

      {debts.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] flex flex-col items-center justify-center text-center min-h-[220px]">
          <div className="w-14 h-14 rounded-full border border-[#0D0D0C]/[0.1] flex items-center justify-center text-[#0D0D0C]/50 mb-3">
            <Layers className="w-7 h-7 stroke-[1]" />
          </div>
          <h4 className="text-lg font-medium text-[#0D0D0C]">No Instalment Plans</h4>
          <p className="text-xs sm:text-sm text-[#0D0D0C]/56 max-w-sm mt-1 mb-5">
            Keep track of multiple-month contracts (e.g. PayJustNow, Phone, Laptop) with clear monthly progress.
          </p>
          <button
            onClick={handleAdd}
            className="h-10 px-5 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs sm:text-sm font-medium hover:opacity-90 transition-all"
          >
            + Add First Plan
          </button>
        </div>
      ) : (
        <>
          {/* Top 3 Metric Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Monthly Commitment */}
            <div className="p-5 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
              <div className="flex items-center justify-between text-xs text-[#0D0D0C]/56 mb-1">
                <span>Monthly Commitment</span>
                <Clock className="w-4 h-4 stroke-[1.5] text-[#0D0D0C]/40" />
              </div>
              <div className="text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C]">
                {formatCurrency(summary.totalMonthly, currency)}
              </div>
              <p className="text-xs text-[#0D0D0C]/50 mt-1">
                Billed monthly across {summary.activeCount} active account{summary.activeCount === 1 ? "" : "s"}
              </p>
            </div>

            {/* 2. Total Remaining Debt */}
            <div className="p-5 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
              <div className="flex items-center justify-between text-xs text-[#0D0D0C]/56 mb-1">
                <span>Remaining Balance</span>
                <TrendingDown className="w-4 h-4 stroke-[1.5] text-[#0D0D0C]/40" />
              </div>
              <div className="text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C]">
                {formatCurrency(summary.totalRemaining, currency)}
              </div>
              <p className="text-xs text-[#0D0D0C]/50 mt-1">
                {formatCurrency(summary.totalPaid, currency)} already paid off
              </p>
            </div>

            {/* 3. Overall Paydown Progress */}
            <div className="p-5 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
              <div className="flex items-center justify-between text-xs text-[#0D0D0C]/56 mb-1">
                <span>Total Paydown Progress</span>
                <ShieldCheck className="w-4 h-4 stroke-[1.5] text-[#0D0D0C]/40" />
              </div>
              <div className="text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C]">
                {summary.overallProgress}%
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#0D0D0C]/[0.08] overflow-hidden mt-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${summary.overallProgress}%`,
                    backgroundColor: summary.overallProgress >= 80 ? "#96CE96" : "#0D0D0C",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Motivational Snowball Pill / Highlight */}
          {summary.nextPayoffName && summary.nextPayoffMonths !== undefined && (
            <div className="p-4 sm:p-4.5 rounded-[20px] bg-[#F4EBC6]/60 border border-[#F4EBC6] flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0D0D0C] text-[#FFFDFA] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 stroke-[1.5]" />
                </div>
                <div>
                  <span className="font-medium text-[#0D0D0C]">
                    Next Freedom Milestone: {summary.nextPayoffName}
                  </span>
                  <p className="text-xs text-[#0D0D0C]/70 mt-0.5">
                    Only {summary.nextPayoffMonths} payment{summary.nextPayoffMonths === 1 ? "" : "s"} away from being 100% cleared!
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex text-xs font-medium text-[#0D0D0C] px-3 py-1 rounded-full bg-[#FFFDFA] border border-[#0D0D0C]/[0.1]">
                {summary.nextPayoffMonths} mo to go
              </span>
            </div>
          )}

          {/* Instalments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {debts.map((debt) => {
              const isPaid = debt.isPaidOff || debt.paidInstalments >= debt.totalInstalments;
              const remainingMonths = Math.max(0, debt.totalInstalments - debt.paidInstalments);
              const remainingAmount = remainingMonths * debt.monthlyAmount;
              const percent = Math.min(
                100,
                Math.round((debt.paidInstalments / debt.totalInstalments) * 100)
              );
              const category = debt.categoryId ? getCategoryById(debt.categoryId) : null;

              return (
                <div
                  key={debt.id}
                  className={`p-5 rounded-[22px] border transition-all ${
                    isPaid
                      ? "bg-[#DFE9D4]/25 border-[#DFE9D4]"
                      : "bg-[#FBF6EF] border-[#0D0D0C]/[0.07] hover:border-[#0D0D0C]/[0.16]"
                  }`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {category && (
                          <span className="text-[11px] font-normal px-2 py-0.5 rounded-full border border-[#0D0D0C]/[0.08] bg-[#FFFDFA] text-[#0D0D0C]/70">
                            {category.name}
                          </span>
                        )}
                        {isPaid && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#DFE9D4] text-[#0D0D0C] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 stroke-[2] text-[#0D0D0C]" />
                            <span>Fully Settled</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-medium text-[#0D0D0C] tracking-tight mt-1">
                        {debt.name}
                      </h4>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-medium tracking-tight text-[#0D0D0C]">
                        {formatCurrency(debt.monthlyAmount, currency)}
                        <span className="text-xs font-normal text-[#0D0D0C]/50"> / mo</span>
                      </div>
                      <span className="text-xs text-[#0D0D0C]/50 block">
                        {isPaid ? "Completed" : `${formatCurrency(remainingAmount, currency)} left`}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#0D0D0C]/65">
                        <strong className="text-[#0D0D0C] font-medium">{debt.paidInstalments}</strong> of{" "}
                        <strong className="text-[#0D0D0C] font-medium">{debt.totalInstalments}</strong> paid
                      </span>
                      <span className="font-medium text-[#0D0D0C]">
                        {isPaid ? "100%" : `${remainingMonths} mo remaining`}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-[#0D0D0C]/[0.08] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percent}%`,
                          backgroundColor:
                            percent >= 100
                              ? "#96CE96"
                              : percent >= 60
                              ? "#F99654"
                              : "#0D0D0C",
                        }}
                      />
                    </div>
                  </div>

                  {/* Notes if any */}
                  {debt.notes && (
                    <p className="text-xs text-[#0D0D0C]/50 mt-2.5 line-clamp-1 italic">
                      "{debt.notes}"
                    </p>
                  )}

                  {/* Bottom Actions */}
                  <div className="mt-4 pt-3 border-t border-[#0D0D0C]/[0.06] flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleEdit(debt)}
                      className="p-1.5 rounded-full border border-[#0D0D0C]/[0.08] hover:bg-[#FFFDFA] text-[#0D0D0C]/60 hover:text-[#0D0D0C] transition-all text-xs inline-flex items-center gap-1.5 px-3"
                    >
                      <Pencil className="w-3 h-3 stroke-[1.5]" />
                      <span>Edit</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {debt.paidInstalments > 0 && (
                        <button
                          onClick={() => decrementDebtInstalment(debt.id)}
                          className="p-1.5 rounded-full border border-[#0D0D0C]/[0.08] hover:bg-[#FFFDFA] text-[#0D0D0C]/50 hover:text-[#0D0D0C] transition-all"
                          title="Undo one payment"
                        >
                          <RotateCcw className="w-3.5 h-3.5 stroke-[1.5]" />
                        </button>
                      )}

                      {!isPaid ? (
                        <button
                          onClick={() => handleQuickPay(debt)}
                          className="h-8 px-3.5 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs font-medium hover:opacity-90 active:scale-95 transition-all inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <span>+1 Month Paid</span>
                        </button>
                      ) : (
                        <span className="text-xs text-[#0D0D0C]/60 font-medium px-2 py-1">
                          🎉 Complete
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

