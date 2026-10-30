"use client";

import React from "react";
import { MonthComparison } from "@/components/month-comparison";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatMonthYear } from "@/lib/utils";

export default function ComparePage() {
  const { selectedMonth } = useExpenseStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <div className="pb-6 border-b border-[#0D0D0C]/[0.08]">
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#0D0D0C]">
          Month Comparison & Trends
        </h1>
        <p className="text-sm text-[#0D0D0C]/56 mt-1">
          Evaluating {formatMonthYear(selectedMonth)} against previous month and multi-month trajectories
        </p>
      </div>

      <MonthComparison />
    </div>
  );
}
