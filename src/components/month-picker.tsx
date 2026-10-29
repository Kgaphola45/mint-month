"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  RotateCcw,
} from "lucide-react";
import { format, subMonths, addMonths, parse } from "date-fns";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatMonthYear, getCurrentMonthStr } from "@/lib/utils";

export function MonthPicker() {
  const { selectedMonth, setSelectedMonth, goToPreviousMonth, goToNextMonth } =
    useExpenseStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentMonthStr = getCurrentMonthStr();
  const isCurrentMonth = selectedMonth === currentMonthStr;

  // Generate a list of recent months (e.g., past 12 months + next 3 months) for quick jump
  const quickMonths: string[] = [];
  const baseDate = new Date();
  for (let i = -12; i <= 3; i++) {
    const d = addMonths(baseDate, i);
    quickMonths.push(format(d, "yyyy-MM"));
  }

  return (
    <div className="relative flex items-center gap-1 sm:gap-2">
      <button
        onClick={goToPreviousMonth}
        className="p-1.5 sm:p-2 rounded-xl border border-border/50 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        title="Previous Month"
        aria-label="Previous Month"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-card border border-border/60 hover:border-mint-500/50 shadow-sm text-sm font-semibold text-foreground transition-all active:scale-[0.98]"
        >
          <CalendarIcon className="w-4 h-4 text-mint-500" />
          <span>{formatMonthYear(selectedMonth)}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            ▾
          </span>
        </button>

        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 z-50 w-64 p-2 bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-xl max-h-80 overflow-y-auto">
              <div className="text-[11px] font-semibold text-muted-foreground px-3 py-1 uppercase tracking-wider">
                Select Month
              </div>
              <div className="grid grid-cols-1 gap-0.5 mt-1">
                {quickMonths.map((m) => {
                  const isSelected = m === selectedMonth;
                  const isTodayMonth = m === currentMonthStr;

                  return (
                    <button
                      key={m}
                      onClick={() => {
                        setSelectedMonth(m);
                        setDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-xl transition-colors text-left ${isSelected
                          ? "bg-mint-500 text-white font-medium"
                          : "hover:bg-muted/70 text-foreground"
                        }`}
                    >
                      <span>{formatMonthYear(m)}</span>
                      {isTodayMonth && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold ${isSelected
                              ? "bg-white/20 text-white"
                              : "bg-mint-500/10 text-mint-600 dark:text-mint-400"
                            }`}
                        >
                          Current
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <button
        onClick={goToNextMonth}
        className="p-1.5 sm:p-2 rounded-xl border border-border/50 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        title="Next Month"
        aria-label="Next Month"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {!isCurrentMonth && (
        <button
          onClick={() => setSelectedMonth(currentMonthStr)}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-mint-500/10 text-mint-600 dark:text-mint-400 hover:bg-mint-500/20 transition-colors"
          title="Jump to current month"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Today</span>
        </button>
      )}
    </div>
  );
}
