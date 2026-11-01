"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  ArrowLeftRight,
  Plus,
  Sparkles,
  Search,
  Command,
} from "lucide-react";
import { MonthPicker } from "./month-picker";
import { UserMenu } from "./user-menu";
import { useExpenseStore } from "@/store/useExpenseStore";

export function Navbar() {
  const pathname = usePathname();
  const {
    setQuickAddOpen,
    setSimulatorModalOpen,
    setStoryModalOpen,
    setCommandPaletteOpen,
  } = useExpenseStore();

  // Global keyboard shortcuts:
  // - Cmd/Ctrl + K: Linear Command Palette
  // - 'n': Quick Add Expense
  // - 'a': Purchase Simulator
  // - 'w': Editorial Story (Monthly Wrapped)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName);

      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      } else if (e.key === "n" && !isInput && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setQuickAddOpen(true);
      } else if (
        (e.key === "a" || e.key === "A") &&
        !isInput &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        e.preventDefault();
        setSimulatorModalOpen(true);
      } else if (
        (e.key === "w" || e.key === "W") &&
        !isInput &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        e.preventDefault();
        setStoryModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setQuickAddOpen, setSimulatorModalOpen, setStoryModalOpen, setCommandPaletteOpen]);

  // Center pill navigation with ONLY 4 items (Settings moved to User Menu)
  const navLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: Receipt },
    { href: "/budgets", label: "Budgets", icon: PiggyBank },
    { href: "/compare", label: "Analytics", icon: ArrowLeftRight },
  ];

  return (
    <>
      {/* 80px tall Header with Hairline Border, Vela style */}
      <header className="sticky top-0 z-30 w-full h-20 border-b border-[#0D0D0C]/[0.08] bg-[#FBF6EF]/90 backdrop-blur-md flex items-center overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 max-w-full overflow-hidden">
          {/* ZONE 1 (Left): dot + "mint month" in one line, 20px, 600 weight */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="w-3 h-3 rounded-full bg-[#0D0D0C] shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-[20px] tracking-[-0.02em] text-[#0D0D0C] whitespace-nowrap">
                mint month
              </span>
            </Link>
          </div>

          {/* ZONE 2 (Center): pill with only 4 items - hidden on mobile, lg:flex */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#FFFDFA] p-1 rounded-full border border-[#0D0D0C]/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.02)] shrink-0">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#0D0D0C] text-[#FFFDFA] shadow-sm"
                      : "text-[#0D0D0C]/60 hover:text-[#0D0D0C] hover:bg-[#0D0D0C]/[0.04]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ZONE 3 (Right): 
              1. Compact month switcher (‹ Nov 2026 › with 32px circle buttons)
              2. Commands as ⌘K pill
              3. Can I Afford It as 36px icon-only button with A tooltip
              4. ONE auth button (Sign In only if logged out, avatar if logged in)
              5. Black primary Add Expense pill */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* 1. Compact Month Switcher */}
            <MonthPicker />

            {/* 2. Commands as ⌘K pill */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="h-9 px-2.5 sm:px-3 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FFFDFA] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-xs font-medium inline-flex items-center gap-1.5 transition-all text-[#0D0D0C] shadow-sm shrink-0"
              title="Commands (⌘K / Ctrl+K)"
              aria-label="Commands"
            >
              <Command className="w-3.5 h-3.5 stroke-[1.8]" />
              <span className="font-mono text-[11px] font-normal">⌘K</span>
            </button>

            {/* 3. Can I Afford It as 36px icon-only button with A hotkey tooltip */}
            <button
              onClick={() => setSimulatorModalOpen(true)}
              className="w-9 h-9 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FFFDFA] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] flex items-center justify-center transition-all text-[#0D0D0C] shadow-sm shrink-0"
              title="Can I Afford It? (Press A)"
              aria-label="Can I Afford It?"
            >
              <Sparkles className="w-4 h-4 stroke-[1.5]" />
            </button>

            {/* 4. ONE auth button: Sign In only if logged out, avatar if logged in */}
            <UserMenu />

            {/* 5. Black primary Add Expense pill */}
            <button
              onClick={() => setQuickAddOpen(true)}
              className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-full bg-[#0D0D0C] hover:bg-[#0D0D0C]/90 active:scale-95 text-[#FFFDFA] font-medium text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5 shrink-0"
              title="Add Expense (Press N)"
              aria-label="Add Expense"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Expense</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Floating Pill Navigation */}
      <div className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-[#FFFDFA]/95 backdrop-blur-xl border border-[#0D0D0C]/[0.1] rounded-full p-1.5 shadow-xl flex items-center gap-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`p-2.5 rounded-full transition-all ${
                isActive
                  ? "bg-[#0D0D0C] text-[#FFFDFA]"
                  : "text-[#0D0D0C]/56 hover:text-[#0D0D0C]"
              }`}
              title={link.label}
            >
              <Icon className="w-4 h-4 stroke-[1.8]" />
            </Link>
          );
        })}

        {/* Mobile Command Palette Button */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="p-2.5 rounded-full text-[#0D0D0C]/56 hover:text-[#0D0D0C] hover:bg-[#0D0D0C]/[0.05] transition-all"
          title="Open Command Palette"
        >
          <Search className="w-4 h-4 stroke-[1.8]" />
        </button>
      </div>
    </>
  );
}
