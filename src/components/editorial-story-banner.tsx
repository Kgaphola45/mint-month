"use client";

import React, { useState, useEffect } from "react";
import { format, subMonths } from "date-fns";
import { Sparkles, ArrowRight, X, BookOpen } from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { getTodayDateStr } from "@/lib/utils";

export function EditorialStoryBanner() {
  const { setStoryModalOpen, setStoryMonth, storyMonth } = useExpenseStore();
  const [dismissed, setDismissed] = useState<boolean>(true);

  // Compute closed month (previous month)
  const now = new Date();
  const prevMonthDate = subMonths(now, 1);
  const closedMonth = format(prevMonthDate, "yyyy-MM");
  const closedMonthShort = format(prevMonthDate, "MMMM");
  const todayDay = now.getDate();

  useEffect(() => {
    // Show banner if within first 10 days of new month and not dismissed
    const storageKey = `mint_month_story_dismissed_${closedMonth}`;
    const isDismissed = localStorage.getItem(storageKey) === "true";

    // Show on early month days (e.g. 1st through 10th) or if not dismissed
    if (!isDismissed) {
      setDismissed(false);
    }
  }, [closedMonth]);

  if (dismissed) return null;

  const handleOpen = () => {
    setStoryMonth(closedMonth);
    setStoryModalOpen(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(`mint_month_story_dismissed_${closedMonth}`, "true");
    } catch {
      // ignore
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-300">
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-10 h-10 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FBF6EF] flex items-center justify-center text-[#0D0D0C] shrink-0 mt-0.5 sm:mt-0">
          <BookOpen className="w-5 h-5 stroke-[1.5]" />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-[#0D0D0C]" />
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#0D0D0C]/50">
              1st of the Month · Editorial Wrapped
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-medium text-[#0D0D0C]">
            Your {closedMonthShort} Financial Story is ready to review
          </h3>
          <p className="text-xs text-[#0D0D0C]/60 mt-0.5">
            A 3-slide editorial magazine review: budget verdict, category shifts, and payday readiness.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
        <button
          onClick={handleOpen}
          className="h-10 px-5 rounded-full bg-[#0D0D0C] hover:bg-[#0D0D0C]/90 text-[#FFFDFA] text-xs font-medium inline-flex items-center gap-2 transition-all shadow-sm active:scale-95"
        >
          <span>Read {closedMonthShort} Story</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleDismiss}
          className="w-9 h-9 rounded-full border border-[#0D0D0C]/[0.1] hover:bg-[#FBF6EF] text-[#0D0D0C]/50 hover:text-[#0D0D0C] flex items-center justify-center transition-colors"
          title="Dismiss notification"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>
      </div>
    </div>
  );
}

