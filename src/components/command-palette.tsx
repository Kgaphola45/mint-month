"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { format, parse, subMonths, addMonths } from "date-fns";
import {
  Search,
  PlusCircle,
  Calendar,
  Download,
  Mail,
  Sparkles,
  BookOpen,
  ArrowRight,
  Receipt,
  PiggyBank,
  ArrowLeftRight,
  Settings,
  CreditCard,
  SlidersHorizontal,
  X,
  Command,
  Check,
  FileSpreadsheet,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency, formatMonthYear, getTodayDateStr } from "@/lib/utils";
import { CURRENCIES } from "@/lib/currencies";

interface PaletteCommand {
  id: string;
  section: "Smart Actions" | "Quick Actions" | "Navigation" | "Switch Month" | "Settings & Tools";
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    selectedMonth,
    setSelectedMonth,
    currency,
    categories,
    addExpense,
    exportDataCSV,
    setQuickAddOpen,
    setSimulatorModalOpen,
    setStoryModalOpen,
    setBudgetModalOpen,
    setDebtModalOpen,
    setPaydayModalOpen,
    setDigestModalOpen,
    getHistoricalTrends,
  } = useExpenseStore();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const currentCurrency = CURRENCIES[currency] || CURRENCIES.ZAR;
  const trends = getHistoricalTrends(6);

  // Global Hotkey: Cmd+K / Ctrl+K opens or closes palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === "Escape" && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Focus input and reset query on open
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  // Helper to trigger CSV download
  const triggerCSVDownload = () => {
    const csv = exportDataCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `mint-month-transactions-${getTodayDateStr()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    try {
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  // Helper to map note keywords to category ID
  const detectCategory = (note: string): string => {
    const lower = note.toLowerCase();
    if (
      lower.includes("lunch") ||
      lower.includes("dinner") ||
      lower.includes("breakfast") ||
      lower.includes("coffee") ||
      lower.includes("snack") ||
      lower.includes("food") ||
      lower.includes("burger") ||
      lower.includes("pizza") ||
      lower.includes("restaurant") ||
      lower.includes("kfc") ||
      lower.includes("mcdonalds")
    ) {
      return "cat-food";
    }
    if (
      lower.includes("grocer") ||
      lower.includes("woolies") ||
      lower.includes("woolworths") ||
      lower.includes("checkers") ||
      lower.includes("pick n pay") ||
      lower.includes("pnp") ||
      lower.includes("spar") ||
      lower.includes("shoprite") ||
      lower.includes("market")
    ) {
      return "cat-groceries";
    }
    if (
      lower.includes("uber") ||
      lower.includes("bolt") ||
      lower.includes("petrol") ||
      lower.includes("fuel") ||
      lower.includes("diesel") ||
      lower.includes("gas") ||
      lower.includes("transport") ||
      lower.includes("taxi") ||
      lower.includes("parking")
    ) {
      return "cat-transport";
    }
    if (
      lower.includes("airtime") ||
      lower.includes("data") ||
      lower.includes("vox") ||
      lower.includes("vodacom") ||
      lower.includes("mtn") ||
      lower.includes("telkom") ||
      lower.includes("rain") ||
      lower.includes("wifi")
    ) {
      return "cat-airtime-data";
    }
    if (
      lower.includes("apple") ||
      lower.includes("spotify") ||
      lower.includes("netflix") ||
      lower.includes("icloud") ||
      lower.includes("youtube") ||
      lower.includes("subscription")
    ) {
      return "cat-subscriptions";
    }
    if (
      lower.includes("hair") ||
      lower.includes("barber") ||
      lower.includes("salon") ||
      lower.includes("medical") ||
      lower.includes("pharmacy") ||
      lower.includes("dischem") ||
      lower.includes("clicks")
    ) {
      return "cat-personal-care";
    }
    if (
      lower.includes("zara") ||
      lower.includes("tfg") ||
      lower.includes("mr price") ||
      lower.includes("clothes") ||
      lower.includes("clothing") ||
      lower.includes("shoes")
    ) {
      return "cat-clothing";
    }
    if (
      lower.includes("debt") ||
      lower.includes("laptop") ||
      lower.includes("phone contract") ||
      lower.includes("payjustnow") ||
      lower.includes("loan")
    ) {
      return "cat-debt";
    }

    return categories[0]?.id || "cat-other";
  };

  // Build commands based on query and natural language parsing
  const commands = useMemo<PaletteCommand[]>(() => {
    const list: PaletteCommand[] = [];
    const trimmed = query.trim();

    // 1. Natural Language Parse: "Add R250 lunch" / "log 150 coffee" / "spend 350 dinner"
    const addExpenseMatch = trimmed.match(
      /^(?:add|log|spend|bought)\s+(?:[rR$€£]\s*)?([\d,]+(?:\.\d{1,2})?)(?:\s+(.+))?$/i
    );

    if (addExpenseMatch) {
      const parsedAmount = parseFloat(addExpenseMatch[1].replace(/,/g, "")) || 0;
      const parsedNote = addExpenseMatch[2]?.trim() || "Quick expense";
      const detectedCatId = detectCategory(parsedNote);
      const catObj = categories.find((c) => c.id === detectedCatId) || categories[0];

      if (parsedAmount > 0) {
        list.push({
          id: "nl-add-expense",
          section: "Smart Actions",
          title: `Log Expense: ${formatCurrency(parsedAmount, currency)} — ${parsedNote}`,
          subtitle: `Category: ${catObj?.name || "Other"} · Date: Today · Payment: Card`,
          icon: PlusCircle,
          badge: "Press ↵ to Log",
          action: () => {
            addExpense({
              amount: parsedAmount,
              note: parsedNote,
              categoryId: detectedCatId,
              date: getTodayDateStr(),
              paymentMethod: "Card",
            });
            try {
              confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
            } catch {
              // ignore
            }
            setCommandPaletteOpen(false);
          },
        });
      }
    }

    // 2. Natural Language Parse: "Go to September" / "Switch to October"
    const monthNames = [
      { name: "january", short: "jan", num: "01" },
      { name: "february", short: "feb", num: "02" },
      { name: "march", short: "mar", num: "03" },
      { name: "april", short: "apr", num: "04" },
      { name: "may", short: "may", num: "05" },
      { name: "june", short: "jun", num: "06" },
      { name: "july", short: "jul", num: "07" },
      { name: "august", short: "aug", num: "08" },
      { name: "september", short: "sep", num: "09" },
      { name: "october", short: "oct", num: "10" },
      { name: "november", short: "nov", num: "11" },
      { name: "december", short: "dec", num: "12" },
    ];

    const lowerQuery = trimmed.toLowerCase();
    const goToMatch = lowerQuery.match(/^(?:go to|switch to|open|month)\s+(.+)$/i);
    const monthTargetStr = goToMatch ? goToMatch[1].trim() : lowerQuery;

    const matchedMonthMeta = monthNames.find(
      (m) => monthTargetStr.includes(m.name) || monthTargetStr === m.short
    );

    if (matchedMonthMeta) {
      // Determine year (e.g. 2026 or current year)
      const yearMatch = monthTargetStr.match(/20\d\d/);
      const targetYear = yearMatch ? yearMatch[0] : "2026";
      const targetMonthStr = `${targetYear}-${matchedMonthMeta.num}`;

      list.push({
        id: `nl-switch-month-${targetMonthStr}`,
        section: "Smart Actions",
        title: `Switch Active Month to ${formatMonthYear(targetMonthStr)}`,
        subtitle: `Changes active ledger and dashboard view to ${formatMonthYear(targetMonthStr)}`,
        icon: Calendar,
        badge: "Press ↵ to Switch",
        action: () => {
          setSelectedMonth(targetMonthStr);
          setCommandPaletteOpen(false);
        },
      });
    }

    // 3. Quick Actions
    const quickActions: PaletteCommand[] = [
      {
        id: "act-can-i-afford",
        section: "Quick Actions",
        title: "Can I Afford It? Purchase Simulator",
        subtitle: "Simulate daily guilt-free allowance consequences before swiping",
        icon: Sparkles,
        shortcut: "A",
        action: () => {
          setCommandPaletteOpen(false);
          setSimulatorModalOpen(true);
        },
      },
      {
        id: "act-editorial-story",
        section: "Quick Actions",
        title: "Read Monthly Editorial Story (Wrapped)",
        subtitle: "3-slide editorial magazine review of the closed month",
        icon: BookOpen,
        shortcut: "W",
        action: () => {
          setCommandPaletteOpen(false);
          setStoryModalOpen(true);
        },
      },
      {
        id: "act-export-csv",
        section: "Quick Actions",
        title: "Export Ledger to CSV",
        subtitle: "Download all transactions in spreadsheet format",
        icon: FileSpreadsheet,
        badge: "Export CSV",
        action: () => {
          triggerCSVDownload();
          setCommandPaletteOpen(false);
        },
      },
      {
        id: "act-payday-digest",
        section: "Quick Actions",
        title: "Send Payday & Debit Order Digest",
        subtitle: "Trigger the ring-fenced salary and debit order email summary",
        icon: Mail,
        action: () => {
          setCommandPaletteOpen(false);
          setDigestModalOpen(true);
        },
      },
      {
        id: "act-add-expense",
        section: "Quick Actions",
        title: "Add Expense (Full Form)",
        subtitle: "Log outlays with category, payment method, and recurring flag",
        icon: PlusCircle,
        shortcut: "N",
        action: () => {
          setCommandPaletteOpen(false);
          setQuickAddOpen(true);
        },
      },
      {
        id: "act-configure-salary",
        section: "Quick Actions",
        title: "Configure Take-Home Salary & Payday",
        subtitle: "Update net income and payday schedule (1st–31st)",
        icon: SlidersHorizontal,
        action: () => {
          setCommandPaletteOpen(false);
          setPaydayModalOpen(true);
        },
      },
      {
        id: "act-manage-budgets",
        section: "Quick Actions",
        title: "Adjust Category Budgets",
        subtitle: "Tune monthly category caps and recurring allocations",
        icon: PiggyBank,
        action: () => {
          setCommandPaletteOpen(false);
          setBudgetModalOpen(true);
        },
      },
      {
        id: "act-manage-debts",
        section: "Quick Actions",
        title: "Manage Debt & Financing Contracts",
        subtitle: "Track PayJustNow, laptop, phone contracts, and store accounts",
        icon: CreditCard,
        action: () => {
          setCommandPaletteOpen(false);
          setDebtModalOpen(true);
        },
      },
    ];

    // Filter quick actions if query matches
    quickActions.forEach((item) => {
      if (
        !trimmed ||
        item.title.toLowerCase().includes(lowerQuery) ||
        item.subtitle.toLowerCase().includes(lowerQuery) ||
        (item.badge && item.badge.toLowerCase().includes(lowerQuery)) ||
        (lowerQuery.includes("csv") && item.id === "act-export-csv") ||
        (lowerQuery.includes("digest") && item.id === "act-payday-digest") ||
        (lowerQuery.includes("afford") && item.id === "act-can-i-afford") ||
        (lowerQuery.includes("story") && item.id === "act-editorial-story") ||
        (lowerQuery.includes("wrapped") && item.id === "act-editorial-story")
      ) {
        list.push(item);
      }
    });

    // 4. Navigation
    const navItems: PaletteCommand[] = [
      {
        id: "nav-dashboard",
        section: "Navigation",
        title: "Go to Dashboard",
        subtitle: "Overview, Safe-to-Spend meter, and debit order timeline",
        icon: Receipt,
        action: () => {
          router.push("/");
          setCommandPaletteOpen(false);
        },
      },
      {
        id: "nav-transactions",
        section: "Navigation",
        title: "Go to Transactions",
        subtitle: "Full searchable ledger and statement export",
        icon: Receipt,
        action: () => {
          router.push("/transactions");
          setCommandPaletteOpen(false);
        },
      },
      {
        id: "nav-budgets",
        section: "Navigation",
        title: "Go to Budgets",
        subtitle: "Category progress bars and tick-off sorting",
        icon: PiggyBank,
        action: () => {
          router.push("/budgets");
          setCommandPaletteOpen(false);
        },
      },
      {
        id: "nav-analytics",
        section: "Navigation",
        title: "Go to Analytics & Comparison",
        subtitle: "Month-over-month shifts, burn rate, and category spectrum",
        icon: ArrowLeftRight,
        action: () => {
          router.push("/compare");
          setCommandPaletteOpen(false);
        },
      },
      {
        id: "nav-settings",
        section: "Navigation",
        title: "Go to Settings",
        subtitle: "Currency, accounts, data backup and restore",
        icon: Settings,
        action: () => {
          router.push("/settings");
          setCommandPaletteOpen(false);
        },
      },
    ];

    navItems.forEach((item) => {
      if (
        !trimmed ||
        item.title.toLowerCase().includes(lowerQuery) ||
        item.subtitle.toLowerCase().includes(lowerQuery)
      ) {
        list.push(item);
      }
    });

    // 5. Month Switchers (Historical months)
    if (!matchedMonthMeta) {
      trends.forEach((t) => {
        const titleStr = `Switch to ${t.label} (${t.month})`;
        if (!trimmed || titleStr.toLowerCase().includes(lowerQuery)) {
          list.push({
            id: `month-${t.month}`,
            section: "Switch Month",
            title: formatMonthYear(t.month),
            subtitle: t.month === selectedMonth ? "Currently selected month" : `Budget: ${formatCurrency(t.budget, currency)}`,
            icon: Calendar,
            badge: t.month === selectedMonth ? "Active" : undefined,
            action: () => {
              setSelectedMonth(t.month);
              setCommandPaletteOpen(false);
            },
          });
        }
      });
    }

    return list;
  }, [
    query,
    currency,
    categories,
    selectedMonth,
    trends,
    addExpense,
    exportDataCSV,
    router,
    setCommandPaletteOpen,
    setSelectedMonth,
    setQuickAddOpen,
    setSimulatorModalOpen,
    setStoryModalOpen,
    setBudgetModalOpen,
    setDebtModalOpen,
    setPaydayModalOpen,
    setDigestModalOpen,
  ]);

  // Clamp selection on command list change
  useEffect(() => {
    if (selectedIndex >= commands.length) {
      setSelectedIndex(Math.max(0, commands.length - 1));
    }
  }, [commands.length, selectedIndex]);

  // Handle keyboard navigation inside the list
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, commands.length));
      scrollIntoView((selectedIndex + 1) % Math.max(1, commands.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + commands.length) % Math.max(1, commands.length));
      scrollIntoView((selectedIndex - 1 + commands.length) % Math.max(1, commands.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (commands[selectedIndex]) {
        commands[selectedIndex].action();
      }
    }
  };

  const scrollIntoView = (index: number) => {
    const listEl = listRef.current;
    if (!listEl) return;
    const item = listEl.querySelector(`[data-index="${index}"]`) as HTMLElement;
    if (item) {
      item.scrollIntoView({ block: "nearest" });
    }
  };

  if (!commandPaletteOpen) return null;

  // Group commands by section
  let runningIndex = 0;
  const sections: { name: string; items: Array<PaletteCommand & { overallIndex: number }> }[] = [];
  const sectionMap = new Map<string, Array<PaletteCommand & { overallIndex: number }>>();

  commands.forEach((cmd) => {
    const cur = sectionMap.get(cmd.section) || [];
    cur.push({ ...cmd, overallIndex: runningIndex++ });
    sectionMap.set(cmd.section, cur);
  });

  sectionMap.forEach((items, name) => {
    sections.push({ name, items });
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[14vh] p-4 bg-[#0D0D0C]/45 backdrop-blur-md animate-in fade-in duration-150"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] rounded-[24px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col max-h-[80vh] select-none animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fine Grain Overlay */}
        <div className="fine-grain-overlay opacity-10 pointer-events-none" aria-hidden="true" />

        {/* Search Header Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#0D0D0C]/[0.08] bg-[#FBF6EF]/50 relative z-10">
          <Search className="w-5 h-5 text-[#0D0D0C]/40 shrink-0 stroke-[1.8]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command (e.g. 'Add R250 lunch', 'Go to September', 'Export CSV', 'Digest')..."
            className="w-full bg-transparent text-[#0D0D0C] placeholder:text-[#0D0D0C]/35 text-base font-normal focus:outline-none tracking-tight font-sans"
          />

          {query ? (
            <button
              onClick={() => {
                setQuery("");
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="w-6 h-6 rounded-full hover:bg-[#0D0D0C]/[0.06] flex items-center justify-center text-[#0D0D0C]/40 hover:text-[#0D0D0C]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono bg-[#0D0D0C]/[0.06] text-[#0D0D0C]/50 px-2 py-0.5 rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Command Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 divide-y divide-transparent relative z-10">
          {commands.length === 0 ? (
            <div className="py-12 px-6 text-center text-[#0D0D0C]/50 space-y-1.5">
              <p className="text-sm font-medium text-[#0D0D0C]/75">No commands matching &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-[#0D0D0C]/45">
                Try &ldquo;Add R250 lunch&rdquo;, &ldquo;Go to September&rdquo;, &ldquo;Export CSV&rdquo;, or &ldquo;Digest&rdquo;
              </p>
            </div>
          ) : (
            sections.map((section) => (
              <div key={section.name} className="py-1">
                <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#0D0D0C]/40">
                  {section.name}
                </div>

                <div className="space-y-0.5">
                  {section.items.map((cmd) => {
                    const isSelected = cmd.overallIndex === selectedIndex;
                    const IconComponent = cmd.icon;

                    return (
                      <button
                        key={cmd.id}
                        data-index={cmd.overallIndex}
                        onClick={cmd.action}
                        onMouseEnter={() => setSelectedIndex(cmd.overallIndex)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-[14px] flex items-center justify-between gap-3 transition-colors ${
                          isSelected
                            ? "bg-[#0D0D0C] text-[#FFFDFA]"
                            : "hover:bg-[#FBF6EF] text-[#0D0D0C]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "bg-[#FFFDFA]/15 text-[#FFFDFA]"
                                : "bg-[#0D0D0C]/[0.05] text-[#0D0D0C]/70"
                            }`}
                          >
                            <IconComponent className="w-4 h-4 stroke-[1.8]" />
                          </div>

                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate leading-snug">
                              {cmd.title}
                            </div>
                            <div
                              className={`text-xs truncate leading-none mt-0.5 ${
                                isSelected ? "text-[#FFFDFA]/60" : "text-[#0D0D0C]/50"
                              }`}
                            >
                              {cmd.subtitle}
                            </div>
                          </div>
                        </div>

                        {/* Badges / Hotkeys */}
                        <div className="flex items-center gap-2 shrink-0">
                          {cmd.badge && (
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                isSelected
                                  ? "bg-[#FFFDFA]/20 text-[#FFFDFA]"
                                  : "bg-[#0D0D0C]/[0.06] text-[#0D0D0C]/70"
                              }`}
                            >
                              {cmd.badge}
                            </span>
                          )}

                          {cmd.shortcut && (
                            <kbd
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                isSelected
                                  ? "bg-[#FFFDFA]/20 text-[#FFFDFA]"
                                  : "bg-[#0D0D0C]/[0.06] text-[#0D0D0C]/60"
                              }`}
                            >
                              {cmd.shortcut}
                            </kbd>
                          )}

                          {isSelected && (
                            <ArrowRight className="w-3.5 h-3.5 text-[#FFFDFA]/80 shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Toolbar & Keyboard Shortcuts Hint */}
        <div className="px-5 py-2.5 bg-[#FBF6EF]/70 border-t border-[#0D0D0C]/[0.08] flex items-center justify-between text-[11px] text-[#0D0D0C]/50 relative z-10 shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] px-1 py-0.2 rounded text-[#0D0D0C]">
                ↑
              </kbd>
              <kbd className="font-mono bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] px-1 py-0.2 rounded text-[#0D0D0C]">
                ↓
              </kbd>
              <span>to navigate</span>
            </span>

            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] px-1.5 py-0.2 rounded text-[#0D0D0C]">
                ↵
              </kbd>
              <span>to select</span>
            </span>

            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] px-1.5 py-0.2 rounded text-[#0D0D0C]">
                esc
              </kbd>
              <span>to close</span>
            </span>
          </div>

          <span className="hidden sm:inline font-mono text-[10px] text-[#0D0D0C]/40">
            Mint Month Linear Command
          </span>
        </div>
      </div>
    </div>
  );
}
