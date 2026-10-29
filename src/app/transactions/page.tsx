"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Download,
  Repeat,
  Trash2,
  Edit2,
  Calendar,
  Zap,
  CreditCard,
  Banknote,
  Building2,
  RotateCcw,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency, formatDisplayDate, formatMonthYear } from "@/lib/utils";
import { CategoryIcon } from "@/components/category-icon";
import { PaymentMethod, Expense } from "@/types";
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
  const [recurringFilter, setRecurringFilter] = useState<string>("all"); // 'all' | 'recurring' | 'onetime'
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
      result = result.filter((e) => Boolean(e.isRecurring));
    } else if (recurringFilter === "onetime") {
      result = result.filter((e) => !e.isRecurring);
    }

    // Search query filter (note, amount, category name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((e) => {
        const cat = getCategoryById(e.categoryId);
        return (
          e.note?.toLowerCase().includes(q) ||
          cat?.name.toLowerCase().includes(q) ||
          e.amount.toString().includes(q) ||
          e.paymentMethod.toLowerCase().includes(q)
        );
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "date-desc") return b.date.localeCompare(a.date);
      if (sortBy === "date-asc") return a.date.localeCompare(b.date);
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc") return a.amount - b.amount;
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
    const csvContent = exportDataCSV();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `mint-month-transactions-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paymentIcons: Record<PaymentMethod, React.ReactNode> = {
    Card: <CreditCard className="w-3 h-3 text-blue-500" />,
    Bank: <Building2 className="w-3 h-3 text-purple-500" />,
    Cash: <Banknote className="w-3 h-3 text-emerald-500" />,
    EFT: <Building2 className="w-3 h-3 text-purple-500" />,
    "Instant EFT": <Zap className="w-3 h-3 text-amber-500" />,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            All Transactions
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {monthScope === "selected"
              ? `Viewing transactions for ${formatMonthYear(selectedMonth)}`
              : "Viewing all-time records across all months"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-card hover:bg-muted border border-border/70 text-xs font-semibold text-foreground transition-all shadow-sm active:scale-95"
            title="Download CSV"
          >
            <Download className="w-4 h-4 text-muted-foreground" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => setQuickAddOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-mint-500 hover:bg-mint-600 text-white font-semibold text-xs shadow-glow active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-card border border-border/60 shadow-sm space-y-3">
        {/* Top Row: Search + Scope toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by note, category, or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-muted/40 border border-border/70 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-mint-500"
            />
          </div>

          {/* Month Scope Toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-muted/60 border border-border/40 shrink-0 self-stretch sm:self-auto">
            <button
              onClick={() => setMonthScope("selected")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                monthScope === "selected"
                  ? "bg-card text-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {formatMonthYear(selectedMonth)}
            </button>
            <button
              onClick={() => setMonthScope("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                monthScope === "all"
                  ? "bg-card text-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Bottom Row: Category, Payment, Recurring, Sort Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {/* Category Filter */}
          <div>
            <select
              value={selectedCatFilter}
              onChange={(e) => setSelectedCatFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-muted/30 border border-border/70 text-xs text-foreground focus:outline-none focus:border-mint-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={selectedPaymentFilter}
              onChange={(e) => setSelectedPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-muted/30 border border-border/70 text-xs text-foreground focus:outline-none focus:border-mint-500"
            >
              <option value="all">All Payment Methods</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.label}
                </option>
              ))}
            </select>
          </div>

          {/* Recurring Filter */}
          <div>
            <select
              value={recurringFilter}
              onChange={(e) => setRecurringFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-muted/30 border border-border/70 text-xs text-foreground focus:outline-none focus:border-mint-500"
            >
              <option value="all">All Types</option>
              <option value="recurring">Recurring Only</option>
              <option value="onetime">One-Time Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              // @ts-expect-error type narrowing
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-muted/30 border border-border/70 text-xs text-foreground focus:outline-none focus:border-mint-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Stats Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
        <span>
          Showing <strong className="text-foreground">{filteredExpenses.length}</strong>{" "}
          transactions
        </span>
        <span>
          Filtered Total:{" "}
          <strong className="text-foreground font-mono text-sm font-bold">
            {formatCurrency(totalFilteredAmount, currency)}
          </strong>
        </span>
      </div>

      {/* Transactions List */}
      <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm divide-y divide-border/40">
        {filteredExpenses.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
              <Filter className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">
              No matching transactions
            </h4>
            <p className="text-xs text-muted-foreground max-w-xs mt-1">
              Try adjusting your search query or reset filters.
            </p>
          </div>
        ) : (
          filteredExpenses.map((expense) => {
            const category = getCategoryById(expense.categoryId);
            const isDeleting = confirmDeleteId === expense.id;

            return (
              <div
                key={expense.id}
                className="py-3.5 flex items-center justify-between gap-3 group hover:bg-muted/30 px-2 -mx-2 rounded-2xl transition-colors"
              >
                {/* Left: Category Icon + Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: category.color }}
                  >
                    <CategoryIcon name={category.icon} className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {expense.note || category.name}
                      </span>
                      {expense.isRecurring && (
                        <span className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          <Repeat className="w-2.5 h-2.5" />
                          Recurring
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
                        {paymentIcons[expense.paymentMethod]}
                        {expense.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-sm sm:text-base font-bold font-mono text-foreground">
                      -{formatCurrency(expense.amount, currency)}
                    </div>
                  </div>

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
          })
        )}
      </div>
    </div>
  );
}

