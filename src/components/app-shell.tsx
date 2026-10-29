"use client";

import React, { useEffect } from "react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { Navbar } from "./navbar";
import { QuickAddModal } from "./quick-add-modal";
import { BudgetModal } from "./budget-modal";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { initStore, isLoaded } = useExpenseStore();

  useEffect(() => {
    initStore();
  }, [initStore]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12">
        {isLoaded ? (
          children
        ) : (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 rounded-full border-2 border-mint-500 border-t-transparent animate-spin" />
          </div>
        )}
      </main>
      <QuickAddModal />
      <BudgetModal />
    </div>
  );
}

