"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { toPng } from "html-to-image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  Sparkles,
  Calendar,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Lock,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Share2,
  FileText,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency, formatMonthYear } from "@/lib/utils";
import { CURRENCIES } from "@/lib/currencies";
import { CategoryIcon } from "./category-icon";

export function EditorialStoryModal() {
  const {
    storyModalOpen,
    setStoryModalOpen,
    storyMonth,
    setStoryMonth,
    getEditorialStory,
    getHistoricalTrends,
    currency,
  } = useExpenseStore();

  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string>("");

  const slideRef = useRef<HTMLDivElement>(null);
  const currentCurrency = CURRENCIES[currency] || CURRENCIES.ZAR;

  const story = getEditorialStory(storyMonth);
  const trends = getHistoricalTrends(6);

  // Keyboard navigation: ArrowLeft, ArrowRight, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!storyModalOpen) return;

      if (e.key === "Escape") {
        setStoryModalOpen(false);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(2, prev + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [storyModalOpen, setStoryModalOpen]);

  // Reset to first slide when modal opens or month changes
  useEffect(() => {
    if (storyModalOpen) {
      setCurrentSlide(0);
    }
  }, [storyModalOpen, storyMonth]);

  if (!storyModalOpen) return null;

  const handleNext = () => {
    if (currentSlide < 2) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#0D0D0C", "#96CE96", "#F99654"],
        });
      } catch {
        // ignore
      }
      setStoryModalOpen(false);
    }
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  // Export current slide as high-resolution PNG image
  const handleExportPNG = async () => {
    if (!slideRef.current) return;
    try {
      setIsExporting(true);
      setExportNotice("Rendering publication-grade image...");

      const dataUrl = await toPng(slideRef.current, {
        quality: 0.98,
        pixelRatio: 2.5,
        backgroundColor: "#FBF6EF",
      });

      const link = document.createElement("a");
      link.download = `mint-month-${story.targetMonth}-slide-${currentSlide + 1}.png`;
      link.href = dataUrl;
      link.click();

      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }

      setExportNotice("Image saved!");
      setTimeout(() => setExportNotice(""), 3000);
    } catch (err) {
      console.error("Export error", err);
      setExportNotice("Export failed. Please try print to PDF.");
      setTimeout(() => setExportNotice(""), 3500);
    } finally {
      setIsExporting(false);
    }
  };

  // Native publication-grade browser print to PDF
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0D0D0C]/55 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.12] rounded-[32px] p-6 sm:p-10 shadow-[0_24px_64px_rgba(0,0,0,0.18)] flex flex-col max-h-[95vh] overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fine Grain Texture */}
        <div className="fine-grain-overlay opacity-15 pointer-events-none" aria-hidden="true" />

        {/* Top Story Header & Month Switcher */}
        <div className="flex items-center justify-between gap-3 pb-5 border-b border-[#0D0D0C]/[0.08] relative z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D0D0C]" />
            <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#0D0D0C]/60">
              Monthly Editorial Story
            </span>

            {/* Closed Month Selector */}
            <select
              value={storyMonth}
              onChange={(e) => setStoryMonth(e.target.value)}
              className="ml-1 text-xs font-medium px-3 py-1 rounded-full bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] text-[#0D0D0C] focus:outline-none cursor-pointer hover:border-[#0D0D0C]/30"
              title="Select closed month to review"
            >
              {trends.map((t) => (
                <option key={t.month} value={t.month}>
                  {formatMonthYear(t.month)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Buttons */}
            <button
              onClick={handleExportPNG}
              disabled={isExporting}
              className="h-8 px-3 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FFFDFA] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-xs font-medium inline-flex items-center gap-1.5 transition-all text-[#0D0D0C] shadow-sm disabled:opacity-50"
              title="Download publication-grade PNG image"
            >
              <Download className="w-3.5 h-3.5 stroke-[1.6]" />
              <span className="hidden sm:inline">Export Image</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="h-8 px-3 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FFFDFA] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-xs font-medium inline-flex items-center gap-1.5 transition-all text-[#0D0D0C] shadow-sm"
              title="Print or Save as PDF Report"
            >
              <Printer className="w-3.5 h-3.5 stroke-[1.6]" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => setStoryModalOpen(false)}
              className="w-8 h-8 rounded-full border border-[#0D0D0C]/[0.1] flex items-center justify-center text-[#0D0D0C]/60 hover:text-[#0D0D0C] hover:bg-[#FFFDFA] transition-colors"
              aria-label="Close Story"
            >
              <X className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* 3-Slide Segmented Story Progress Bar (Instagram / Vogue Style) */}
        <div className="grid grid-cols-3 gap-2 py-4 relative z-10 shrink-0">
          {[0, 1, 2].map((idx) => {
            const labels = ["1. The Verdict", "2. Category Shifts", "3. Payday Readiness"];
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className="group flex flex-col gap-1 text-left"
              >
                <div className="w-full h-1.5 rounded-full bg-[#0D0D0C]/[0.1] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      idx === currentSlide
                        ? "bg-[#0D0D0C] w-full"
                        : idx < currentSlide
                        ? "bg-[#0D0D0C]/60 w-full"
                        : "w-0"
                    }`}
                  />
                </div>
                <span
                  className={`text-[11px] font-medium transition-colors ${
                    idx === currentSlide
                      ? "text-[#0D0D0C]"
                      : "text-[#0D0D0C]/40 group-hover:text-[#0D0D0C]/70"
                  }`}
                >
                  {labels[idx]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Export Status Banner */}
        {exportNotice && (
          <div className="mb-2 px-3 py-1.5 rounded-full bg-[#DFE9D4] text-[#0D0D0C] text-xs font-medium self-center animate-in fade-in">
            {exportNotice}
          </div>
        )}

        {/* Main Printable / Exportable Slide Canvas */}
        <div className="flex-1 overflow-y-auto pr-1 py-1 relative z-10">
          <div
            ref={slideRef}
            className="p-6 sm:p-8 rounded-[28px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-6"
          >
            {/* ========================================================
                SLIDE 1: THE VERDICT
               ======================================================== */}
            {currentSlide === 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
                {/* Editorial Masthead Tag */}
                <div className="flex items-center justify-between gap-2 border-b border-[#0D0D0C]/[0.06] pb-3">
                  <span className="text-[11px] uppercase tracking-[0.1em] font-medium text-[#0D0D0C]/50">
                    EDITION № {story.targetMonth.slice(5)} · FINANCIAL VERDICT
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#DFE9D4] text-[#0D0D0C] text-[11px] font-medium">
                    {story.verdict.editorialBadge}
                  </span>
                </div>

                {/* Big Story Headline (Editorial quote style) */}
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-[#0D0D0C] leading-[1.25]">
                    &ldquo;{story.verdict.headline}&rdquo;
                  </h2>
                  <p className="text-xs sm:text-sm text-[#0D0D0C]/60 leading-relaxed max-w-2xl">
                    {story.verdict.subheadline}
                  </p>
                </div>

                {/* 4 Editorial Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {/* Metric 1: Total Outflow */}
                  <div className="p-4 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
                    <span className="text-[11px] uppercase tracking-wider text-[#0D0D0C]/50 font-medium block">
                      Total Outflow
                    </span>
                    <div className="text-xl sm:text-2xl font-medium tracking-tight text-[#0D0D0C] mt-1">
                      {formatCurrency(story.verdict.totalSpent, currency)}
                    </div>
                    <span className="text-[11px] text-[#0D0D0C]/50 mt-0.5 block">
                      Target: {formatCurrency(story.verdict.totalBudget, currency)}
                    </span>
                  </div>

                  {/* Metric 2: Surplus Cushion */}
                  <div className="p-4 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
                    <span className="text-[11px] uppercase tracking-wider text-[#0D0D0C]/50 font-medium block">
                      Preserved Buffer
                    </span>
                    <div
                      className={`text-xl sm:text-2xl font-medium tracking-tight mt-1 ${
                        story.verdict.isUnderBudget ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {story.verdict.diffAmount >= 0 ? "+" : "-"}
                      {formatCurrency(Math.abs(story.verdict.diffAmount), currency)}
                    </div>
                    <span className="text-[11px] text-[#0D0D0C]/50 mt-0.5 block">
                      {story.verdict.isUnderBudget ? "Safe-to-spend surplus" : "Over planned limit"}
                    </span>
                  </div>

                  {/* Metric 3: No-Spend Days */}
                  <div className="p-4 rounded-[20px] bg-[#DFE9D4]/50 border border-[#0D0D0C]/[0.06]">
                    <span className="text-[11px] uppercase tracking-wider text-[#0D0D0C]/60 font-medium block">
                      No-Spend Days
                    </span>
                    <div className="text-xl sm:text-2xl font-medium tracking-tight text-[#0D0D0C] mt-1">
                      {story.verdict.noSpendDaysCount}{" "}
                      <span className="text-xs font-normal text-[#0D0D0C]/50">
                        / {story.verdict.totalDaysInMonth}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#0D0D0C]/60 mt-0.5 block">
                      Zero discretionary spent
                    </span>
                  </div>

                  {/* Metric 4: Daily Pace */}
                  <div className="p-4 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
                    <span className="text-[11px] uppercase tracking-wider text-[#0D0D0C]/50 font-medium block">
                      Daily Pace
                    </span>
                    <div className="text-xl sm:text-2xl font-medium tracking-tight text-[#0D0D0C] mt-1">
                      {formatCurrency(story.verdict.dailyAverage, currency)}
                    </div>
                    <span className="text-[11px] text-[#0D0D0C]/50 mt-0.5 block">
                      Average per calendar day
                    </span>
                  </div>
                </div>

                {/* Calendar Rhythm: No-Spend Days Visual */}
                <div className="p-4 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-[#0D0D0C]/60">
                    <span className="font-medium text-[#0D0D0C]">
                      31-Day Financial Rhythm & No-Spend Clusters
                    </span>
                    <span>
                      {story.verdict.noSpendDaysCount} quiet days ·{" "}
                      {story.verdict.totalDaysInMonth - story.verdict.noSpendDaysCount} spend days
                    </span>
                  </div>

                  {/* Mini Calendar Dots */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {Array.from({ length: story.verdict.totalDaysInMonth }, (_, i) => i + 1).map(
                      (d) => {
                        const isNoSpend = story.verdict.noSpendDaysList.includes(d);
                        const isPeak = story.verdict.peakDay?.day === d;
                        return (
                          <div
                            key={d}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono transition-transform hover:scale-110 ${
                              isPeak
                                ? "bg-[#F99654] text-[#FFFDFA] font-bold shadow-sm"
                                : isNoSpend
                                ? "bg-[#DFE9D4] text-[#0D0D0C] font-semibold"
                                : "bg-[#0D0D0C]/[0.08] text-[#0D0D0C]/70"
                            }`}
                            title={
                              isPeak
                                ? `Day ${d}: Peak spend ${formatCurrency(
                                    story.verdict.peakDay?.amount || 0,
                                    currency
                                  )} (${story.verdict.peakDay?.topItem})`
                                : isNoSpend
                                ? `Day ${d}: Zero spend logged`
                                : `Day ${d}: Active spending`
                            }
                          >
                            {d}
                          </div>
                        );
                      }
                    )}
                  </div>

                  {story.verdict.peakDay && (
                    <p className="text-[11px] text-[#0D0D0C]/50 pt-1">
                      Highest single outlay was on the <strong>{story.verdict.peakDay.day}th</strong> (
                      {formatCurrency(story.verdict.peakDay.amount, currency)} ·{" "}
                      {story.verdict.peakDay.topItem || "Outlay"}).
                    </p>
                  )}
                </div>

                {/* Editorial Seal Callout */}
                <div className="flex items-center justify-between gap-4 p-4 rounded-[18px] bg-[#F2ECDF]/70 border border-[#0D0D0C]/[0.06] text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0D0D0C] shrink-0" />
                    <span className="text-[#0D0D0C]/75">
                      <strong>Audit Verdict:</strong> Your closed month met all liquidity conditions
                      with strong discretionary restraint.
                    </span>
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#0D0D0C]/50 shrink-0 font-medium">
                    {story.verdict.editorialSeal}
                  </span>
                </div>
              </div>
            )}

            {/* ========================================================
                SLIDE 2: CATEGORY SHIFTS
               ======================================================== */}
            {currentSlide === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
                {/* Editorial Masthead Tag */}
                <div className="flex items-center justify-between gap-2 border-b border-[#0D0D0C]/[0.06] pb-3">
                  <span className="text-[11px] uppercase tracking-[0.1em] font-medium text-[#0D0D0C]/50">
                    EDITION № {story.targetMonth.slice(5)} · CATEGORY SHIFTS
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F8DCC7] text-[#0D0D0C] text-[11px] font-medium">
                    Month-Over-Month Dynamics
                  </span>
                </div>

                {/* Big Story Headline */}
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-[#0D0D0C] leading-[1.25]">
                    &ldquo;{story.categories.headline}&rdquo;
                  </h2>
                  <p className="text-xs sm:text-sm text-[#0D0D0C]/60 leading-relaxed max-w-2xl">
                    {story.categories.subheadline}
                  </p>
                </div>

                {/* Top 2 Spotlight Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Spotlight 1: Highest Outflow */}
                  {story.categories.highestCategory && (
                    <div className="p-5 rounded-[22px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wider text-[#0D0D0C]/50 font-medium">
                          #1 Outflow Category
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-[10px] font-semibold">
                          {story.categories.highestCategory.percentage}% of all spend
                        </span>
                      </div>
                      <div className="text-2xl font-medium tracking-tight text-[#0D0D0C]">
                        {story.categories.highestCategory.name}
                      </div>
                      <div className="text-lg font-medium text-[#0D0D0C]/80">
                        {formatCurrency(story.categories.highestCategory.amount, currency)}
                      </div>
                      <p className="text-[11px] text-[#0D0D0C]/50">
                        Represented the primary volume driver across essential living costs.
                      </p>
                    </div>
                  )}

                  {/* Spotlight 2: Smartest Drop / Savings */}
                  {story.categories.biggestDropCategory ? (
                    <div className="p-5 rounded-[22px] bg-[#DFE9D4]/60 border border-[#0D0D0C]/[0.06] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wider text-[#0D0D0C]/60 font-medium">
                          Smartest Pullback
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-[10px] font-semibold">
                          -{story.categories.biggestDropCategory.dropPercent}% drop
                        </span>
                      </div>
                      <div className="text-2xl font-medium tracking-tight text-[#0D0D0C]">
                        {story.categories.biggestDropCategory.name}
                      </div>
                      <div className="text-lg font-medium text-emerald-800">
                        {formatCurrency(
                          story.categories.biggestDropCategory.savingsAmount,
                          currency
                        )}{" "}
                        saved vs {story.priorMonthShort}
                      </div>
                      <p className="text-[11px] text-[#0D0D0C]/60">
                        Strategic tightening here unlocked cashflow cushion for other priorities.
                      </p>
                    </div>
                  ) : (
                    <div className="p-5 rounded-[22px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] space-y-2">
                      <span className="text-[11px] uppercase tracking-wider text-[#0D0D0C]/50 font-medium">
                        Consistency Score
                      </span>
                      <div className="text-2xl font-medium tracking-tight text-[#0D0D0C]">
                        Equally Balanced
                      </div>
                      <p className="text-xs text-[#0D0D0C]/60">
                        Spending stayed stable without impulsive surges across major lines.
                      </p>
                    </div>
                  )}
                </div>

                {/* Category Spectrum Bar & Ranking */}
                <div className="p-5 rounded-[22px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#0D0D0C]/60 font-medium">
                    <span>Ranked Category Distribution</span>
                    <span>Outflow Share & Delta</span>
                  </div>

                  <div className="space-y-2.5">
                    {story.categories.topCategories.map((cat) => (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="font-medium text-[#0D0D0C]">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#0D0D0C]">
                              {formatCurrency(cat.amount, currency)}
                            </span>
                            <span className="text-[11px] text-[#0D0D0C]/50">
                              ({cat.percentage}%)
                            </span>
                            {cat.priorAmount > 0 && (
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                  cat.isDecrease
                                    ? "bg-[#DFE9D4] text-emerald-800"
                                    : "bg-[#F8DCC7] text-orange-900"
                                }`}
                              >
                                {cat.changePercent > 0 ? `+${cat.changePercent}%` : `${cat.changePercent}%`}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 rounded-full bg-[#0D0D0C]/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, cat.percentage)}%`,
                              backgroundColor: cat.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                SLIDE 3: PAYDAY READINESS & CASHFLOW RESILIENCE
               ======================================================== */}
            {currentSlide === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
                {/* Editorial Masthead Tag */}
                <div className="flex items-center justify-between gap-2 border-b border-[#0D0D0C]/[0.06] pb-3">
                  <span className="text-[11px] uppercase tracking-[0.1em] font-medium text-[#0D0D0C]/50">
                    EDITION № {story.targetMonth.slice(5)} · CASHFLOW RESILIENCE
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#ECD6E2] text-[#0D0D0C] text-[11px] font-medium">
                    Debt Paydown & Readiness
                  </span>
                </div>

                {/* Big Story Headline */}
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-[#0D0D0C] leading-[1.25]">
                    &ldquo;{story.readiness.headline}&rdquo;
                  </h2>
                  <p className="text-xs sm:text-sm text-[#0D0D0C]/60 leading-relaxed max-w-2xl">
                    {story.readiness.subheadline}
                  </p>
                </div>

                {/* 3 High-Impact Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Card 1: Debit Orders Cleared */}
                  <div className="p-4 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] space-y-1">
                    <div className="flex items-center justify-between text-xs text-[#0D0D0C]/50 mb-1">
                      <span>Debit Orders Cleared</span>
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-2xl font-medium tracking-tight text-[#0D0D0C]">
                      {story.readiness.debitOrdersCleared}{" "}
                      <span className="text-xs font-normal text-[#0D0D0C]/50">on time</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-medium block">
                      100% contract fulfillment
                    </span>
                  </div>

                  {/* Card 2: Debt Principal Saved */}
                  <div className="p-4 rounded-[20px] bg-[#DFE9D4]/50 border border-[#0D0D0C]/[0.06] space-y-1">
                    <div className="flex items-center justify-between text-xs text-[#0D0D0C]/60 mb-1">
                      <span>Principal Paydown</span>
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-2xl font-medium tracking-tight text-[#0D0D0C]">
                      {formatCurrency(story.readiness.debtPaidDownAmount, currency)}
                    </div>
                    <span className="text-[11px] text-[#0D0D0C]/60 block">
                      Across active financing plans
                    </span>
                  </div>

                  {/* Card 3: Surplus Cushion */}
                  <div className="p-4 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] space-y-1">
                    <div className="flex items-center justify-between text-xs text-[#0D0D0C]/50 mb-1">
                      <span>Carried Forward</span>
                      <Wallet className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-2xl font-medium tracking-tight text-[#0D0D0C]">
                      {formatCurrency(story.readiness.surplusCarriedForward, currency)}
                    </div>
                    <span className="text-[11px] text-[#0D0D0C]/50 block">
                      Guilt-free runway preserved
                    </span>
                  </div>
                </div>

                {/* Active Contracts Progress */}
                {story.readiness.activeDebts.length > 0 && (
                  <div className="p-4 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#0D0D0C]/60 font-medium">
                      <span>Active Contracts Repaid This Cycle</span>
                      <span>Countdown to Freedom</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {story.readiness.activeDebts.slice(0, 4).map((debt, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-[14px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.06] flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-[#0D0D0C]">{debt.name}</div>
                            <div className="text-[11px] text-[#0D0D0C]/50">
                              {formatCurrency(debt.monthlyAmount, currency)}/mo
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-[#0D0D0C]/[0.06] text-[#0D0D0C] text-[10px] font-mono">
                            {debt.remainingMonths} mos left
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Editorial Closing Quote & Signature */}
                <div className="p-5 rounded-[22px] bg-[#F2ECDF]/80 border border-[#0D0D0C]/[0.08] space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0D0D0C]" />
                    <span className="text-xs uppercase tracking-[0.06em] font-semibold text-[#0D0D0C]">
                      Editorial Outlook for {story.nextMonthShort}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#0D0D0C]/80 italic leading-relaxed">
                    &ldquo;{story.readiness.closingQuote}&rdquo;
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#0D0D0C]/[0.08] text-[11px] text-[#0D0D0C]/50">
                    <span>MINT MONTH EDITORIAL TREASURY</span>
                    <span>ISSUE · {story.targetMonth}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Carousel Navigation Controls */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#0D0D0C]/[0.08] relative z-10 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className="h-10 px-4 rounded-full border border-[#0D0D0C]/[0.15] bg-[#FFFDFA] hover:bg-[#FBF6EF] text-xs font-medium text-[#0D0D0C] transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Slide Dots */}
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentSlide
                    ? "bg-[#0D0D0C] scale-125"
                    : "bg-[#0D0D0C]/20 hover:bg-[#0D0D0C]/40"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="h-10 px-5 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>{currentSlide === 2 ? "Complete Review" : "Next Slide"}</span>
            {currentSlide === 2 ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
