"use client";

import React from "react";
import { ArrowLeftRight } from "lucide-react";
import { MonthComparison } from "@/components/month-comparison";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatMonthYear } from "@/lib/utils";

export default function ComparePage() {
  const { selectedMonth } = useExpenseStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
          <ArrowLeftRight className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Month Comparison & Trends
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Evaluating {formatMonthYear(selectedMonth)} against previous month and historical data
          </p>
        </div>
      </div>

      <MonthComparison />
    </div>
  );
}

