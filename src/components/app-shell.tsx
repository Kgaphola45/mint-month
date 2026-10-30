"use client";

import React, { useEffect } from "react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { Navbar } from "./navbar";
import { QuickAddModal } from "./quick-add-modal";
import { BudgetModal } from "./budget-modal";
import { DebtModal } from "./debt-modal";
import { PaydayModal } from "./payday-modal";
import { AuthModal } from "./auth-modal";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { initStore, isLoaded } = useExpenseStore();

  useEffect(() => {
    initStore();
  }, [initStore]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF6EF] text-[#0D0D0C] relative selection:bg-[#0D0D0C]/10 selection:text-[#0D0D0C]">
      {/* Fine SVG fractal noise grain overlay */}
      <div className="fine-grain-overlay" aria-hidden="true" />

      {/* 80px tall hairline navbar */}
      <Navbar />

      <main className="flex-1 w-full pb-24 lg:pb-16">
        {isLoaded ? (
          children
        ) : (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 rounded-full border-2 border-[#0D0D0C] border-t-transparent animate-spin" />
          </div>
        )}
      </main>

      <QuickAddModal />
      <BudgetModal />
      <DebtModal />
      <PaydayModal />
    </div>
  );
}
