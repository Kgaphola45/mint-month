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
  Coins,
  ShieldCheck,
} from "lucide-react";
import { MonthPicker } from "./month-picker";
import { ThemeToggle } from "./theme-toggle";
import { useExpenseStore } from "@/store/useExpenseStore";
import { CURRENCIES } from "@/lib/currencies";

export function Navbar() {
  const pathname = usePathname();
  const { setQuickAddOpen, currency } = useExpenseStore();
  const currentCurrency = CURRENCIES[currency] || CURRENCIES.INR;

  // Global keyboard shortcut: Cmd/Ctrl + K or 'n' opens quick add
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "n" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName))
      ) {
        e.preventDefault();
        setQuickAddOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setQuickAddOpen]);

  const navLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: Receipt },
    { href: "/budgets", label: "Budgets", icon: PiggyBank },
    { href: "/compare", label: "Compare", icon: ArrowLeftRight },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-mint-600 via-mint-500 to-emerald-400 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-foreground flex items-center gap-1.5">
                  Mint Month
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-mint-500/10 text-mint-600 dark:text-mint-400 border border-mint-500/20">
                    MVP
                  </span>
                </span>
                <span className="text-[10.5px] text-muted-foreground -mt-0.5 hidden sm:flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-mint-500" />
                  Privacy-first tracker
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 bg-muted/40 p-1 rounded-2xl border border-border/30">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${isActive
                        ? "bg-card text-foreground shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Central Month Switcher */}
          <div className="flex items-center justify-center">
            <MonthPicker />
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Pill */}
            <Link
              href="/settings"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 transition-colors"
              title="Change Currency in Settings"
            >
              <span className="font-bold text-mint-500">{currentCurrency.symbol}</span>
              <span className="text-[11px]">{currentCurrency.code}</span>
            </Link>

            <ThemeToggle />

            {/* Add Expense Action Button */}
            <button
              onClick={() => setQuickAddOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-mint-500 hover:bg-mint-600 active:scale-95 text-white font-medium text-xs sm:text-sm shadow-glow transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Expense</span>
              <span className="sm:hidden">Add</span>
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-sans font-semibold text-mint-100 bg-white/20 rounded">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Floating Navigation Bar for Mobile */}
      <div className="lg:hidden fixed bottom-4 inset-x-4 z-30 max-w-md mx-auto">
        <nav className="glass bg-card/90 border border-border/70 rounded-3xl p-1.5 shadow-2xl flex items-center justify-around backdrop-blur-xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[10px] font-medium transition-all ${isActive
                    ? "text-mint-600 dark:text-mint-400 font-bold bg-mint-500/10"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
                <span className="mt-0.5">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
