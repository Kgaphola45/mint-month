"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  X,
  Plus,
  Repeat,
  Calendar,
  Zap,
  CreditCard,
  Banknote,
  Building2,
  Check,
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

  const currentCurrency = CURRENCIES[currency] || CURRENCIES.INR;
  const amountInputRef = useRef<HTMLInputElement>(null);

  const [amount, setAmount] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Card");
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Default date to today if today matches selectedMonth, otherwise 1st of selectedMonth
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
        setNote(editingExpense.note);
        setDate(editingExpense.date);
        setPaymentMethod(editingExpense.paymentMethod);
        setIsRecurring(Boolean(editingExpense.isRecurring));
      } else {
        setAmount("");
        setCategoryId(categories[0]?.id || "cat-food");
        setNote("");
        setDate(getDefaultDate());
        setPaymentMethod("Card");
        setIsRecurring(false);
      }
      setError("");

      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 50);
    }
  }, [quickAddOpen, editingExpense, categories, selectedMonth]);

  if (!quickAddOpen) return null;

  const handleClose = () => {
    setQuickAddOpen(false);
    setEditingExpense(null);
  };

  const handleQuickAmount = (delta: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + delta).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      amountInputRef.current?.focus();
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

      // Launch micro confetti
      try {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.8 },
          colors: ["#10b981", "#3b82f6", "#f59e0b"],
        });
      } catch {
        // ignore
      }
    }

    handleClose();
  };

  const paymentIcons: Record<PaymentMethod, React.ReactNode> = {
    Card: <CreditCard className="w-3.5 h-3.5 text-blue-500" />,
    Bank: <Building2 className="w-3.5 h-3.5 text-purple-500" />,
    Cash: <Banknote className="w-3.5 h-3.5 text-emerald-500" />,
    EFT: <Building2 className="w-3.5 h-3.5 text-purple-500" />,
    "Instant EFT": <Zap className="w-3.5 h-3.5 text-amber-500" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-border/40">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {editingExpense ? "Edit Expense" : "Quick Add Expense"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {editingExpense ? "Update your transaction details" : "Track spending in seconds"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Large Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
              Amount
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-2xl font-bold font-mono text-muted-foreground">
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
                className="w-full pl-12 pr-4 py-3 text-3xl font-bold font-mono rounded-2xl bg-muted/40 border border-border/70 focus:outline-none focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 transition-all text-foreground"
                required
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
              <span className="text-[11px] text-muted-foreground mr-1">Quick:</span>
              {[50, 100, 250, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className="px-2.5 py-1 rounded-xl text-xs font-mono font-medium bg-muted/60 hover:bg-mint-500/15 hover:text-mint-600 dark:hover:text-mint-400 border border-border/40 transition-colors"
                >
                  +{currentCurrency.symbol}{val}
                </button>
              ))}
            </div>
          </div>

          {/* Category Picker Grid */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-2xl border text-left transition-all ${isSelected
                        ? "border-mint-500 bg-mint-500/10 shadow-sm"
                        : "border-border/60 hover:bg-muted/40"
                      }`}
                  >
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-foreground truncate">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note & Description */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Dinner at Blue Tokai, Uber ride, Grocery run"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/70 focus:outline-none focus:border-mint-500 focus:ring-1 focus:ring-mint-500/20 text-xs text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Date & Payment Method Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/40 border border-border/70 focus:outline-none focus:border-mint-500 text-xs text-foreground"
                  required
                />
              </div>
            </div>

            {/* Payment Method Pills */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                Payment Method
              </label>
              <div className="grid grid-cols-4 gap-1">
                {PAYMENT_METHODS.map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-semibold flex flex-col items-center justify-center gap-1 border transition-all ${isSelected
                          ? "bg-card border-mint-500 text-foreground shadow-sm ring-1 ring-mint-500"
                          : "border-border/50 text-muted-foreground hover:bg-muted/40"
                        }`}
                    >
                      {paymentIcons[pm.id]}
                      <span>{pm.label.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recurring Toggle Switch */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Repeat className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Monthly Recurring Expense
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Auto-projects to future months (Rent, Netflix, WiFi)
                </span>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isRecurring}
              onClick={() => setIsRecurring(!isRecurring)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isRecurring ? "bg-mint-500" : "bg-muted"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isRecurring ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-mint-500 hover:bg-mint-600 text-white text-xs font-bold shadow-glow active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingExpense ? "Save Changes" : "Record Expense"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
