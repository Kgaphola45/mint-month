"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency, getBudgetStatus } from "@/lib/utils";
import { HeroPanel } from "@/components/hero-panel";
import { StatsCards } from "@/components/stats-cards";
import { SafeToSpendMeter } from "@/components/safe-to-spend-meter";
import { PaydayWhatIfWidget } from "@/components/payday-what-if-widget";
import { RecurringTimeline } from "@/components/recurring-timeline";
import { CategoryChart } from "@/components/category-chart";
import { DailyChart } from "@/components/daily-chart";
import { TransactionsList } from "@/components/transactions-list";
import { EditorialStoryBanner } from "@/components/editorial-story-banner";
import { LandingPage } from "@/components/LandingPage";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function DashboardPage() {
  const {
    currentUser,
    isAuthenticated,
    isLoaded,
    selectedMonth,
    getMonthSummary,
    currency,
    setBudgetModalOpen,
  } = useExpenseStore();

  const [supabaseChecked, setSupabaseChecked] = useState(false);
  const [hasSupabaseUser, setHasSupabaseUser] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      if (!isSupabaseConfigured()) {
        if (isMounted) setSupabaseChecked(true);
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        if (isMounted) setSupabaseChecked(true);
        return;
      }

      try {
        const { data, error } = await supabase.auth.getUser();
        if (isMounted) {
          if (!error && data?.user) {
            setHasSupabaseUser(true);
          } else {
            setHasSupabaseUser(false);
          }
          setSupabaseChecked(true);
        }
      } catch {
        if (isMounted) {
          setHasSupabaseUser(false);
          setSupabaseChecked(true);
        }
      }
    }

    checkAuth();

    const supabase = getSupabaseClient();
    let authListener: { unsubscribe: () => void } | null = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (isMounted) {
          setHasSupabaseUser(Boolean(session?.user));
        }
      });
      authListener = data?.subscription || null;
    }

    return () => {
      isMounted = false;
      authListener?.unsubscribe();
    };
  }, []);

  const isLoggedIn = Boolean(hasSupabaseUser || currentUser || isAuthenticated);

  // If store is still initializing or checking initial Supabase session
  if (
    !isLoaded ||
    (isSupabaseConfigured() && !supabaseChecked && !currentUser && !isAuthenticated)
  ) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-[#0D0D0C] border-t-transparent animate-spin" />
      </div>
    );
  }

  // If user is not logged in, render the Vela-editorial Landing Page
  if (!isLoggedIn) {
    return <LandingPage />;
  }

  // Authenticated Dashboard
  const summary = getMonthSummary(selectedMonth);
  const budgetStatus = getBudgetStatus(summary.totalSpent, summary.totalBudget);

  return (
    <div className="flex flex-col w-full">
      {/* 1. Vela-styled Editorial Hero Panel with 4 cycling gradients & headline */}
      <HeroPanel />

      {/* 2. Main Dashboard Content Strip */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 sm:py-10 space-y-8">
        {/* Month-End Editorial Story Banner (Presented early in the month or on the 1st) */}
        <EditorialStoryBanner />

        {/* Dynamic Overbudget Alert (in soft editorial card) */}
        {budgetStatus.status === "danger" && summary.totalBudget > 0 && (
          <div className="p-5 rounded-[24px] bg-[#FFFDFA] border border-rose-300 shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 bg-rose-50">
                <AlertCircle className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#0D0D0C]">
                  {summary.remaining < 0
                    ? `Monthly limit exceeded by ${formatCurrency(
                        Math.abs(summary.remaining),
                        currency
                      )}`
                    : `Budget alert: ${budgetStatus.percentage}% of your monthly cap used`}
                </h4>
                <p className="text-xs text-[#0D0D0C]/56 mt-0.5">
                  Consider reviewing non-essential spending or updating category limits.
                </p>
              </div>
            </div>

            <button
              onClick={() => setBudgetModalOpen(true)}
              className="px-4 py-2 rounded-full border border-[#0D0D0C]/20 hover:border-[#0D0D0C] text-xs font-medium text-[#0D0D0C] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] transition-all self-start sm:self-auto"
            >
              Adjust Budget
            </button>
          </div>
        )}

        {/* 3. The 4 Stat Cards */}
        <section>
          <StatsCards />
        </section>

        {/* 4. Safe-to-Spend Daily Meter & Payday Planner */}
        <section>
          <SafeToSpendMeter />
        </section>

        {/* 5. Payday Countdown & What-If Runway Widget */}
        <section>
          <PaydayWhatIfWidget />
        </section>

        {/* 6. Upcoming Recurring Bills & Debit Orders Timeline */}
        <section>
          <RecurringTimeline />
        </section>

        {/* 7. Visual Charts Grid (Category Donut & Daily Bar Flow) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryChart />
          <DailyChart />
        </section>

        {/* 8. Recent Transactions List */}
        <section>
          <TransactionsList limit={6} showViewAll={true} />
        </section>
      </div>
    </div>
  );
}
