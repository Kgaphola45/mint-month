"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Repeat,
  Trash2,
  Edit2,
  Receipt,
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

  // Empty state: cream card + thin line-art illustration (1px stroke) + white space + black pill button
  if (monthExpenses.length === 0) {
    return (
      <div className="p-12 sm:p-16 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center min-h-[340px] text-center">
        <div className="w-16 h-16 rounded-full border border-[#0D0D0C]/[0.12] flex items-center justify-center text-[#0D0D0C]/60 mb-5">
          <Receipt className="w-8 h-8 stroke-[1]" />
        </div>
        <h4 className="text-xl font-medium text-[#0D0D0C] tracking-[-0.02em]">
          No Transactions Yet
        </h4>
        <p className="text-sm text-[#0D0D0C]/56 max-w-sm mt-1.5 mb-7">
          You haven't recorded any expenses for this month.
        </p>
        <button
          onClick={() => setQuickAddOpen(true)}
          className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm"
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
    <div className="p-6 sm:p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[16px] font-normal text-[#0D0D0C]/56">
            Recent Expenses
          </h3>
          <p className="text-xs text-[#0D0D0C]/42 mt-0.5">
            Latest outlays for this period
          </p>
        </div>

        {showViewAll && monthExpenses.length > limit && (
          <Link
            href="/transactions"
            className="flex items-center gap-1.5 text-xs font-medium text-[#0D0D0C] hover:opacity-70 transition-opacity"
          >
            <span>View all ({monthExpenses.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      <div className="divide-y divide-[#0D0D0C]/[0.06]">
        {displayed.map((expense) => {
          const category = getCategoryById(expense.categoryId);
          const isConfirming = confirmDeleteId === expense.id;

          return (
            <div
              key={expense.id}
              className="py-3.5 flex items-center justify-between gap-4 group hover:bg-[#FBF6EF]/50 -mx-3 px-3 rounded-[16px] transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Thin category icon circle */}
                <div
                  className="w-10 h-10 rounded-full border border-[#0D0D0C]/[0.08] flex items-center justify-center shrink-0 bg-[#FFFDFA]"
                  style={{ color: category.color || "#0D0D0C" }}
                >
                  <CategoryIcon iconName={category.icon} className="w-4 h-4 stroke-[1.5]" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#0D0D0C] truncate">
                      {category.name}
                    </span>
                    {expense.isRecurring && (
                      <span className="flex items-center gap-0.5 text-[10px] font-normal px-2 py-0.5 rounded-full border border-[#0D0D0C]/[0.1] text-[#0D0D0C]/70">
                        <Repeat className="w-2.5 h-2.5" />
                        <span>Monthly</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#0D0D0C]/56 mt-0.5">
                    <span>{formatDisplayDate(expense.date)}</span>
                    {expense.note && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[180px] sm:max-w-xs text-[#0D0D0C]/70">
                          {expense.note}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span className="text-[11px] text-[#0D0D0C]/42">
                      {expense.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-base sm:text-lg font-medium tracking-tight text-[#0D0D0C]">
                  {formatCurrency(expense.amount, currency)}
                </span>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isConfirming ? (
                    <div className="flex items-center gap-1 bg-[#FFFDFA] border border-[#0D0D0C]/[0.12] rounded-full p-1 shadow-sm">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-medium"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-0.5 rounded-full hover:bg-[#FBF6EF] text-[#0D0D0C] text-[10px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-1.5 rounded-full hover:bg-[#FBF6EF] text-[#0D0D0C]/60 hover:text-[#0D0D0C] transition-colors"
                        title="Edit expense"
                      >
                        <Edit2 className="w-3.5 h-3.5 stroke-[1.5]" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(expense.id)}
                        className="p-1.5 rounded-full hover:bg-[#FBF6EF] text-[#0D0D0C]/60 hover:text-rose-600 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                      </button>
                    </>
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
