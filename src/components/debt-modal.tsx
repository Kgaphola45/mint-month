"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Trash2, Check, ArrowRight } from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency } from "@/lib/utils";
import { DebtInstalment } from "@/types";

export function DebtModal() {
  const {
    debtModalOpen,
    setDebtModalOpen,
    editingDebt,
    setEditingDebt,
    addDebt,
    updateDebt,
    deleteDebt,
    categories,
    currency,
  } = useExpenseStore();

  const [name, setName] = useState("");
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [totalInstalments, setTotalInstalments] = useState("12");
  const [paidInstalments, setPaidInstalments] = useState("0");
  const [categoryId, setCategoryId] = useState("cat-debt");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (debtModalOpen) {
      if (editingDebt) {
        setName(editingDebt.name || "");
        setMonthlyAmount(editingDebt.monthlyAmount ? editingDebt.monthlyAmount.toString() : "");
        setTotalInstalments(
          editingDebt.totalInstalments ? editingDebt.totalInstalments.toString() : "12"
        );
        setPaidInstalments(
          editingDebt.paidInstalments ? editingDebt.paidInstalments.toString() : "0"
        );
        setCategoryId(editingDebt.categoryId || "cat-debt");
        setNotes(editingDebt.notes || "");
      } else {
        setName("");
        setMonthlyAmount("");
        setTotalInstalments("12");
        setPaidInstalments("0");
        setCategoryId("cat-debt");
        setNotes("");
      }
      setError(null);
    }
  }, [debtModalOpen, editingDebt]);

  if (!debtModalOpen) return null;

  const handleClose = () => {
    setDebtModalOpen(false);
    setEditingDebt(null);
    setError(null);
  };

  const parsedMonthly = parseFloat(monthlyAmount) || 0;
  const parsedTotal = parseInt(totalInstalments, 10) || 1;
  const parsedPaid = parseInt(paidInstalments, 10) || 0;
  const parsedRemaining = Math.max(0, parsedTotal - parsedPaid);
  const totalValue = parsedTotal * parsedMonthly;
  const remainingValue = parsedRemaining * parsedMonthly;
  const progressPercent =
    parsedTotal > 0 ? Math.min(100, Math.round((parsedPaid / parsedTotal) * 100)) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a name or contract title.");
      return;
    }
    if (parsedMonthly <= 0) {
      setError("Monthly instalment amount must be greater than 0.");
      return;
    }
    if (parsedTotal <= 0) {
      setError("Total instalments must be at least 1 month.");
      return;
    }
    if (parsedPaid < 0 || parsedPaid > parsedTotal) {
      setError(`Paid instalments must be between 0 and ${parsedTotal}.`);
      return;
    }

    const payload: Omit<DebtInstalment, "id"> = {
      name: name.trim(),
      monthlyAmount: parsedMonthly,
      totalInstalments: parsedTotal,
      paidInstalments: parsedPaid,
      totalAmount: totalValue,
      categoryId,
      notes: notes.trim() || undefined,
      isPaidOff: parsedPaid >= parsedTotal,
    };

    if (editingDebt) {
      updateDebt(editingDebt.id, payload);
    } else {
      addDebt(payload);
    }

    handleClose();
  };

  const handleDelete = () => {
    if (editingDebt && confirm(`Delete "${editingDebt.name}" from your debt tracker?`)) {
      deleteDebt(editingDebt.id);
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0D0D0C]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-[#FFFDF8] border border-[#0D0D0C]/[0.1] rounded-[28px] w-full max-w-lg shadow-[0_24px_48px_rgba(0,0,0,0.12)] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-[#0D0D0C]/[0.08] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#0D0D0C]/50">
                Instalment Paydown Plan
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#DFE9D4] text-[#0D0D0C] text-[11px] font-medium">
                ZAR Only
              </span>
            </div>
            <h3 className="text-2xl font-medium tracking-tight text-[#0D0D0C] mt-0.5">
              {editingDebt ? "Edit Instalment Plan" : "New Debt or Contract"}
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
          {error && (
            <div className="p-3.5 rounded-[16px] bg-[#ECD6E2]/40 border border-[#ECD6E2] text-[#0D0D0C] text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D0D0C]" />
              <span>{error}</span>
            </div>
          )}

          {/* Plan Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/60">
              Contract or Account Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. PayJustNow, Laptop Contract, TFG Account"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm text-[#0D0D0C] placeholder:text-[#0D0D0C]/35 focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDF8] transition-all"
            />
          </div>

          {/* Monthly Amount & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/60">
                Monthly Amount (R)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#0D0D0C]/40">
                  R
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  placeholder="899"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  className="w-full h-12 pl-8 pr-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm font-medium text-[#0D0D0C] placeholder:text-[#0D0D0C]/35 focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDF8] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/60">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-12 px-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm text-[#0D0D0C] focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDF8] transition-all cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Instalment Count: Total and Paid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/60">
                Total Instalments (Months)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                required
                placeholder="24"
                value={totalInstalments}
                onChange={(e) => setTotalInstalments(e.target.value)}
                className="w-full h-12 px-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm text-[#0D0D0C] placeholder:text-[#0D0D0C]/35 focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDF8] transition-all"
              />
              <span className="text-[11px] text-[#0D0D0C]/45 pl-2">
                e.g. 3 for PayJustNow, 24 for phone/laptop
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/60">
                Instalments Already Paid
              </label>
              <input
                type="number"
                min="0"
                max={parsedTotal || 120}
                required
                placeholder="0"
                value={paidInstalments}
                onChange={(e) => setPaidInstalments(e.target.value)}
                className="w-full h-12 px-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm text-[#0D0D0C] placeholder:text-[#0D0D0C]/35 focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDF8] transition-all"
              />
              <span className="text-[11px] text-[#0D0D0C]/45 pl-2">
                {parsedRemaining} month{parsedRemaining === 1 ? "" : "s"} remaining
              </span>
            </div>
          </div>

          {/* Live Paydown Preview */}
          <div className="p-4 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#0D0D0C]/60 font-medium">Paydown Preview</span>
              <span className="font-medium text-[#0D0D0C]">
                {parsedPaid} of {parsedTotal} paid ({progressPercent}%)
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-[#0D0D0C]/[0.08] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor:
                    progressPercent >= 100
                      ? "#96CE96"
                      : progressPercent >= 50
                      ? "#F99654"
                      : "#0D0D0C",
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div>
                <span className="text-[#0D0D0C]/50 block">Remaining Balance</span>
                <span className="text-sm font-medium text-[#0D0D0C]">
                  {formatCurrency(remainingValue, currency)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[#0D0D0C]/50 block">Total Contract Value</span>
                <span className="text-sm font-medium text-[#0D0D0C]">
                  {formatCurrency(totalValue, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/60">
              Notes or End-Date Target (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Settle by November 2026, 0% interest"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-12 px-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm text-[#0D0D0C] placeholder:text-[#0D0D0C]/35 focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDF8] transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            {editingDebt ? (
              <button
                type="button"
                onClick={handleDelete}
                className="h-12 px-4 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium inline-flex items-center gap-2 transition-all"
              >
                <Trash2 className="w-4 h-4 stroke-[1.5]" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="h-12 px-6 rounded-full border border-[#0D0D0C]/[0.12] text-[#0D0D0C]/75 hover:text-[#0D0D0C] hover:bg-[#FBF6EF] text-sm font-medium transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="h-12 px-7 rounded-full bg-[#0D0D0C] text-[#FFFDF8] text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm inline-flex items-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[2]" />
                <span>{editingDebt ? "Save Changes" : "Create Plan"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

