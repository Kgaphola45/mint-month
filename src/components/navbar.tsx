"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  ArrowLeftRight,
  Settings,
  Plus,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { MonthPicker } from "./month-picker";
import { UserMenu } from "./user-menu";
import { useExpenseStore } from "@/store/useExpenseStore";
import { CURRENCIES } from "@/lib/currencies";

export function Navbar() {
  const pathname = usePathname();
  const {
    setQuickAddOpen,
    setSimulatorModalOpen,
    setStoryModalOpen,
    currency,
  } = useExpenseStore();
  const currentCurrency = CURRENCIES[currency] || CURRENCIES.ZAR;

  // Global keyboard shortcuts:
  // - Cmd/Ctrl + K or 'n': Quick Add
  // - 'a': Purchase Simulator
  // - 'w': Editorial Story (Monthly Wrapped)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName);

      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "n" && !isInput && !e.metaKey && !e.ctrlKey)
      ) {
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
  }, [setQuickAddOpen, setSimulatorModalOpen, setStoryModalOpen]);

  const navLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: Receipt },
    { href: "/budgets", label: "Budgets", icon: PiggyBank },
    { href: "/compare", label: "Analytics", icon: ArrowLeftRight },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* 80px tall Header with Hairline Border */}
      <header className="sticky top-0 z-30 w-full h-20 border-b border-[#0D0D0C]/[0.08] bg-[#FBF6EF]/85 backdrop-blur-md transition-colors flex items-center">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 flex items-center justify-between gap-4">
          {/* Brand: 13px black dot + "mint month" Inter Tight 600 */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="w-[13px] h-[13px] rounded-full bg-[#0D0D0C] shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-xl sm:text-[22px] tracking-[-0.02em] text-[#0D0D0C]">
                mint month
              </span>
            </Link>

            {/* Desktop Pill Navigation (rounded full, not boxy) */}
            <nav className="hidden lg:flex items-center gap-1 bg-[#FFFDFA] p-1.5 rounded-full border border-[#0D0D0C]/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#0D0D0C] text-[#FFFDFA] shadow-sm"
                        : "text-[#0D0D0C]/56 hover:text-[#0D0D0C] hover:bg-[#0D0D0C]/[0.04]"
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Central Month Switcher (pill style) */}
          <div className="flex items-center justify-center">
            <MonthPicker />
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Outlined Currency Pill */}
            <Link
              href="/settings"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#FFFDFA] hover:bg-[#FFFDFA]/80 text-[#0D0D0C] border border-[#0D0D0C]/[0.12] transition-colors shadow-sm"
              title="Change Currency in Settings"
            >
              <span className="font-medium text-[#0D0D0C]">{currentCurrency.symbol}</span>
              <span className="text-[11px] text-[#0D0D0C]/56">{currentCurrency.code}</span>
            </Link>

            {/* Monthly Editorial Story / Wrapped Pill */}
            <button
              onClick={() => setStoryModalOpen(true)}
              className="hidden xl:flex items-center gap-1.5 h-12 px-4 rounded-full border border-[#0D0D0C]/[0.15] bg-[#FFFDFA] hover:bg-[#FBF6EF] text-xs font-medium text-[#0D0D0C] shadow-sm transition-all"
              title="Monthly Editorial Story Review (Hotkey: W)"
            >
              <BookOpen className="w-4 h-4 text-[#0D0D0C]/70" />
              <span>Editorial Story</span>
              <kbd className="ml-1 text-[10px] font-mono bg-[#0D0D0C]/[0.06] px-1.5 py-0.5 rounded text-[#0D0D0C]/60">W</kbd>
            </button>

            {/* "Can I Afford It?" Purchase Simulator Pill */}
            <button
              onClick={() => setSimulatorModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 h-12 px-4 rounded-full border border-[#0D0D0C]/[0.15] bg-[#FFFDFA] hover:bg-[#FBF6EF] text-xs font-medium text-[#0D0D0C] shadow-sm transition-all"
              title="Purchase Decision Simulator (Hotkey: A)"
            >
              <Sparkles className="w-4 h-4 text-[#0D0D0C]/70" />
              <span>Can I Afford It?</span>
              <kbd className="ml-1 text-[10px] font-mono bg-[#0D0D0C]/[0.06] px-1.5 py-0.5 rounded text-[#0D0D0C]/60">A</kbd>
            </button>

            {/* User Profile / Account Switcher Menu */}
            <UserMenu />

            {/* Add Expense Button: 48px tall, 999px radius, black ink #0D0D0C, white text */}
            <button
              onClick={() => setQuickAddOpen(true)}
              className="h-12 px-5 sm:px-6 rounded-full bg-[#0D0D0C] hover:bg-[#0D0D0C]/90 active:scale-95 text-[#FFFDFA] font-medium text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2]" />
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
      </div>
    </>
  );
}
