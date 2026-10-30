"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatMonthYear } from "@/lib/utils";

const CYCLING_ITEMS = [
  { word: "Track", layerClass: "gradient-layer-lemon" },
  { word: "Budget", layerClass: "gradient-layer-peach" },
  { word: "Analyze", layerClass: "gradient-layer-sage" },
  { word: "Save", layerClass: "gradient-layer-rose" },
];

export function HeroPanel() {
  const { selectedMonth, setQuickAddOpen, setBudgetModalOpen } = useExpenseStore();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % CYCLING_ITEMS.length);
    }, 1750);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full overflow-hidden border-b border-[#0D0D0C]/[0.08] min-h-[380px] sm:min-h-[420px] lg:min-h-[460px] flex flex-col justify-center">
      {/* 4 Stacked Gradient Layers with smooth cross-fade */}
      {CYCLING_ITEMS.map((item, idx) => (
        <div
          key={item.word}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out pointer-events-none ${item.layerClass}`}
          style={{ opacity: index === idx ? 1 : 0 }}
        />
      ))}

      {/* SVG Fine Grain Overlay inside the panel */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.18] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "140px 140px",
        }}
      />

      {/* Hero Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-10 sm:py-14 lg:py-16">
        <div className="max-w-5xl">
          {/* Huge tight grotesk headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-[88px] xl:text-[96px] font-medium leading-[0.86] tracking-[-0.032em] text-[#0D0D0C]">
            <span className="block h-[1.08em] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={CYCLING_ITEMS[index].word}
                  initial={{ opacity: 0, y: 32, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -32, filter: "blur(12px)" }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block"
                >
                  {CYCLING_ITEMS[index].word}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="block text-[#0D0D0C]">on your terms</span>
          </h1>

          {/* Editorial Caption and Actions */}
          <div className="mt-8 sm:mt-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-[#0D0D0C]/[0.08]">
            <p className="text-base sm:text-lg text-[#0D0D0C]/56 max-w-xl font-normal leading-relaxed">
              Mint Month is a minimal, privacy-first expense tracker. Organized by month with smart budgets, category breakdowns, and zero data leakage.
            </p>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setBudgetModalOpen(true)}
                className="btn-vela-outline px-4 py-2.5 text-xs font-medium"
              >
                Set {formatMonthYear(selectedMonth)} Budget
              </button>
              <button
                onClick={() => setQuickAddOpen(true)}
                className="h-12 px-6 rounded-full bg-[#0D0D0C] text-[#FFFDF8] hover:bg-[#0D0D0C]/90 text-sm font-medium flex items-center gap-2 active:scale-95 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 stroke-[2]" />
                <span>Add Expense</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

