"use client";

import React, { useState } from "react";
import {
  GripVertical,
  Check,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Repeat,
  Plus,
  Search,
  CheckCheck,
  RotateCcw,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency, getBudgetStatus } from "@/lib/utils";
import { CategoryIcon } from "@/components/category-icon";

interface SortedBoardProps {
  onOpenSetLimits?: () => void;
}

export function SortedBoard({ onOpenSetLimits }: SortedBoardProps) {
  const {
    selectedMonth,
    currency,
    getCategorySpending,
    toggleCategorySorted,
    categories,
    isCategorySorted,
  } = useExpenseStore();

  const [draggedCatId, setDraggedCatId] = useState<string | null>(null);
  const [isOverLeft, setIsOverLeft] = useState(false);
  const [isOverRight, setIsOverRight] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  const categoryStats = getCategorySpending(selectedMonth);

  // Consider all categories with a budget, with spending, or all available categories
  const activeItems = categoryStats.filter((c) => c.budget > 0 || c.spent > 0);
  const allItems = activeItems.length > 0 ? activeItems : categoryStats;

  // Filter by search
  const filteredItems = searchFilter.trim()
    ? allItems.filter((item) =>
        item.category.name.toLowerCase().includes(searchFilter.toLowerCase().trim())
      )
    : allItems;

  const unsortedItems = filteredItems.filter((item) => !item.isSorted);
  const sortedItems = filteredItems.filter((item) => item.isSorted);

  // Totals calculations
  const totalUnsortedTarget = unsortedItems.reduce(
    (sum, item) => sum + (item.budget > 0 ? item.budget : item.spent),
    0
  );
  const totalSortedSettled = sortedItems.reduce(
    (sum, item) => sum + (item.budget > 0 ? item.budget : item.spent),
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
    } catch {
      // ignore
    }
  };

  const handleMoveItem = (catId: string, markSorted: boolean) => {
    const isCurrentlySorted = isCategorySorted(selectedMonth, catId);
    if (isCurrentlySorted !== markSorted) {
      toggleCategorySorted(selectedMonth, catId);
      if (markSorted) {
        fireCelebration();
      }
    }
  };

  // Drag handlers for Left column (Not Sorted)
  const handleDragOverLeft = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!isOverLeft) setIsOverLeft(true);
  };

  const handleDragLeaveLeft = (e: React.DragEvent) => {
    // Only set false if leaving to an outside element
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOverLeft(false);
    }
  };

  const handleDropOnLeft = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOverLeft(false);
    const catId = e.dataTransfer.getData("text/plain") || draggedCatId;
    if (catId) {
      handleMoveItem(catId, false);
      setDraggedCatId(null);
    }
  };

  // Drag handlers for Right column (Sorted)
  const handleDragOverRight = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!isOverRight) setIsOverRight(true);
  };

  const handleDragLeaveRight = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOverRight(false);
    }
  };

  const handleDropOnRight = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOverRight(false);
    const catId = e.dataTransfer.getData("text/plain") || draggedCatId;
    if (catId) {
      handleMoveItem(catId, true);
      setDraggedCatId(null);
    }
  };

  // Quick action: Sort all / Unsort all
  const handleSortAll = () => {
    unsortedItems.forEach((item) => {
      toggleCategorySorted(selectedMonth, item.category.id);
    });
    fireCelebration();
  };

  const handleResetAll = () => {
    sortedItems.forEach((item) => {
      toggleCategorySorted(selectedMonth, item.category.id);
    });
  };

  return (
    <div className="space-y-6">
      {/* Board Controls & Summary Bar */}
      <div className="p-6 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D0D0C]" />
            <h3 className="text-lg font-medium text-[#0D0D0C] tracking-tight">
              Settlement & Sorted Board
            </h3>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#0D0D0C]/[0.05] text-[#0D0D0C]/70">
              Drag & Drop
            </span>
          </div>
          <p className="text-xs text-[#0D0D0C]/56">
            Drag pending bills and budgets from the left to the right as you pay them off during the month.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Quick Search */}
          <div className="relative min-w-[180px] sm:min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#0D0D0C]/40" />
            <input
              type="text"
              placeholder="Search category..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-xs text-[#0D0D0C] placeholder:text-[#0D0D0C]/40 focus:outline-none focus:border-[#0D0D0C] transition-all"
            />
          </div>

          {/* Quick Bulk Actions */}
          {unsortedItems.length > 0 && (
            <button
              onClick={handleSortAll}
              className="h-9 px-3.5 rounded-full border border-[#0D0D0C]/[0.15] bg-[#FFFDFA] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-xs font-medium text-[#0D0D0C] transition-all flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
              title="Mark all pending categories as sorted"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sort All</span>
            </button>
          )}

          {sortedItems.length > 0 && (
            <button
              onClick={handleResetAll}
              className="h-9 px-3.5 rounded-full border border-[#0D0D0C]/[0.15] bg-[#FFFDFA] hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-xs font-medium text-[#0D0D0C]/70 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
              title="Reset sorted items back to pending"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Two Column Kanban / Table Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========================================================= */}
        {/* COLUMN 1 (LEFT): NOT SORTED (Pending / Not yet paid off) */}
        {/* ========================================================= */}
        <div
          onDragOver={handleDragOverLeft}
          onDragLeave={handleDragLeaveLeft}
          onDrop={handleDropOnLeft}
          className={`flex flex-col rounded-[26px] border transition-all duration-200 min-h-[480px] p-5 sm:p-6 ${
            isOverLeft
              ? "border-[#0D0D0C] bg-[#FBF6EF] ring-2 ring-[#0D0D0C]/10 scale-[1.005]"
              : "border-[#0D0D0C]/[0.1] bg-[#FFFDFA] shadow-[0_8px_24px_rgba(0,0,0,0.03)]"
          }`}
        >
          {/* Column 1 Header */}
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
                    {unsortedItems.length}
                  </span>
                </div>
                <span className="text-[11px] text-[#0D0D0C]/50">
                  Pending payment or settlement
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-[#0D0D0C]/40 block font-medium">
                To Clear
              </span>
              <span className="text-sm font-semibold text-[#0D0D0C]">
                {formatCurrency(totalUnsortedTarget, currency)}
              </span>
            </div>
          </div>

          {/* Column 1 Items List */}
          <div className="flex-1 space-y-3">
            {unsortedItems.length > 0 ? (
              unsortedItems.map((item) => {
                const hasBudget = item.budget > 0;
                const status = getBudgetStatus(item.spent, item.budget);
                const remaining = item.budget - item.spent;
                const isDragging = draggedCatId === item.category.id;

                return (
                  <div
                    key={item.category.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", item.category.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDraggedCatId(item.category.id);
                    }}
                    onDragEnd={() => setDraggedCatId(null)}
                    className={`group p-4 rounded-[20px] border transition-all duration-150 cursor-grab active:cursor-grabbing select-none ${
                      isDragging
                        ? "opacity-35 scale-[0.98] border-dashed border-[#0D0D0C]"
                        : "bg-[#FBF6EF] border-[#0D0D0C]/[0.08] hover:border-[#0D0D0C]/30 hover:shadow-md hover:bg-[#FFFDFA]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: Drag Handle + Category Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="text-[#0D0D0C]/30 group-hover:text-[#0D0D0C]/80 transition-colors shrink-0"
                          title="Drag to right to mark sorted"
                        >
                          <GripVertical className="w-4 h-4 stroke-[2]" />
                        </div>

                        <div
                          className="w-9 h-9 rounded-full border border-[#0D0D0C]/[0.08] flex items-center justify-center shrink-0 bg-[#FFFDFA] shadow-xs"
                          style={{ color: item.category.color || "#0D0D0C" }}
                        >
                          <CategoryIcon
                            iconName={item.category.icon}
                            className="w-4 h-4 stroke-[1.6]"
                          />
                        </div>

                        <div className="min-w-0 truncate">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-medium text-[#0D0D0C] truncate">
                              {item.category.name}
                            </span>
                            {item.isRecurring && (
                              <span
                                className="px-1.5 py-0.5 rounded-full border border-[#0D0D0C]/[0.08] bg-[#FFFDFA] text-[#0D0D0C] text-[9px] font-medium inline-flex items-center gap-0.5"
                                title="Repeats in every month's budget"
                              >
                                <Repeat className="w-2.5 h-2.5" /> Monthly
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#0D0D0C]/50 block truncate">
                            Spent {formatCurrency(item.spent, currency)}{" "}
                            {hasBudget && `of ${formatCurrency(item.budget, currency)}`}
                          </span>
                        </div>
                      </div>

                      {/* Right: Balance + Action Button */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-[10px] text-[#0D0D0C]/40 block uppercase tracking-wide">
                            {hasBudget ? (remaining >= 0 ? "Remaining" : "Over") : "Logged"}
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              status.isOver ? "text-rose-600" : "text-[#0D0D0C]"
                            }`}
                          >
                            {hasBudget
                              ? formatCurrency(Math.abs(remaining), currency)
                              : formatCurrency(item.spent, currency)}
                          </span>
                        </div>

                        {/* Interactive Drag or Click Action Pill */}
                        <button
                          type="button"
                          onClick={() => handleMoveItem(item.category.id, true)}
                          className="h-8 px-3 rounded-full border border-[#0D0D0C]/[0.15] bg-[#FFFDFA] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-xs font-medium text-[#0D0D0C] transition-all flex items-center gap-1 shadow-xs active:scale-95"
                          title="Click or drag to right to mark sorted"
                        >
                          <span>Sort</span>
                          <ArrowRight className="w-3 h-3 stroke-[2]" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar within card */}
                    {hasBudget && (
                      <div className="mt-3 pt-2.5 border-t border-[#0D0D0C]/[0.05]">
                        <div className="w-full h-1 bg-[#0D0D0C]/[0.06] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              status.isOver ? "bg-rose-500" : "bg-[#0D0D0C]"
                            }`}
                            style={{ width: `${Math.min(status.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[20px] bg-[#FBF6EF]/60 border border-dashed border-emerald-300/80 min-h-[300px]">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 shadow-xs">
                  <Sparkles className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h5 className="text-sm font-semibold text-[#0D0D0C] mb-1">
                  All Budgets & Bills Sorted!
                </h5>
                <p className="text-xs text-[#0D0D0C]/50 max-w-xs mb-3">
                  Everything planned for {selectedMonth} has been paid off and reconciled.
                </p>
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
                  100% Settled
                </span>
              </div>
            )}
          </div>

          {/* Bottom Drop Zone Hint */}
          <div className="mt-4 pt-3 border-t border-[#0D0D0C]/[0.06] text-center">
            <span className="text-[11px] text-[#0D0D0C]/40 italic">
              ← Drag here from the right to mark an item as unpaid / pending
            </span>
          </div>
        </div>

        {/* ======================================================= */}
        {/* COLUMN 2 (RIGHT): SORTED (Paid off / Settled / Checked) */}
        {/* ======================================================= */}
        <div
          onDragOver={handleDragOverRight}
          onDragLeave={handleDragLeaveRight}
          onDrop={handleDropOnRight}
          className={`flex flex-col rounded-[26px] border transition-all duration-200 min-h-[480px] p-5 sm:p-6 ${
            isOverRight
              ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 scale-[1.005]"
              : "border-[#0D0D0C]/[0.1] bg-[#FFFDFA] shadow-[0_8px_24px_rgba(0,0,0,0.03)]"
          }`}
        >
          {/* Column 2 Header */}
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
                    {sortedItems.length}
                  </span>
                </div>
                <span className="text-[11px] text-[#0D0D0C]/50">
                  Settled, paid, and reconciled
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-[#0D0D0C]/40 block font-medium">
                Cleared
              </span>
              <span className="text-sm font-semibold text-emerald-800">
                {formatCurrency(totalSortedSettled, currency)}
              </span>
            </div>
          </div>

          {/* Column 2 Items List */}
          <div className="flex-1 space-y-3">
            {sortedItems.length > 0 ? (
              sortedItems.map((item) => {
                const hasBudget = item.budget > 0;
                const isDragging = draggedCatId === item.category.id;

                return (
                  <div
                    key={item.category.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", item.category.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDraggedCatId(item.category.id);
                    }}
                    onDragEnd={() => setDraggedCatId(null)}
                    className={`group p-4 rounded-[20px] border transition-all duration-150 cursor-grab active:cursor-grabbing select-none ${
                      isDragging
                        ? "opacity-35 scale-[0.98] border-dashed border-emerald-600"
                        : "bg-[#FFFDFA] border-emerald-200/80 hover:border-emerald-400 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: Drag Handle + Category Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="text-[#0D0D0C]/30 group-hover:text-[#0D0D0C]/80 transition-colors shrink-0"
                          title="Drag back to left to mark as pending"
                        >
                          <GripVertical className="w-4 h-4 stroke-[2]" />
                        </div>

                        <div
                          className="w-9 h-9 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs"
                        >
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        </div>

                        <div className="min-w-0 truncate">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-medium text-[#0D0D0C] line-through opacity-70 truncate">
                              {item.category.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                              Paid ✓
                            </span>
                          </div>
                          <span className="text-[11px] text-[#0D0D0C]/50 block truncate">
                            {hasBudget
                              ? `${formatCurrency(item.budget, currency)} budget cleared`
                              : `${formatCurrency(item.spent, currency)} spent & settled`}
                          </span>
                        </div>
                      </div>

                      {/* Right: Settled amount + Move back button */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-[10px] text-emerald-700 block uppercase tracking-wide font-medium">
                            Settled
                          </span>
                          <span className="text-xs font-semibold text-[#0D0D0C]">
                            {hasBudget
                              ? formatCurrency(item.budget, currency)
                              : formatCurrency(item.spent, currency)}
                          </span>
                        </div>

                        {/* Move back to Left column */}
                        <button
                          type="button"
                          onClick={() => handleMoveItem(item.category.id, false)}
                          className="h-8 px-3 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-xs font-medium text-[#0D0D0C]/70 hover:border-[#0D0D0C] transition-all flex items-center gap-1 shadow-xs active:scale-95"
                          title="Move back to Not Sorted (Pending)"
                        >
                          <ArrowLeft className="w-3 h-3 stroke-[2]" />
                          <span className="hidden sm:inline">Unsort</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[20px] bg-[#FBF6EF]/50 border border-dashed border-[#0D0D0C]/[0.12] min-h-[300px]">
                <div className="w-12 h-12 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FFFDFA] text-[#0D0D0C]/40 flex items-center justify-center mb-3 shadow-xs">
                  <ArrowRight className="w-5 h-5 stroke-[1.8]" />
                </div>
                <h5 className="text-sm font-semibold text-[#0D0D0C] mb-1">
                  No Sorted Items Yet
                </h5>
                <p className="text-xs text-[#0D0D0C]/50 max-w-xs mb-3">
                  Drag items here from the left as you pay them off, or click the &quot;Sort →&quot; button.
                </p>
                <span className="px-3 py-1 rounded-full bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] text-[#0D0D0C]/60 text-[11px] font-medium">
                  0% Reconciled
                </span>
              </div>
            )}
          </div>

          {/* Bottom Drop Zone Hint */}
          <div className="mt-4 pt-3 border-t border-[#0D0D0C]/[0.06] text-center">
            <span className="text-[11px] text-emerald-800/60 font-medium">
              → Drag items here to reconcile and celebrate as sorted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

