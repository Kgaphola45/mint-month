"use client";

import React from "react";
import dynamic from "next/dynamic";
import { BookOpen } from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatMonthYear } from "@/lib/utils";

const MonthComparison = dynamic(
  () => import("@/components/month-comparison").then((m) => m.MonthComparison),
  {
    ssr: false,
    loading: () => <div className="h-[480px] animate-pulse bg-black/5 rounded-2xl" />,
  }
);

export default function ComparePage() {
  const { selectedMonth, setStoryMonth, setStoryModalOpen } = useExpenseStore();

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 sm:py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#0D0D0C]/[0.08]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#0D0D0C]">
            Analytics & Comparison
          </h1>
          <p className="text-sm text-[#0D0D0C]/56 mt-1">
            Deep spending patterns, cumulative burn-rate pace, day-of-week rhythm, and multi-month trajectories for {formatMonthYear(selectedMonth)}
          </p>
        </div>

        <button
          onClick={() => {
            setStoryMonth(selectedMonth);
            setStoryModalOpen(true);
          }}
          className="h-11 px-5 rounded-full border border-[#0D0D0C]/[0.15] bg-[#FFFDFA] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-xs font-medium inline-flex items-center gap-2 transition-all text-[#0D0D0C] shadow-sm self-start sm:self-auto shrink-0 group"
          title="Open 3-slide editorial magazine story for this month"
        >
          <BookOpen className="w-4 h-4 stroke-[1.6] text-[#0D0D0C]/70 group-hover:text-[#FFFDFA]" />
          <span>Read Editorial Story</span>
        </button>
      </div>

      <MonthComparison />
    </div>
  );
}
