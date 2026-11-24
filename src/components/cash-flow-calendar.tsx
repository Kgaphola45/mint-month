"use client";

import React, { useState, useMemo, useRef, useEffect, useId } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Clock,
  CheckCircle2,
  X,
  CreditCard,
  PiggyBank,
  Tv,
  Receipt,
  Eye,
  Layers,
  List,
  Grid3X3,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { CashFlowDay, CashFlowEvent } from "@/types";
import { formatCurrency, formatMonthYear } from "@/lib/utils";
import { parse, getDay } from "date-fns";

export function CashFlowCalendar() {
  const {
    selectedMonth,
    currency,
    getCashFlowCalendar,
    addExpense,
    categories,
  } = useExpenseStore();

  const [viewMode, setViewMode] = useState<"grid" | "agenda">("grid");
  const [selectedDay, setSelectedDay] = useState<CashFlowDay | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // Quick Plan Expense Form State
  const [planAmount, setPlanAmount] = useState("");
  const [planNote, setPlanNote] = useState("");
  const [planDate, setPlanDate] = useState("");
  const [planCatId, setPlanCatId] = useState("");

  const planDialogRef = useRef<HTMLDialogElement>(null);
  const planDialogTitleId = useId();

  const calendarData = useMemo(() => {
    return getCashFlowCalendar(selectedMonth);
  }, [getCashFlowCalendar, selectedMonth]);

  // Keep selectedDay synced when month changes
  useEffect(() => {
    if (calendarData.days.length > 0) {
      const todayDay = calendarData.days.find((d) => d.isCurrentDay);
      setSelectedDay(todayDay || calendarData.days[0]);
    }
  }, [calendarData, selectedMonth]);

  // Dialog control via native showModal
  useEffect(() => {
    const dialog = planDialogRef.current;
    if (!dialog) return;

    if (isPlanModalOpen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isPlanModalOpen]);

  // First day of month offset for Monday-first 7-column grid
  // getDay returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  const startDayOffset = useMemo(() => {
    try {
      const firstDay = parse(`${selectedMonth}-01`, "yyyy-MM-dd", new Date());
      const dayOfWeek = getDay(firstDay); // 0 = Sun, 1 = Mon
      return (dayOfWeek + 6) % 7; // 0 for Mon, 1 for Tue, ..., 6 for Sun
    } catch {
      return 0;
    }
  }, [selectedMonth]);

  const openPlanModalForDay = (dateStr: string) => {
    setPlanDate(dateStr);
    setPlanAmount("");
    setPlanNote("");
    setPlanCatId(categories[0]?.id || "cat-other");
    setIsPlanModalOpen(true);
  };

  const handleSavePlannedExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(planAmount);
    if (isNaN(amount) || amount <= 0 || !planDate) return;

    addExpense({
      amount,
      note: planNote.trim() ? `${planNote.trim()} (Planned)` : "Planned Purchase",
      categoryId: planCatId || categories[0]?.id || "cat-other",
      date: planDate,
      paymentMethod: "Card",
    });

    setIsPlanModalOpen(false);
  };

  return (
    <div className="w-full bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] rounded-[28px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-7">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#0D0D0C]/[0.06]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6DE68]/30 border border-[#F6DE68]/70 text-[#0D0D0C] text-[11px] font-semibold tracking-wide uppercase mb-2">
            <CalendarIcon className="w-3.5 h-3.5 stroke-[2.2] text-[#8B6D1B]" />
            <span>Cash Flow Radar</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C]">
            Daily Cash Flow Calendar
          </h2>
          <p className="text-xs sm:text-sm text-[#0D0D0C]/60 mt-1 max-w-xl">
            Forecast your bank balance for every single day. Track incoming salary, scheduled debit orders, debt instalments, and spot tight days before they hit.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-[#FBF6EF] p-1 rounded-full border border-[#0D0D0C]/[0.08]">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-full text-xs font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-[#0D0D0C] text-[#FFFDFA] shadow-xs"
                  : "text-[#0D0D0C]/60 hover:text-[#0D0D0C]"
              }`}
              title="Calendar Grid View"
              aria-label="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("agenda")}
              className={`p-1.5 rounded-full text-xs font-medium transition-all ${
                viewMode === "agenda"
                  ? "bg-[#0D0D0C] text-[#FFFDFA] shadow-xs"
                  : "text-[#0D0D0C]/60 hover:text-[#0D0D0C]"
              }`}
              title="Daily Agenda List View"
              aria-label="Agenda view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => openPlanModalForDay(selectedDay?.dateStr || `${selectedMonth}-15`)}
            className="h-10 px-4 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs font-medium inline-flex items-center gap-2 hover:bg-[#0D0D0C]/90 transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Plan Purchase</span>
            <span className="xs:hidden">Plan</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metric Ribbon (Vela Editorial Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Projected Ending Balance */}
        <div className="p-4 rounded-2xl bg-[#FBF6EF]/70 border border-[#0D0D0C]/[0.06]">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#0D0D0C]/50 block">
            Projected End-of-Month Buffer
          </span>
          <div className="text-xl sm:text-2xl font-serif font-semibold text-[#0D0D0C] mt-1">
            {formatCurrency(calendarData.projectedEndingBalance, currency)}
          </div>
          <p className="text-[11px] text-[#0D0D0C]/60 mt-1">
            Opening buffer: {formatCurrency(calendarData.startingBalance, currency)}
          </p>
        </div>

        {/* Metric 2: Toughest Day / Lowest Balance Point */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            calendarData.lowestBalance < 2000
              ? "bg-rose-50/70 border-rose-200 text-rose-950"
              : "bg-[#FBF6EF]/70 border-[#0D0D0C]/[0.06] text-[#0D0D0C]"
          }`}
        >
          <span className="text-[11px] font-medium uppercase tracking-wider opacity-70 block flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Toughest Day of Month</span>
          </span>
          <div className="text-xl sm:text-2xl font-serif font-semibold mt-1">
            {formatCurrency(calendarData.lowestBalance, currency)}
          </div>
          <p className="text-[11px] opacity-80 mt-1">
            Lowest cash point on {calendarData.lowestBalanceDate.slice(5)} (Day {calendarData.lowestBalanceDay})
          </p>
        </div>

        {/* Metric 3: Total Inflow vs Total Outflow */}
        <div className="p-4 rounded-2xl bg-[#FBF6EF]/70 border border-[#0D0D0C]/[0.06]">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#0D0D0C]/50 block flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>Inflows vs Outflows</span>
          </span>
          <div className="text-base sm:text-lg font-serif font-semibold text-[#0D0D0C] mt-1">
            <span className="text-emerald-700">+{formatCurrency(calendarData.totalInflows, currency)}</span>
            <span className="text-[#0D0D0C]/30 mx-1">/</span>
            <span className="text-rose-700">-{formatCurrency(calendarData.totalOutflows, currency)}</span>
          </div>
          <p className="text-[11px] text-[#0D0D0C]/60 mt-1">
            Net Change: {calendarData.totalInflows - calendarData.totalOutflows >= 0 ? "+" : ""}
            {formatCurrency(calendarData.totalInflows - calendarData.totalOutflows, currency)}
          </p>
        </div>

        {/* Metric 4: Tight & Heavy Outflow Days */}
        <div className="p-4 rounded-2xl bg-[#0D0D0C] text-[#FFFDFA] shadow-sm">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#FFFDFA]/60 block flex items-center justify-between">
            <span>Squeeze & Heavy Days</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </span>
          <div className="text-xl sm:text-2xl font-serif font-semibold text-[#FFFDFA] mt-1">
            {calendarData.tightDaysCount} tight day{calendarData.tightDaysCount !== 1 ? "s" : ""}
          </div>
          <p className="text-[11px] text-[#FFFDFA]/70 mt-1">
            {calendarData.heavyOutflowDaysCount} heavy debit cluster day(s) flagged
          </p>
        </div>
      </div>

      {/* 3. Main Calendar Section */}
      {viewMode === "grid" ? (
        <div className="space-y-4">
          {/* Weekday Column Headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#0D0D0C]/50 pb-1">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div className="text-amber-800/80">Sat</div>
            <div className="text-amber-800/80">Sun</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Blank leading offset cells */}
            {Array.from({ length: startDayOffset }).map((_, idx) => (
              <div
                key={`empty-start-${idx}`}
                className="min-h-[85px] sm:min-h-[105px] rounded-2xl bg-[#FBF6EF]/25 border border-dashed border-[#0D0D0C]/[0.04]"
              />
            ))}

            {/* Calendar Days */}
            {calendarData.days.map((day) => {
              const hasEvents = day.events.length > 0;
              const isSelected = selectedDay?.dayNumber === day.dayNumber;

              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[85px] sm:min-h-[105px] p-2 rounded-2xl text-left transition-all flex flex-col justify-between relative group ${
                    isSelected
                      ? "ring-2 ring-[#0D0D0C] bg-[#FFFDFA] shadow-md z-10"
                      : day.isCurrentDay
                      ? "bg-amber-50/50 border border-amber-300/80 shadow-xs"
                      : day.isPayday
                      ? "bg-emerald-50/60 border border-emerald-300/80"
                      : day.isTight
                      ? "bg-rose-50/30 border border-rose-200/80 hover:bg-rose-50/50"
                      : "bg-[#FBF6EF]/50 border border-[#0D0D0C]/[0.06] hover:bg-[#FBF6EF] hover:border-[#0D0D0C]/[0.15]"
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                        day.isCurrentDay
                          ? "bg-[#0D0D0C] text-[#FFFDFA]"
                          : day.isPayday
                          ? "bg-emerald-700 text-[#FFFDFA]"
                          : "text-[#0D0D0C]"
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {/* Tight day warning dot */}
                    {day.isTight && (
                      <span
                        className="w-2 h-2 rounded-full bg-rose-500 shrink-0"
                        title={day.tightReason || "Financially tight day"}
                      />
                    )}

                    {day.isPayday && (
                      <span className="text-[9px] font-bold uppercase tracking-tight text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full hidden sm:inline">
                        Payday
                      </span>
                    )}
                  </div>

                  {/* Day Events Preview Pills */}
                  <div className="space-y-1 my-1 w-full overflow-hidden">
                    {day.events.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium flex items-center justify-between gap-1 ${
                          ev.isIncome
                            ? "bg-emerald-100/90 text-emerald-900 font-semibold"
                            : ev.type === "debit_order"
                            ? "bg-[#0D0D0C]/[0.06] text-[#0D0D0C]"
                            : ev.type === "subscription"
                            ? "bg-purple-100 text-purple-900"
                            : ev.type === "debt"
                            ? "bg-blue-100 text-blue-900"
                            : ev.type === "savings"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-rose-100/70 text-rose-900"
                        }`}
                        title={`${ev.title}: ${formatCurrency(ev.amount, currency)}`}
                      >
                        <span className="truncate">{ev.title}</span>
                        <span className="shrink-0 font-mono text-[9px]">
                          {ev.isIncome ? "+" : "-"}
                          {Math.round(ev.amount) >= 1000
                            ? `${Math.round(ev.amount / 1000)}k`
                            : Math.round(ev.amount)}
                        </span>
                      </div>
                    ))}

                    {day.events.length > 2 && (
                      <span className="text-[9px] text-[#0D0D0C]/40 font-medium block text-right">
                        +{day.events.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Closing Projected Balance */}
                  <div className="pt-1 border-t border-[#0D0D0C]/[0.05] flex items-center justify-between w-full text-[10px]">
                    <span className="text-[#0D0D0C]/40 hidden sm:inline">Bal:</span>
                    <span
                      className={`font-mono font-medium truncate ${
                        day.projectedClosingBalance < 1500
                          ? "text-rose-600 font-semibold"
                          : "text-[#0D0D0C]/70"
                      }`}
                    >
                      {formatCurrency(day.projectedClosingBalance, currency)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda / Timeline View */
        <div className="space-y-3">
          <div className="text-xs text-[#0D0D0C]/60 flex items-center justify-between pb-1">
            <span>Chronological schedule of financial events for {formatMonthYear(selectedMonth)}:</span>
            <span>{calendarData.days.filter((d) => d.events.length > 0).length} active days</span>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {calendarData.days
              .filter((d) => d.events.length > 0)
              .map((day) => (
                <div
                  key={day.dateStr}
                  onClick={() => setSelectedDay(day)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    selectedDay?.dayNumber === day.dayNumber
                      ? "ring-2 ring-[#0D0D0C] bg-[#FFFDFA] shadow-xs"
                      : day.isPayday
                      ? "bg-emerald-50/40 border-emerald-200"
                      : day.isTight
                      ? "bg-rose-50/30 border-rose-200"
                      : "bg-[#FBF6EF]/50 border-[#0D0D0C]/[0.06] hover:bg-[#FBF6EF]"
                  }`}
                >
                  {/* Left: Date Badge & Events */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                        day.isCurrentDay
                          ? "bg-[#0D0D0C] text-[#FFFDFA] border-[#0D0D0C]"
                          : day.isPayday
                          ? "bg-emerald-700 text-[#FFFDFA] border-emerald-800"
                          : "bg-[#FFFDFA] text-[#0D0D0C] border-[#0D0D0C]/[0.08]"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-semibold leading-none opacity-80">
                        {day.dayOfWeek}
                      </span>
                      <span className="text-base font-bold font-serif leading-none mt-0.5">
                        {day.dayNumber}
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-[#0D0D0C]">
                          {day.dateStr}
                        </span>
                        {day.isPayday && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold uppercase inline-flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-800" />
                            <span>Payday</span>
                          </span>
                        )}
                        {day.isTight && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 font-medium inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-700" />
                            <span>{day.tightReason || "Tight day"}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {day.events.map((ev) => (
                          <span
                            key={ev.id}
                            className={`text-[11px] px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1 ${
                              ev.isIncome
                                ? "bg-emerald-100 text-emerald-900"
                                : "bg-[#0D0D0C]/[0.06] text-[#0D0D0C]"
                            }`}
                          >
                            <span>{ev.title}:</span>
                            <span className="font-mono">
                              {ev.isIncome ? "+" : "-"}
                              {formatCurrency(ev.amount, currency)}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Closing Projected Balance */}
                  <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#0D0D0C]/[0.06]">
                    <span className="text-[10px] uppercase font-semibold text-[#0D0D0C]/40 block">
                      Projected Balance
                    </span>
                    <span
                      className={`text-base font-serif font-semibold ${
                        day.projectedClosingBalance < 1500
                          ? "text-rose-600"
                          : "text-[#0D0D0C]"
                      }`}
                    >
                      {formatCurrency(day.projectedClosingBalance, currency)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 4. Interactive Day Inspector Drawer / Card */}
      {selectedDay && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FBF6EF]/70 border border-[#0D0D0C]/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#0D0D0C]/[0.08]">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-serif font-bold text-lg shrink-0 ${
                  selectedDay.isPayday
                    ? "bg-emerald-700 text-[#FFFDFA]"
                    : "bg-[#0D0D0C] text-[#FFFDFA]"
                }`}
              >
                {selectedDay.dayNumber}
              </div>
              <div>
                <h3 className="font-serif text-lg font-medium text-[#0D0D0C]">
                  Day Inspector: {selectedDay.dayOfWeek}, {selectedDay.dateStr}
                </h3>
                <span className="text-xs text-[#0D0D0C]/60 flex items-center gap-2 mt-0.5">
                  <span>Projected Balance: <strong>{formatCurrency(selectedDay.projectedClosingBalance, currency)}</strong></span>
                  <span>•</span>
                  <span>Net Day Change: {selectedDay.netChange >= 0 ? "+" : ""}{formatCurrency(selectedDay.netChange, currency)}</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => openPlanModalForDay(selectedDay.dateStr)}
              className="px-3.5 py-1.5 rounded-full bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] text-xs font-medium text-[#0D0D0C] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] transition-all inline-flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Plan Expense on Day {selectedDay.dayNumber}</span>
            </button>
          </div>

          {/* Events breakdown on selected day */}
          {selectedDay.events.length === 0 ? (
            <p className="text-xs text-[#0D0D0C]/50 py-2">
              No debit orders, salary deposits, or planned expenses recorded on this day. Running cash balance carries forward untouched.
            </p>
          ) : (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#0D0D0C] block">
                Events on this Day ({selectedDay.events.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {selectedDay.events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl bg-[#FFFDFA] border border-[#0D0D0C]/[0.06] flex items-center justify-between gap-2 shadow-xs"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-[#0D0D0C] block truncate">
                        {ev.title}
                      </span>
                      <span className="text-[10px] text-[#0D0D0C]/50 uppercase tracking-wider block">
                        {ev.type.replace(/_/g, " ")}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-mono font-semibold shrink-0 ${
                        ev.isIncome ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {ev.isIncome ? "+" : "-"}
                      {formatCurrency(ev.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Native <dialog> Modal for Planning a Future Purchase on Specific Date */}
      <dialog
        ref={planDialogRef}
        aria-labelledby={planDialogTitleId}
        onClick={(e) => {
          if (e.target === planDialogRef.current) setIsPlanModalOpen(false);
        }}
        onCancel={() => setIsPlanModalOpen(false)}
        className="vela-native-dialog m-auto"
      >
        <div className="p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#0D0D0C]/[0.08]">
            <div>
              <h3 id={planDialogTitleId} className="font-serif text-xl font-medium text-[#0D0D0C]">
                Plan a Future Purchase
              </h3>
              <p className="text-xs text-[#0D0D0C]/50 mt-0.5">
                Simulate an expense on a specific date to preview its impact on subsequent cash runway.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPlanModalOpen(false)}
              className="w-8 h-8 rounded-full border border-[#0D0D0C]/[0.1] flex items-center justify-center text-[#0D0D0C]/60 hover:text-[#0D0D0C]"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSavePlannedExpense} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#0D0D0C]/80 mb-1">
                Planned Date *
              </label>
              <input
                type="date"
                required
                value={planDate}
                onChange={(e) => setPlanDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#0D0D0C]/[0.15] bg-[#FBF6EF]/50 text-sm text-[#0D0D0C] focus:outline-none focus:ring-1 focus:ring-[#0D0D0C]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0D0D0C]/80 mb-1">
                Amount (ZAR) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={planAmount}
                onChange={(e) => setPlanAmount(e.target.value)}
                placeholder="e.g. 1200.00"
                className="w-full px-3.5 py-2 rounded-xl border border-[#0D0D0C]/[0.15] bg-[#FBF6EF]/50 text-sm text-[#0D0D0C] focus:outline-none focus:ring-1 focus:ring-[#0D0D0C]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0D0D0C]/80 mb-1">
                Description / Purpose
              </label>
              <input
                type="text"
                value={planNote}
                onChange={(e) => setPlanNote(e.target.value)}
                placeholder="e.g. Car battery replacement, New running shoes"
                className="w-full px-3.5 py-2 rounded-xl border border-[#0D0D0C]/[0.15] bg-[#FBF6EF]/50 text-sm text-[#0D0D0C] focus:outline-none focus:ring-1 focus:ring-[#0D0D0C]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0D0D0C]/80 mb-1">
                Category
              </label>
              <select
                value={planCatId}
                onChange={(e) => setPlanCatId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#0D0D0C]/[0.15] bg-[#FBF6EF]/50 text-sm text-[#0D0D0C] focus:outline-none focus:ring-1 focus:ring-[#0D0D0C]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#0D0D0C]/[0.08]">
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className="px-4 py-2 rounded-full border border-[#0D0D0C]/[0.1] text-xs font-medium text-[#0D0D0C]/70 hover:text-[#0D0D0C]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs font-medium hover:bg-[#0D0D0C]/90 shadow-sm"
              >
                Log Planned Expense
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}
