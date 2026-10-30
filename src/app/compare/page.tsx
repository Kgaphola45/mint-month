"use client";

import React from "react";
import { MonthComparison } from "@/components/month-comparison";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatMonthYear } from "@/lib/utils";

export default function ComparePage() {
  const { selectedMonth } = useExpenseStore();

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 sm:py-10 space-y-8">
      <div className="pb-6 border-b border-[#0D0D0C]/[0.08]">
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#0D0D0C]">
          Analytics & Comparison
        </h1>
        <p className="text-sm text-[#0D0D0C]/56 mt-1">
          Deep spending patterns, cumulative burn-rate pace, day-of-week rhythm, and multi-month trajectories for {formatMonthYear(selectedMonth)}
        </p>
      </div>

      <MonthComparison />
    </div>
  );
}
