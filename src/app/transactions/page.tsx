"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Download,
  Repeat,
  Trash2,
  Edit2,
  Receipt,
  RotateCcw,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency, formatDisplayDate, formatMonthYear } from "@/lib/utils";
import { CategoryIcon } from "@/components/category-icon";
import { Expense } from "@/types";
import { PAYMENT_METHODS } from "@/lib/constants";

export default function TransactionsPage() {
  const {
    selectedMonth,
    expenses,
    categories,
    getCategoryById,
    currency,
    deleteExpense,
    setEditingExpense,
    setQuickAddOpen,
    exportDataCSV,
  } = useExpenseStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>("all");
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<string>("all");
  const [recurringFilter, setRecurringFilter] = useState<string>("all");
  const [monthScope, setMonthScope] = useState<"selected" | "all">("selected");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter and sort logic
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Month scope filter
    if (monthScope === "selected") {
      result = result.filter((e) => e.date.startsWith(selectedMonth));
    }

    // Category filter
    if (selectedCatFilter !== "all") {
      result = result.filter((e) => e.categoryId === selectedCatFilter);
    }

    // Payment method filter
    if (selectedPaymentFilter !== "all") {
      result = result.filter((e) => e.paymentMethod === selectedPaymentFilter);
    }

    // Recurring filter
    if (recurringFilter === "recurring") {
      result = result.filter((e) => e.isRecurring);
    } else if (recurringFilter === "onetime") {
      result = result.filter((e) => !e.isRecurring);
    }

    // Search query filter (note, category name, amount)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((e) => {
        const cat = getCategoryById(e.categoryId);
        return (
          e.note?.toLowerCase().includes(q) ||
          cat.name.toLowerCase().includes(q) ||
          e.amount.toString().includes(q) ||
          e.paymentMethod.toLowerCase().includes(q)
        );
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "date-desc") {
        return b.date.localeCompare(a.date);
      }
      if (sortBy === "date-asc") {
        return a.date.localeCompare(b.date);
      }
      if (sortBy === "amount-desc") {
        return b.amount - a.amount;
      }
      if (sortBy === "amount-asc") {
        return a.amount - b.amount;
      }
      return 0;
    });

    return result;
  }, [
    expenses,
    monthScope,
    selectedMonth,
    selectedCatFilter,
    selectedPaymentFilter,
    recurringFilter,
    searchQuery,
    sortBy,
    getCategoryById,
  ]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setQuickAddOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteExpense(id);
    setConfirmDeleteId(null);
  };

  const handleDownloadCSV = () => {
    const csv = exportDataCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `mint-month-transactions-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCatFilter("all");
    setSelectedPaymentFilter("all");
    setRecurringFilter("all");
    setSortBy("date-desc");
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#0D0D0C]/[0.08]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#0D0D0C]">
            Transactions
          </h1>
          <p className="text-sm text-[#0D0D0C]/56 mt-1">
            {monthScope === "selected"
              ? `Viewing records for ${formatMonthYear(selectedMonth)}`
              : "Viewing all historical expenses"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#0D0D0C]/20 hover:border-[#0D0D0C] text-[#0D0D0C] hover:bg-[#0D0D0C] hover:text-[#FFFDF8] text-xs font-medium transition-all shadow-sm"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 stroke-[1.8]" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => setQuickAddOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0D0D0C] hover:bg-[#0D0D0C]/90 text-[#FFFDF8] text-xs font-medium transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-6 rounded-[24px] bg-[#FFFDF8] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-4">
        {/* Top Row: Search + Scope toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0D0D0C]/42" />
            <input
              type="text"
              placeholder="Search by note, category, or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] text-xs sm:text-sm text-[#0D0D0C] placeholder:text-[#0D0D0C]/42 focus:outline-none focus:border-[#0D0D0C]"
            />
          </div>

          {/* Month Scope Toggle */}
          <div className="flex items-center p-1 rounded-full bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] shrink-0 self-stretch sm:self-auto">
            <button
              onClick={() => setMonthScope("selected")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                monthScope === "selected"
                  ? "bg-[#0D0D0C] text-[#FFFDF8] shadow-sm"
                  : "text-[#0D0D0C]/56 hover:text-[#0D0D0C]"
              }`}
            >
              {formatMonthYear(selectedMonth)}
            </button>
            <button
              onClick={() => setMonthScope("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                monthScope === "all"
                  ? "bg-[#0D0D0C] text-[#FFFDF8] shadow-sm"
                  : "text-[#0D0D0C]/56 hover:text-[#0D0D0C]"
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Bottom Row: Category, Payment, Recurring, Sort Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Category Filter */}
          <select
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
            className="w-full px-3.5 py-2 rounded-full bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] text-xs text-[#0D0D0C] focus:outline-none focus:border-[#0D0D0C]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={selectedPaymentFilter}
            onChange={(e) => setSelectedPaymentFilter(e.target.value)}
            className="w-full px-3.5 py-2 rounded-full bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] text-xs text-[#0D0D0C] focus:outline-none focus:border-[#0D0D0C]"
          >
            <option value="all">All Payment Methods</option>
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm.id} value={pm.id}>
                {pm.label}
              </option>
            ))}
          </select>

          {/* Recurring Filter */}
          <select
            value={recurringFilter}
            onChange={(e) => setRecurringFilter(e.target.value)}
            className="w-full px-3.5 py-2 rounded-full bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] text-xs text-[#0D0D0C] focus:outline-none focus:border-[#0D0D0C]"
          >
            <option value="all">All Types</option>
            <option value="recurring">Recurring Only</option>
            <option value="onetime">One-Time Only</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            // @ts-expect-error type narrowing
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3.5 py-2 rounded-full bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] text-xs text-[#0D0D0C] focus:outline-none focus:border-[#0D0D0C]"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* Filter Stats Bar */}
      <div className="flex items-center justify-between text-xs text-[#0D0D0C]/56 px-2">
        <span>
          Showing <strong className="text-[#0D0D0C] font-medium">{filteredExpenses.length}</strong> transactions
        </span>
        <span>
          Filtered Total:{" "}
          <strong className="text-[#0D0D0C] text-sm font-medium tracking-tight">
            {formatCurrency(totalFilteredAmount, currency)}
          </strong>
        </span>
      </div>

      {/* Transactions List */}
      <div className="p-6 sm:p-8 rounded-[24px] bg-[#FFFDF8] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] divide-y divide-[#0D0D0C]/[0.05]">
        {filteredExpenses.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full border border-[#0D0D0C]/[0.12] flex items-center justify-center text-[#0D0D0C]/60 mb-5">
              <Receipt className="w-8 h-8 stroke-[1]" />
            </div>
            <h4 className="text-xl font-medium text-[#0D0D0C] tracking-[-0.02em]">
              No Matching Transactions
            </h4>
            <p className="text-sm text-[#0D0D0C]/56 max-w-sm mt-1.5 mb-6">
              Try adjusting your search criteria or resetting filters.
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#0D0D0C]/20 hover:border-[#0D0D0C] text-xs font-medium text-[#0D0D0C] transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          filteredExpenses.map((expense) => {
            const category = getCategoryById(expense.categoryId);
            const isDeleting = confirmDeleteId === expense.id;

            return (
              <div
                key={expense.id}
                className="py-3.5 flex items-center justify-between gap-4 group hover:bg-[#FBF6EF]/50 -mx-3 px-3 rounded-[16px] transition-colors"
              >
                {/* Left: Category Icon + Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-full border border-[#0D0D0C]/[0.08] flex items-center justify-center shrink-0 bg-[#FFFDF8]"
                    style={{ color: category.color || "#0D0D0C" }}
                  >
                    <CategoryIcon iconName={category.icon} className="w-4 h-4 stroke-[1.5]" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-[#0D0D0C] truncate">
                        {expense.note || category.name}
                      </span>
                      {expense.isRecurring && (
                        <span className="flex items-center gap-0.5 text-[10px] font-normal px-2 py-0.5 rounded-full border border-[#0D0D0C]/[0.1] text-[#0D0D0C]/70">
                          <Repeat className="w-2.5 h-2.5" />
                          <span>Monthly</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#0D0D0C]/56 mt-0.5">
                      <span className="font-normal text-[#0D0D0C]/80">
                        {category.name}
                      </span>
                      <span>•</span>
                      <span>{formatDisplayDate(expense.date)}</span>
                      <span>•</span>
                      <span className="text-[11px] text-[#0D0D0C]/42">
                        {expense.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-base sm:text-lg font-medium tracking-tight text-[#0D0D0C]">
                    {formatCurrency(expense.amount, currency)}
                  </span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isDeleting ? (
                      <div className="flex items-center gap-1 bg-[#FFFDF8] border border-[#0D0D0C]/[0.12] rounded-full p-1 shadow-sm">
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-medium"
                        >
                          Confirm
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
          })
        )}
      </div>
    </div>
  );
}
