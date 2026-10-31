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
    <div className="relative flex items-center gap-1 sm:gap-2">
      <button
        onClick={goToPreviousMonth}
        className="p-2 rounded-full border border-[#0D0D0C]/[0.08] bg-[#FFFDFA] hover:bg-[#FFFDFA]/80 text-[#0D0D0C]/56 hover:text-[#0D0D0C] transition-colors active:scale-95 shadow-sm"
        title="Previous Month"
        aria-label="Previous Month"
      >
        <ChevronLeft className="w-3.5 h-3.5 stroke-[1.8]" />
      </button>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] hover:border-[#0D0D0C]/20 shadow-sm text-xs sm:text-sm font-medium text-[#0D0D0C] transition-all active:scale-[0.98]"
        >
          <CalendarIcon className="w-3.5 h-3.5 stroke-[1.5] text-[#0D0D0C]/60" />
          <span>{formatMonthYear(selectedMonth)}</span>
          <span className="text-[10px] text-[#0D0D0C]/42 ml-0.5">▾</span>
        </button>

        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 z-50 w-64 p-2 bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] rounded-[20px] shadow-2xl max-h-80 overflow-y-auto">
              <div className="text-[11px] font-normal text-[#0D0D0C]/42 px-3 py-1.5 uppercase tracking-wider">
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
                      className={`flex items-center justify-between w-full px-3.5 py-2 text-xs sm:text-sm rounded-full transition-colors text-left ${
                        isSelected
                          ? "bg-[#0D0D0C] text-[#FFFDFA] font-medium"
                          : "hover:bg-[#FBF6EF] text-[#0D0D0C]"
                      }`}
                    >
                      <span>{formatMonthYear(m)}</span>
                      {isTodayMonth && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
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

      <button
        onClick={goToNextMonth}
        className="p-2 rounded-full border border-[#0D0D0C]/[0.08] bg-[#FFFDFA] hover:bg-[#FFFDFA]/80 text-[#0D0D0C]/56 hover:text-[#0D0D0C] transition-colors active:scale-95 shadow-sm"
        title="Next Month"
        aria-label="Next Month"
      >
        <ChevronRight className="w-3.5 h-3.5 stroke-[1.8]" />
      </button>
    </div>
  );
}
