"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  X,
  Repeat,
  Calendar,
  CreditCard,
  Banknote,
  Building2,
  Zap,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { PAYMENT_METHODS } from "@/lib/constants";
import { CURRENCIES } from "@/lib/currencies";
import { getTodayDateStr } from "@/lib/utils";
import { PaymentMethod } from "@/types";
import { CategoryIcon } from "./category-icon";

export function QuickAddModal() {
  const {
    quickAddOpen,
    setQuickAddOpen,
    editingExpense,
    setEditingExpense,
    categories,
    currency,
    selectedMonth,
    addExpense,
    updateExpense,
  } = useExpenseStore();

  const currentCurrency = CURRENCIES[currency] || CURRENCIES.ZAR;
  const amountInputRef = useRef<HTMLInputElement>(null);

  const [amount, setAmount] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Card");
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const getDefaultDate = () => {
    const today = getTodayDateStr();
    if (today.startsWith(selectedMonth)) {
      return today;
    }
    return `${selectedMonth}-01`;
  };

  useEffect(() => {
    if (quickAddOpen) {
      if (editingExpense) {
        setAmount(editingExpense.amount.toString());
        setCategoryId(editingExpense.categoryId);
        setNote(editingExpense.note || "");
        setDate(editingExpense.date);
        setPaymentMethod(editingExpense.paymentMethod);
        setIsRecurring(!!editingExpense.isRecurring);
      } else {
        setAmount("");
        setCategoryId(categories[0]?.id || "");
        setNote("");
        setDate(getDefaultDate());
        setPaymentMethod("Card");
        setIsRecurring(false);
      }
      setError("");

      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    }
  }, [quickAddOpen, editingExpense, selectedMonth, categories]);

  if (!quickAddOpen) return null;

  const handleClose = () => {
    setQuickAddOpen(false);
    setEditingExpense(null);
  };

  const handleQuickAmount = (val: number) => {
    const currentVal = parseFloat(amount) || 0;
    setAmount((currentVal + val).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    if (!categoryId) {
      setError("Please select a category");
      return;
    }

    if (!date) {
      setError("Please select a date");
      return;
    }

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        amount: parsedAmount,
        categoryId,
        note: note.trim(),
        date,
        paymentMethod,
        isRecurring,
      });
    } else {
      addExpense({
        amount: parsedAmount,
        categoryId,
        note: note.trim(),
        date,
        paymentMethod,
        isRecurring,
      });

      try {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.8 },
          colors: ["#0D0D0C", "#96CE96", "#F99654"],
        });
      } catch {
        // ignore
      }
    }

    handleClose();
  };

  const paymentIcons: Record<PaymentMethod, React.ReactNode> = {
    Card: <CreditCard className="w-3.5 h-3.5 stroke-[1.5]" />,
    Bank: <Building2 className="w-3.5 h-3.5 stroke-[1.5]" />,
    Cash: <Banknote className="w-3.5 h-3.5 stroke-[1.5]" />,
    EFT: <Building2 className="w-3.5 h-3.5 stroke-[1.5]" />,
    "Instant EFT": <Zap className="w-3.5 h-3.5 stroke-[1.5]" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0D0D0C]/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#FFFDF8] border border-[#0D0D0C]/[0.1] rounded-[28px] shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="px-7 pt-6 pb-4 flex items-center justify-between border-b border-[#0D0D0C]/[0.06]">
          <div>
            <h2 className="text-lg font-medium text-[#0D0D0C]">
              {editingExpense ? "Edit Expense" : "Add Expense"}
            </h2>
            <p className="text-xs text-[#0D0D0C]/56 mt-0.5">
              {editingExpense ? "Update your transaction details" : "Log outlays in South African Rands"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-[#FBF6EF] text-[#0D0D0C]/60 hover:text-[#0D0D0C] transition-colors"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-5">
          {error && (
            <div className="p-3 rounded-[16px] bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Large Amount Field */}
          <div>
            <label className="block text-xs font-normal text-[#0D0D0C]/56 mb-1.5">
              Amount ({currentCurrency.symbol} - {currentCurrency.code})
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-5 text-2xl font-medium text-[#0D0D0C]/40">
                {currentCurrency.symbol}
              </span>
              <input
                ref={amountInputRef}
                type="number"
                step="any"
                min="0"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 text-4xl font-medium tracking-tight rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] focus:outline-none focus:border-[#0D0D0C] text-[#0D0D0C] transition-colors"
                required
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1">
              <span className="text-xs text-[#0D0D0C]/42 mr-1">Quick:</span>
              {[50, 100, 250, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className="px-3 py-1 rounded-full border border-[#0D0D0C]/[0.08] bg-[#FFFDF8] hover:bg-[#FBF6EF] text-xs font-medium text-[#0D0D0C] transition-colors"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-normal text-[#0D0D0C]/56 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-[16px] text-xs font-medium border text-left transition-all ${
                      isSelected
                        ? "bg-[#0D0D0C] text-[#FFFDF8] border-[#0D0D0C] shadow-sm"
                        : "bg-[#FBF6EF] text-[#0D0D0C] border-[#0D0D0C]/[0.08] hover:border-[#0D0D0C]/20"
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : cat.color || "#0D0D0C",
                        color: "#fff",
                      }}
                    >
                      <CategoryIcon iconName={cat.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note input */}
          <div>
            <label className="block text-xs font-normal text-[#0D0D0C]/56 mb-1.5">
              Note (optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Apple Music, Woolworths, VOX data..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2.5 rounded-[16px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] text-xs sm:text-sm text-[#0D0D0C] placeholder:text-[#0D0D0C]/42 focus:outline-none focus:border-[#0D0D0C]"
            />
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-normal text-[#0D0D0C]/56 mb-1.5">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#0D0D0C]/42 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-[16px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] text-xs text-[#0D0D0C] focus:outline-none focus:border-[#0D0D0C]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-normal text-[#0D0D0C]/56 mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(["Card", "EFT", "Cash"] as PaymentMethod[]).map((pm) => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPaymentMethod(pm)}
                    className={`py-2 px-1.5 rounded-[14px] text-xs font-medium border flex items-center justify-center gap-1 transition-all ${
                      paymentMethod === pm
                        ? "bg-[#0D0D0C] text-[#FFFDF8] border-[#0D0D0C]"
                        : "bg-[#FBF6EF] text-[#0D0D0C] border-[#0D0D0C]/[0.08] hover:border-[#0D0D0C]/20"
                    }`}
                  >
                    {paymentIcons[pm]}
                    <span>{pm}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Recurring Expense Switch */}
          <div className="p-3.5 rounded-[18px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] flex items-center justify-between cursor-pointer" onClick={() => setIsRecurring(!isRecurring)}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-[#0D0D0C]/[0.08] bg-[#FFFDF8] flex items-center justify-center text-[#0D0D0C]">
                <Repeat className="w-4 h-4 stroke-[1.5]" />
              </div>
              <div>
                <span className="text-xs font-medium text-[#0D0D0C] block">
                  Repeat Every Month
                </span>
                <span className="text-[11px] text-[#0D0D0C]/56">
                  Auto-projects into all future monthly trackers
                </span>
              </div>
            </div>

            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 accent-[#0D0D0C] cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-full border border-[#0D0D0C]/20 text-xs font-medium text-[#0D0D0C] hover:bg-[#FBF6EF] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-12 px-7 rounded-full bg-[#0D0D0C] text-[#FFFDF8] hover:bg-[#0D0D0C]/90 text-sm font-medium transition-all shadow-sm active:scale-95"
            >
              {editingExpense ? "Save Changes" : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
