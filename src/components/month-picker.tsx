"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format, addMonths } from "date-fns";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatMonthYear, getCurrentMonthStr } from "@/lib/utils";

export function MonthPicker() {
  const { selectedMonth, setSelectedMonth, goToPreviousMonth, goToNextMonth } =
    useExpenseStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentMonthStr = getCurrentMonthStr();

  // Quick jump: past 12 months + next 3 months
  const quickMonths: string[] = [];
  const baseDate = new Date();
  for (let i = -12; i <= 3; i++) {
    const d = addMonths(baseDate, i);
    quickMonths.push(format(d, "yyyy-MM"));
  }

  return (
    <div className="relative flex items-center gap-1 sm:gap-1.5 shrink-0">
      {/* Small 32px circle previous button */}
      <button
        onClick={goToPreviousMonth}
        className="w-8 h-8 rounded-full border border-[#0D0D0C]/[0.08] bg-[#FFFDFA] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] flex items-center justify-center transition-all active:scale-95 shadow-sm text-[#0D0D0C]/70 shrink-0"
        title="Previous Month"
        aria-label="Previous Month"
      >
        <ChevronLeft className="w-3.5 h-3.5 stroke-[2]" />
      </button>

      {/* Compact Month Pill */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="h-8 px-2.5 sm:px-3 rounded-full bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] hover:border-[#0D0D0C]/25 shadow-sm text-xs font-medium text-[#0D0D0C] transition-all active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap"
          title="Select Month"
          aria-expanded={dropdownOpen}
        >
          <CalendarIcon className="w-3 h-3 stroke-[1.8] text-[#0D0D0C]/50" />
          <span>{formatMonthYear(selectedMonth)}</span>
          <span className="text-[9px] text-[#0D0D0C]/40">▾</span>
        </button>

        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 mt-2 z-50 w-60 p-2 bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] rounded-[20px] shadow-2xl max-h-80 overflow-y-auto">
              <div className="text-[10px] font-medium text-[#0D0D0C]/40 px-3 py-1.5 uppercase tracking-wider">
                Select Month
              </div>
              <div className="grid grid-cols-1 gap-0.5 mt-0.5">
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
                      className={`flex items-center justify-between w-full px-3 py-1.5 text-xs rounded-full transition-colors text-left ${
                        isSelected
                          ? "bg-[#0D0D0C] text-[#FFFDFA] font-medium shadow-sm"
                          : "hover:bg-[#FBF6EF] text-[#0D0D0C]"
                      }`}
                    >
                      <span>{formatMonthYear(m)}</span>
                      {isTodayMonth && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-[#0D0D0C]/[0.06] text-[#0D0D0C]/60"
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

      {/* Small 32px circle next button */}
      <button
        onClick={goToNextMonth}
        className="w-8 h-8 rounded-full border border-[#0D0D0C]/[0.08] bg-[#FFFDFA] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] flex items-center justify-center transition-all active:scale-95 shadow-sm text-[#0D0D0C]/70 shrink-0"
        title="Next Month"
        aria-label="Next Month"
      >
        <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
      </button>
    </div>
  );
}
