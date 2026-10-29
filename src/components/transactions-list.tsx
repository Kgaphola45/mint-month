"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Repeat,
  Trash2,
  Edit2,
  Receipt,
  Zap,
  CreditCard,
  Banknote,
  Building2,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency, formatDisplayDate } from "@/lib/utils";
import { CategoryIcon } from "./category-icon";
import { Expense } from "@/types";

interface TransactionsListProps {
  limit?: number;
  showViewAll?: boolean;
}

export function TransactionsList({
  limit = 5,
  showViewAll = true,
}: TransactionsListProps) {
  const {
    selectedMonth,
    getExpensesForMonth,
    getCategoryById,
    currency,
    deleteExpense,
    setEditingExpense,
    setQuickAddOpen,
  } = useExpenseStore();

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const monthExpenses = getExpensesForMonth(selectedMonth);
  const displayed = limit ? monthExpenses.slice(0, limit) : monthExpenses;

  const paymentIconMap: Record<string, React.ReactNode> = {
    Card: <CreditCard className="w-3 h-3 text-blue-500" />,
    Bank: <Building2 className="w-3 h-3 text-purple-500" />,
    Cash: <Banknote className="w-3 h-3 text-emerald-500" />,
    EFT: <Building2 className="w-3 h-3 text-purple-500" />,
    "Instant EFT": <Zap className="w-3 h-3 text-amber-500" />,
  };

  if (monthExpenses.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-card border border-border/60 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-mint-500/10 text-mint-500 flex items-center justify-center mb-3">
          <Receipt className="w-6 h-6 stroke-[1.8]" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">
          No Transactions Yet
        </h4>
        <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
          You haven't recorded any expenses for this month.
        </p>
        <button
          onClick={() => setQuickAddOpen(true)}
          className="px-4 py-2 rounded-2xl bg-mint-500 hover:bg-mint-600 text-white text-xs font-semibold shadow-glow active:scale-95 transition-all"
        >
          + Add First Expense
        </button>
      </div>
    );
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setQuickAddOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteExpense(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold tracking-tight uppercase tracking-wider text-muted-foreground">
            {limit ? "Recent Transactions" : "Transactions"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {monthExpenses.length} total recorded this month
          </p>
        </div>

        {showViewAll && monthExpenses.length > limit && (
          <Link
            href="/transactions"
            className="flex items-center gap-1 text-xs font-semibold text-mint-600 dark:text-mint-400 hover:underline"
          >
            <span>View all ({monthExpenses.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      <div className="divide-y divide-border/40">
        {displayed.map((expense) => {
          const category = getCategoryById(expense.categoryId);
          const isDeleting = confirmDeleteId === expense.id;

          return (
            <div
              key={expense.id}
              className="py-3 sm:py-3.5 flex items-center justify-between gap-3 group hover:bg-muted/30 px-2 -mx-2 rounded-2xl transition-colors"
            >
              {/* Category Icon + Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: category.color }}
                >
                  <CategoryIcon name={category.icon} className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {expense.note || category.name}
                    </span>
                    {expense.isRecurring && (
                      <span
                        className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        title="Monthly recurring expense"
                      >
                        <Repeat className="w-2.5 h-2.5" />
                        Monthly
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="font-medium text-[11px] text-foreground/80">
                      {category.name}
                    </span>
                    <span>•</span>
                    <span className="text-[11px]">{formatDisplayDate(expense.date)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[11px] px-1.5 py-0.2 rounded-md bg-muted font-medium">
                      {paymentIconMap[expense.paymentMethod]}
                      {expense.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount & Quick Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-sm sm:text-base font-bold font-mono text-foreground">
                    -{formatCurrency(expense.amount, currency)}
                  </div>
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Edit transaction"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {isDeleting ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="px-2 py-1 rounded-lg bg-rose-500 text-white text-[10px] font-bold"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 rounded-lg bg-muted text-foreground text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(expense.id)}
                      className="p-1.5 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

