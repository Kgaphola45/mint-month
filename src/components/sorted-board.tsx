"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  Clock,
  GripVertical,
  RotateCcw,
  Search,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency, formatDisplayDate } from "@/lib/utils";
import { CategoryIcon } from "@/components/category-icon";
import { Expense } from "@/types";

interface SortedBoardProps {
  onOpenSetLimits?: () => void;
}

export function SortedBoard({ onOpenSetLimits }: SortedBoardProps) {
  const {
    selectedMonth,
    currency,
    getExpensesForMonth,
    getCategoryById,
    isTransactionSorted,
    setTransactionsSorted,
    setQuickAddOpen,
  } = useExpenseStore();

  const [draggedTransactionId, setDraggedTransactionId] = useState<string | null>(null);
  const [isOverLeft, setIsOverLeft] = useState(false);
  const [isOverRight, setIsOverRight] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [announcement, setAnnouncement] = useState("");

  const transactions = getExpensesForMonth(selectedMonth);
  const normalizedSearch = searchFilter.trim().toLowerCase();
  const filteredTransactions = normalizedSearch
    ? transactions.filter((transaction) => {
        const category = getCategoryById(transaction.categoryId);
        return [
          transaction.note,
          category.name,
          transaction.paymentMethod,
          transaction.amount.toString(),
        ].some((value) => value.toLowerCase().includes(normalizedSearch));
      })
    : transactions;

  const unsortedTransactions = filteredTransactions.filter(
    (transaction) => !isTransactionSorted(selectedMonth, transaction.id)
  );
  const sortedTransactions = filteredTransactions.filter((transaction) =>
    isTransactionSorted(selectedMonth, transaction.id)
  );
  const totalUnsorted = unsortedTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );
  const totalSorted = sortedTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const fireCelebration = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.65 },
        colors: ["#0D0D0C", "#96CE96", "#F99654", "#F6DE68"],
      });
    } catch (error) {
      console.error("Could not display sorted transaction celebration:", error);
    }
  };

  const handleMoveTransactions = (transactionIds: string[], markSorted: boolean) => {
    const changedTransactions = transactionIds.filter(
      (id) => isTransactionSorted(selectedMonth, id) !== markSorted
    );
    if (changedTransactions.length === 0) return;

    setTransactionsSorted(selectedMonth, changedTransactions, markSorted);
    const action = markSorted ? "marked sorted" : "moved back to not sorted";
    setAnnouncement(
      `${changedTransactions.length} transaction${changedTransactions.length === 1 ? "" : "s"} ${action}.`
    );
    if (markSorted) fireCelebration();
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    markSorted: boolean
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (markSorted) {
      if (!isOverRight) setIsOverRight(true);
    } else if (!isOverLeft) {
      setIsOverLeft(true);
    }
  };

  const handleDragLeave = (
    event: React.DragEvent<HTMLDivElement>,
    markSorted: boolean
  ) => {
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;
    if (markSorted) setIsOverRight(false);
    else setIsOverLeft(false);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    markSorted: boolean
  ) => {
    event.preventDefault();
    if (markSorted) setIsOverRight(false);
    else setIsOverLeft(false);
    const transactionId =
      event.dataTransfer.getData("text/plain") || draggedTransactionId;
    if (transactionId) {
      handleMoveTransactions([transactionId], markSorted);
      setDraggedTransactionId(null);
    }
  };

  const renderTransaction = (transaction: Expense, isSorted: boolean) => {
    const category = getCategoryById(transaction.categoryId);
    const title = transaction.note.trim() || `${category.name} transaction`;
    const isDragging = draggedTransactionId === transaction.id;

    return (
      <article
        key={transaction.id}
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData("text/plain", transaction.id);
          event.dataTransfer.effectAllowed = "move";
          setDraggedTransactionId(transaction.id);
        }}
        onDragEnd={() => setDraggedTransactionId(null)}
        className={`group p-4 rounded-[20px] border transition-all duration-150 cursor-grab active:cursor-grabbing select-none ${
          isDragging
            ? "opacity-35 scale-[0.98] border-dashed border-[#0D0D0C]"
            : isSorted
              ? "bg-[#FFFDFA] border-emerald-200/80 hover:border-emerald-400 hover:shadow-md"
              : "bg-[#FBF6EF] border-[#0D0D0C]/[0.08] hover:border-[#0D0D0C]/30 hover:shadow-md hover:bg-[#FFFDFA]"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="text-[#0D0D0C]/30 group-hover:text-[#0D0D0C]/80 transition-colors shrink-0"
              title={isSorted ? "Drag to mark not sorted" : "Drag to mark sorted"}
              aria-hidden="true"
            >
              <GripVertical className="w-4 h-4 stroke-[2]" />
            </div>

            <div
              className="w-9 h-9 rounded-full border border-[#0D0D0C]/[0.08] flex items-center justify-center shrink-0 bg-[#FFFDFA] shadow-xs"
              style={{ color: category.color || "#0D0D0C" }}
              aria-hidden="true"
            >
              <CategoryIcon
                iconName={category.icon}
                className="w-4 h-4 stroke-[1.6]"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-medium text-[#0D0D0C] truncate">
                  {title}
                </span>
                {isSorted && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                    <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    Sorted
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#0D0D0C]/50 block truncate">
                {category.name} · {formatDisplayDate(transaction.date)} ·{" "}
                {transaction.paymentMethod}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-sm font-semibold text-[#0D0D0C]">
              {formatCurrency(transaction.amount, currency)}
            </span>
            <button
              type="button"
              aria-pressed={isSorted}
              aria-label={`Mark ${title} as ${isSorted ? "not sorted" : "sorted"}`}
              onClick={() =>
                handleMoveTransactions([transaction.id], !isSorted)
              }
              className={`h-8 px-3 rounded-full border text-xs font-medium transition-all flex items-center gap-1 shadow-xs active:scale-95 ${
                isSorted
                  ? "border-[#0D0D0C]/[0.12] bg-[#FBF6EF] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-[#0D0D0C]/70"
                  : "border-[#0D0D0C]/[0.15] bg-[#FFFDFA] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-[#0D0D0C]"
              }`}
            >
              {isSorted ? (
                <>
                  <ArrowLeft className="w-3 h-3 stroke-[2]" />
                  <span>Unsort</span>
                </>
              ) : (
                <>
                  <span>Sort</span>
                  <ArrowRight className="w-3 h-3 stroke-[2]" />
                </>
              )}
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D0D0C]" />
            <h3 className="text-lg font-medium text-[#0D0D0C] tracking-tight">
              Transaction Settlement Board
            </h3>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#0D0D0C]/[0.05] text-[#0D0D0C]/70">
              Drag &amp; Drop
            </span>
          </div>
          <p className="text-xs text-[#0D0D0C]/56">
            Move each transaction independently as it is settled.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="relative min-w-[180px] sm:min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#0D0D0C]/40" />
            <input
              type="search"
              aria-label="Search transactions"
              placeholder="Search transactions..."
              value={searchFilter}
              onChange={(event) => setSearchFilter(event.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-xs text-[#0D0D0C] placeholder:text-[#0D0D0C]/40 focus:outline-none focus:border-[#0D0D0C] transition-all"
            />
          </label>

          {unsortedTransactions.length > 0 && (
            <button
              type="button"
              onClick={() =>
                handleMoveTransactions(
                  unsortedTransactions.map((transaction) => transaction.id),
                  true
                )
              }
              className="h-9 px-3.5 rounded-full border border-[#0D0D0C]/[0.15] bg-[#FFFDFA] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-xs font-medium text-[#0D0D0C] transition-all flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
              title="Mark all matching transactions as sorted"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Sort All</span>
            </button>
          )}

          {sortedTransactions.length > 0 && (
            <button
              type="button"
              onClick={() =>
                handleMoveTransactions(
                  sortedTransactions.map((transaction) => transaction.id),
                  false
                )
              }
              className="h-9 px-3.5 rounded-full border border-[#0D0D0C]/[0.15] bg-[#FFFDFA] hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-xs font-medium text-[#0D0D0C]/70 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
              title="Move all matching transactions back to not sorted"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>

      {transactions.length === 0 ? (
        <div className="p-10 rounded-[24px] bg-[#FFFDFA] border border-dashed border-[#0D0D0C]/[0.15] text-center">
          <h4 className="text-sm font-semibold text-[#0D0D0C]">
            No transactions for {selectedMonth}
          </h4>
          <p className="text-xs text-[#0D0D0C]/56 mt-1 mb-4">
            Add transactions to sort and settle them individually.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setQuickAddOpen(true)}
              className="px-4 py-2 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs font-medium"
            >
              Add Transaction
            </button>
            {onOpenSetLimits && (
              <button
                type="button"
                onClick={onOpenSetLimits}
                className="px-4 py-2 rounded-full border border-[#0D0D0C]/20 text-xs font-medium text-[#0D0D0C]"
              >
                Set Budget Limits
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            onDragOver={(event) => handleDragOver(event, false)}
            onDragLeave={(event) => handleDragLeave(event, false)}
            onDrop={(event) => handleDrop(event, false)}
            className={`flex flex-col rounded-[26px] border transition-all duration-200 min-h-[480px] p-5 sm:p-6 ${
              isOverLeft
                ? "border-[#0D0D0C] bg-[#FBF6EF] ring-2 ring-[#0D0D0C]/10 scale-[1.005]"
                : "border-[#0D0D0C]/[0.1] bg-[#FFFDFA] shadow-[0_8px_24px_rgba(0,0,0,0.03)]"
            }`}
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#0D0D0C]/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full border border-amber-300 bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-semibold text-[#0D0D0C] tracking-tight">
                      Not Sorted
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100/70 text-amber-900">
                      {unsortedTransactions.length}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#0D0D0C]/50">
                    Pending transactions
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-[#0D0D0C]/40 block font-medium">
                  To Clear
                </span>
                <span className="text-sm font-semibold text-[#0D0D0C]">
                  {formatCurrency(totalUnsorted, currency)}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-3" aria-label="Not sorted transactions">
              {unsortedTransactions.length > 0 ? (
                unsortedTransactions.map((transaction) =>
                  renderTransaction(transaction, false)
                )
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center rounded-[20px] bg-[#FBF6EF]/60 border border-dashed border-emerald-300/80 min-h-[220px]">
                  <CheckCheck className="w-7 h-7 text-emerald-700 mb-2" />
                  <h5 className="text-sm font-semibold text-[#0D0D0C]">
                    No unsorted transactions
                  </h5>
                  <p className="text-xs text-[#0D0D0C]/50 mt-1">
                    {normalizedSearch
                      ? "No matching transactions remain in this column."
                      : "All transactions are sorted."}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div
            onDragOver={(event) => handleDragOver(event, true)}
            onDragLeave={(event) => handleDragLeave(event, true)}
            onDrop={(event) => handleDrop(event, true)}
            className={`flex flex-col rounded-[26px] border transition-all duration-200 min-h-[480px] p-5 sm:p-6 ${
              isOverRight
                ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 scale-[1.005]"
                : "border-[#0D0D0C]/[0.1] bg-[#FFFDFA] shadow-[0_8px_24px_rgba(0,0,0,0.03)]"
            }`}
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#0D0D0C]/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-semibold text-[#0D0D0C] tracking-tight">
                      Sorted
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-900">
                      {sortedTransactions.length}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#0D0D0C]/50">
                    Settled transactions
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-[#0D0D0C]/40 block font-medium">
                  Cleared
                </span>
                <span className="text-sm font-semibold text-emerald-800">
                  {formatCurrency(totalSorted, currency)}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-3" aria-label="Sorted transactions">
              {sortedTransactions.length > 0 ? (
                sortedTransactions.map((transaction) =>
                  renderTransaction(transaction, true)
                )
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center rounded-[20px] bg-[#FBF6EF]/50 border border-dashed border-[#0D0D0C]/[0.12] min-h-[220px]">
                  <ArrowRight className="w-6 h-6 text-[#0D0D0C]/50 mb-2" />
                  <h5 className="text-sm font-semibold text-[#0D0D0C]">
                    No sorted transactions yet
                  </h5>
                  <p className="text-xs text-[#0D0D0C]/50 mt-1">
                    Move transactions here as you settle them.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
