"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  ArrowLeftRight,
  Plus,
  Sparkles,
  Command,
  Menu,
  X,
  Settings,
  ChevronRight,
} from "lucide-react";
import { MonthPicker } from "../month-picker";
import { UserMenu } from "../user-menu";
import { useExpenseStore } from "@/store/useExpenseStore";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    setQuickAddOpen,
    setSimulatorModalOpen,
    setStoryModalOpen,
    setCommandPaletteOpen,
  } = useExpenseStore();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Global keyboard shortcuts
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

  // Center pill navigation with ONLY 4 items (Settings moved to User Menu & Mobile Drawer)
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
        <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 max-w-full">
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
              1. Compact month switcher (‹ Nov 2026 ›)
              2. Commands as icon button
              3. Can I Afford It as 36px icon-only button
              4. ONE auth button (Sign In / Avatar)
              5. Black primary Add Expense pill
              6. Mobile hamburger toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* 1. Compact Month Switcher (hidden on extra small screens, visible in drawer) */}
            <div className="hidden xs:block">
              <MonthPicker />
            </div>

            {/* 2. Commands as icon button */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="h-9 px-2.5 sm:px-3 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FFFDFA] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-xs font-medium inline-flex items-center gap-1.5 transition-all text-[#0D0D0C] shadow-sm shrink-0"
              title="Commands (⌘K / Ctrl+K)"
              aria-label="Commands"
            >
              <Command className="w-3.5 h-3.5 stroke-[1.8]" />
              <span className="font-mono text-[11px] font-normal hidden sm:inline">⌘K</span>
            </button>

            {/* 3. Can I Afford It as 36px icon-only button */}
            <button
              onClick={() => setSimulatorModalOpen(true)}
              className="w-9 h-9 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FFFDFA] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] flex items-center justify-center transition-all text-[#0D0D0C] shadow-sm shrink-0"
              title="Can I Afford It? (Press A)"
              aria-label="Can I Afford It?"
            >
              <Sparkles className="w-4 h-4 stroke-[1.5]" />
            </button>

            {/* 4. ONE auth button */}
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

            {/* 6. Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-9 h-9 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FFFDFA] flex items-center justify-center text-[#0D0D0C] shrink-0"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (85% width, cream #FFFDFA) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#0D0D0C]/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Container (85% width, cream #FFFDFA) */}
          <div className="fixed inset-y-0 right-0 w-[85vw] max-w-sm bg-[#FFFDFA] border-l border-[#0D0D0C]/[0.08] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#0D0D0C]/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0D0D0C]" />
                  <span className="font-semibold text-base text-[#0D0D0C]">
                    mint month
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full border border-[#0D0D0C]/[0.1] flex items-center justify-center text-[#0D0D0C]/60 hover:text-[#0D0D0C]"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Month Switcher in Drawer */}
              <div className="p-3 rounded-2xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] flex items-center justify-between">
                <span className="text-xs text-[#0D0D0C]/60 font-medium">Cycle:</span>
                <MonthPicker />
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {[
                  ...navLinks,
                  { href: "/settings", label: "Settings & Preferences", icon: Settings },
                ].map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-[#0D0D0C] text-[#FFFDFA]"
                          : "text-[#0D0D0C]/70 hover:bg-[#FBF6EF] hover:text-[#0D0D0C]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 stroke-[1.8]" />
                        <span>{link.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-40" />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-6 border-t border-[#0D0D0C]/[0.08] space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setQuickAddOpen(true);
                }}
                className="w-full h-11 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs font-medium flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Expense</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSimulatorModalOpen(true);
                }}
                className="w-full h-11 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FBF6EF] text-[#0D0D0C] text-xs font-medium flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Can I Afford It? Simulator</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;

