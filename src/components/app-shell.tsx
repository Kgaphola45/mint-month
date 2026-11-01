"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useExpenseStore } from "@/store/useExpenseStore";
import { Navbar } from "./navbar";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getSupabaseCurrentUser } from "@/lib/supabase-sync";
import { storage } from "@/lib/storage";

// Dynamically import heavy modals & overlays to eliminate them from initial bundle
const CommandPalette = dynamic(
  () => import("./command-palette").then((m) => m.CommandPalette),
  { ssr: false }
);
const PurchaseSimulatorModal = dynamic(
  () => import("./purchase-simulator-modal").then((m) => m.PurchaseSimulatorModal),
  { ssr: false }
);
const EditorialStoryModal = dynamic(
  () => import("./editorial-story-modal").then((m) => m.EditorialStoryModal),
  { ssr: false }
);
const PaydayDigestModal = dynamic(
  () => import("./payday-digest-modal").then((m) => m.PaydayDigestModal),
  { ssr: false }
);
const QuickAddModal = dynamic(
  () => import("./quick-add-modal").then((m) => m.QuickAddModal),
  { ssr: false }
);
const BudgetModal = dynamic(
  () => import("./budget-modal").then((m) => m.BudgetModal),
  { ssr: false }
);
const DebtModal = dynamic(
  () => import("./debt-modal").then((m) => m.DebtModal),
  { ssr: false }
);
const PaydayModal = dynamic(
  () => import("./payday-modal").then((m) => m.PaydayModal),
  { ssr: false }
);
const AuthModal = dynamic(
  () => import("./auth-modal").then((m) => m.AuthModal),
  { ssr: false }
);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    initStore,
    isLoaded,
    digestModalOpen,
    setDigestModalOpen,
    currentUser,
    isAuthenticated,
  } = useExpenseStore();

  const [hasSupabaseSession, setHasSupabaseSession] = useState(false);

  useEffect(() => {
    initStore();

    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Verify Supabase session and ensure currentUser is populated
    supabase.auth.getUser().then(async ({ data, error }) => {
      if (!error && data?.user) {
        setHasSupabaseSession(true);
        const state = useExpenseStore.getState();
        if (!state.currentUser) {
          const supaUser = await getSupabaseCurrentUser();
          if (supaUser) {
            storage.setCurrentUser(supaUser);
            useExpenseStore.setState({
              currentUser: supaUser,
              isAuthenticated: true,
            });
            state.syncSupabaseData(supaUser.id);
          }
        }
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setHasSupabaseSession(Boolean(session?.user));
        if (session?.user) {
          const state = useExpenseStore.getState();
          if (!state.currentUser || state.currentUser.id !== session.user.id) {
            const supaUser = await getSupabaseCurrentUser();
            if (supaUser) {
              storage.setCurrentUser(supaUser);
              useExpenseStore.setState({
                currentUser: supaUser,
                isAuthenticated: true,
              });
              state.syncSupabaseData(supaUser.id);
            }
          }
        } else if (event === "SIGNED_OUT") {
          storage.logoutUser();
          useExpenseStore.setState({
            currentUser: null,
            isAuthenticated: false,
          });
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [initStore]);

  const isLoggedIn = Boolean(currentUser || isAuthenticated || hasSupabaseSession);
  const isLanding = pathname === "/" && !isLoggedIn;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF6EF] text-[#0D0D0C] relative selection:bg-[#0D0D0C]/10 selection:text-[#0D0D0C]">
      {/* Fine SVG fractal noise grain overlay */}
      <div className="fine-grain-overlay" aria-hidden="true" />

      {/* 80px tall hairline navbar - only rendered when authenticated or on subpages */}
      {!isLanding && <Navbar />}

      <main className={`flex-1 w-full ${isLanding ? "" : "pb-24 lg:pb-16"}`}>
        {isLoaded ? (
          children
        ) : (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 rounded-full border-2 border-[#0D0D0C] border-t-transparent animate-spin" />
          </div>
        )}
      </main>

      {/* Global Modals & Command Overlays (Loaded on demand) */}
      <CommandPalette />
      <QuickAddModal />
      <BudgetModal />
      <DebtModal />
      <PaydayModal />
      <PurchaseSimulatorModal />
      <EditorialStoryModal />
      <PaydayDigestModal
        open={digestModalOpen}
        onClose={() => setDigestModalOpen(false)}
      />
      <AuthModal />
    </div>
  );
}
