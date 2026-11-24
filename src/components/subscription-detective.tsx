"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import {
  Search,
  Plus,
  Tv,
  Music,
  Dumbbell,
  Wifi,
  Bot,
  Shield,
  Gamepad2,
  MoreHorizontal,
  ExternalLink,
  AlertTriangle,
  TrendingUp,
  X,
  Check,
  Edit2,
  Trash2,
  HelpCircle,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Flame,
  Calendar,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { Subscription, SubscriptionCategory } from "@/types";
import { formatCurrency } from "@/lib/utils";

// South African & Global Popular Subscription Presets
interface SubscriptionPreset {
  name: string;
  monthlyAmount: number;
  category: SubscriptionCategory;
  billingDay: number;
  previousAmount?: number;
  cancellationUrl?: string;
  cancellationNotes: string;
}

const POPULAR_PRESETS: SubscriptionPreset[] = [
  {
    name: "Netflix Standard",
    monthlyAmount: 199,
    category: "Streaming & TV",
    billingDay: 25,
    cancellationUrl: "https://www.netflix.com/youraccount",
    cancellationNotes: "Cancel online anytime under Account > Cancel Membership. You will retain access until the end of the current billing cycle.",
  },
  {
    name: "Showmax Entertainment",
    monthlyAmount: 115,
    previousAmount: 99,
    category: "Streaming & TV",
    billingDay: 25,
    cancellationUrl: "https://www.showmax.com/account",
    cancellationNotes: "Log in, go to Plans & Payment, select your active subscription and click Cancel. Price increased from R99 to R115.",
  },
  {
    name: "Spotify Premium",
    monthlyAmount: 69.99,
    category: "Music & Audio",
    billingDay: 1,
    cancellationUrl: "https://www.spotify.com/account/change-plan/",
    cancellationNotes: "Under 'Your plan' click Change Plan, scroll down to Spotify Free, and click Cancel Premium.",
  },
  {
    name: "YouTube Premium",
    monthlyAmount: 71.99,
    category: "Streaming & TV",
    billingDay: 10,
    cancellationUrl: "https://www.youtube.com/paid_memberships",
    cancellationNotes: "Visit Paid Memberships, select Manage, and choose Deactivate.",
  },
  {
    name: "Virgin Active Gym",
    monthlyAmount: 650,
    category: "Fitness & Health",
    billingDay: 1,
    cancellationNotes: "Requires 1 calendar month written notice submitted in person or via email to your home club manager.",
  },
  {
    name: "Planet Fitness",
    monthlyAmount: 499,
    category: "Fitness & Health",
    billingDay: 1,
    cancellationNotes: "Requires 30 days written notice to member services. Early cancellation may incur an administration fee.",
  },
  {
    name: "Afrihost Pure Fibre",
    monthlyAmount: 847,
    category: "Connectivity & WiFi",
    billingDay: 1,
    cancellationUrl: "https://clientzone.afrihost.com",
    cancellationNotes: "Cancel via ClientZone > Connectivity. Cancellation request must be logged before the 23rd of the month to avoid next billing.",
  },
  {
    name: "ChatGPT Plus",
    monthlyAmount: 380,
    category: "Software & AI",
    billingDay: 15,
    cancellationUrl: "https://chatgpt.com/#settings/Subscription",
    cancellationNotes: "In ChatGPT, open Settings > Subscription > Manage Subscription > Cancel Plan.",
  },
  {
    name: "Apple One / Music",
    monthlyAmount: 79,
    category: "Music & Audio",
    billingDay: 18,
    cancellationUrl: "https://account.apple.com",
    cancellationNotes: "On iPhone/Mac: Settings > Apple ID > Subscriptions > Cancel Subscription.",
  },
  {
    name: "DStv Stream Compact",
    monthlyAmount: 299,
    category: "Streaming & TV",
    billingDay: 1,
    cancellationUrl: "https://www.dstv.com/en-za/my-dstv/manage",
    cancellationNotes: "Manage via MyDStv portal. Cancel at least 48 hours before monthly renewal.",
  },
  {
    name: "Naked Car / Home Insurance",
    monthlyAmount: 720,
    category: "Insurance & Finance",
    cancellationUrl: "https://www.naked.insure/app",
    billingDay: 1,
    cancellationNotes: "Pause or cancel instantly inside the Naked mobile app without phone calls or cancellation penalties.",
  },
];

const CATEGORIES: SubscriptionCategory[] = [
  "Streaming & TV",
  "Music & Audio",
  "Fitness & Health",
  "Connectivity & WiFi",
  "Software & AI",
  "Insurance & Finance",
  "Gaming & Cloud",
  "Other",
];

function getCategoryIcon(category: SubscriptionCategory) {
  switch (category) {
    case "Streaming & TV":
      return Tv;
    case "Music & Audio":
      return Music;
    case "Fitness & Health":
      return Dumbbell;
    case "Connectivity & WiFi":
      return Wifi;
    case "Software & AI":
      return Bot;
    case "Insurance & Finance":
      return Shield;
    case "Gaming & Cloud":
      return Gamepad2;
    default:
      return MoreHorizontal;
  }
}

export function SubscriptionDetective() {
  const {
    subscriptions,
    currency,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionForgotten,
    getSubscriptionSummary,
  } = useExpenseStore();

  const [activeFilter, setActiveFilter] = useState<"all" | "forgotten" | "priceHikes">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  // Cancellation helper dialog state
  const [cancellingSub, setCancellingSub] = useState<Subscription | null>(null);

  // Native dialog refs for modern web compliance
  const formDialogRef = useRef<HTMLDialogElement>(null);
  const cancelDialogRef = useRef<HTMLDialogElement>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    monthlyAmount: string;
    category: SubscriptionCategory;
    billingDay: number;
    previousAmount: string;
    isForgotten: boolean;
    cancellationUrl: string;
    cancellationNotes: string;
  }>({
    name: "",
    monthlyAmount: "",
    category: "Streaming & TV",
    billingDay: 1,
    previousAmount: "",
    isForgotten: false,
    cancellationUrl: "",
    cancellationNotes: "",
  });

  const formTitleId = useId();
  const cancelTitleId = useId();

  const summary = getSubscriptionSummary();

  // Control Form Dialog via native showModal()
  useEffect(() => {
    const dialog = formDialogRef.current;
    if (!dialog) return;

    if (isModalOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isModalOpen]);

  // Control Cancellation Dialog via native showModal()
  useEffect(() => {
    const dialog = cancelDialogRef.current;
    if (!dialog) return;

    if (cancellingSub) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [cancellingSub]);

  const openAddModal = (preset?: SubscriptionPreset) => {
    setEditingSub(null);
    if (preset) {
      setFormData({
        name: preset.name,
        monthlyAmount: preset.monthlyAmount.toString(),
        category: preset.category,
        billingDay: preset.billingDay,
        previousAmount: preset.previousAmount ? preset.previousAmount.toString() : "",
        isForgotten: false,
        cancellationUrl: preset.cancellationUrl || "",
        cancellationNotes: preset.cancellationNotes || "",
      });
    } else {
      setFormData({
        name: "",
        monthlyAmount: "",
        category: "Streaming & TV",
        billingDay: 1,
        previousAmount: "",
        isForgotten: false,
        cancellationUrl: "",
        cancellationNotes: "",
      });
    }
    setIsModalOpen(true);
  };

  const openEditModal = (sub: Subscription) => {
    setEditingSub(sub);
    setFormData({
      name: sub.name,
      monthlyAmount: sub.monthlyAmount.toString(),
      category: sub.category,
      billingDay: sub.billingDay,
      previousAmount: sub.previousAmount ? sub.previousAmount.toString() : "",
      isForgotten: Boolean(sub.isForgotten),
      cancellationUrl: sub.cancellationUrl || "",
      cancellationNotes: sub.cancellationNotes || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.monthlyAmount);
    if (!formData.name.trim() || isNaN(amount) || amount <= 0) return;

    const previousAmount = formData.previousAmount ? parseFloat(formData.previousAmount) : undefined;

    if (editingSub) {
      updateSubscription(editingSub.id, {
        name: formData.name.trim(),
        monthlyAmount: amount,
        category: formData.category,
        billingDay: formData.billingDay,
        previousAmount: previousAmount && !isNaN(previousAmount) ? previousAmount : undefined,
        isForgotten: formData.isForgotten,
        cancellationUrl: formData.cancellationUrl.trim() || undefined,
        cancellationNotes: formData.cancellationNotes.trim() || undefined,
      });
    } else {
      addSubscription({
        name: formData.name.trim(),
        monthlyAmount: amount,
        category: formData.category,
        billingDay: formData.billingDay,
        previousAmount: previousAmount && !isNaN(previousAmount) ? previousAmount : undefined,
        isForgotten: formData.isForgotten,
        cancellationUrl: formData.cancellationUrl.trim() || undefined,
        cancellationNotes: formData.cancellationNotes.trim() || undefined,
        isActive: true,
      });
    }

    setIsModalOpen(false);
  };

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (!sub.isActive) return false;
    if (activeFilter === "forgotten" && !sub.isForgotten) return false;
    if (activeFilter === "priceHikes") {
      const hasHike = sub.previousAmount && sub.monthlyAmount > sub.previousAmount;
      if (!hasHike) return false;
    }
    if (selectedCategory !== "all" && sub.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="w-full bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] rounded-[28px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-7">
      {/* 1. Header with Sherlock / Detective Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#0D0D0C]/[0.06]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6DE68]/30 border border-[#F6DE68]/70 text-[#0D0D0C] text-[11px] font-semibold tracking-wide uppercase mb-2">
            <Search className="w-3.5 h-3.5 stroke-[2.2] text-[#8B6D1B]" />
            <span>Subscription Detective</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C]">
            Recurring Subscriptions & Hidden Leaks
          </h2>
          <p className="text-xs sm:text-sm text-[#0D0D0C]/60 mt-1 max-w-xl">
            Audit your true monthly and annual drain across streaming, gym, WiFi, and software. Flag forgotten services and track silent price increases.
          </p>
        </div>

        <button
          onClick={() => openAddModal()}
          className="h-10 px-4 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs font-medium inline-flex items-center gap-2 hover:bg-[#0D0D0C]/90 transition-all shadow-sm shrink-0 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* 2. Key Metric Cards (Vela Editorial Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Monthly Total */}
        <div className="p-4 rounded-2xl bg-[#FBF6EF]/70 border border-[#0D0D0C]/[0.06]">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#0D0D0C]/50 block">
            Monthly Subscription Total
          </span>
          <div className="text-xl sm:text-2xl font-serif font-semibold text-[#0D0D0C] mt-1">
            {formatCurrency(summary.totalMonthly, currency)}
            <span className="text-xs font-sans font-normal text-[#0D0D0C]/50 ml-1">/mo</span>
          </div>
          <p className="text-[11px] text-[#0D0D0C]/60 mt-1">
            Across {summary.activeCount} active recurring services
          </p>
        </div>

        {/* Metric 2: Annual Outflow (The big eye-opener) */}
        <div className="p-4 rounded-2xl bg-[#0D0D0C] text-[#FFFDFA] shadow-sm">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#FFFDFA]/60 block flex items-center justify-between">
            <span>Annual Cumulative Drain</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </span>
          <div className="text-xl sm:text-2xl font-serif font-semibold text-[#FFFDFA] mt-1">
            {formatCurrency(summary.totalAnnual, currency)}
            <span className="text-xs font-sans font-normal text-[#FFFDFA]/60 ml-1">/year</span>
          </div>
          <p className="text-[11px] text-[#FFFDFA]/70 mt-1">
            What you actually pay per year on subscriptions
          </p>
        </div>

        {/* Metric 3: Forgotten / Leak Alert */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            summary.forgottenCount > 0
              ? "bg-rose-50/70 border-rose-200 text-rose-950"
              : "bg-[#FBF6EF]/70 border-[#0D0D0C]/[0.06] text-[#0D0D0C]"
          }`}
        >
          <span className="text-[11px] font-medium uppercase tracking-wider opacity-70 block flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Forgotten Service Leak</span>
          </span>
          <div className="text-xl sm:text-2xl font-serif font-semibold mt-1">
            {summary.forgottenCount > 0
              ? formatCurrency(summary.forgottenAnnualSavings, currency)
              : "R0.00"}
            <span className="text-xs font-sans font-normal opacity-70 ml-1">
              {summary.forgottenCount > 0 ? "/yr leak" : "waste"}
            </span>
          </div>
          <p className="text-[11px] opacity-80 mt-1">
            {summary.forgottenCount > 0
              ? `${summary.forgottenCount} service(s) flagged for cancellation`
              : "No forgotten services flagged"}
          </p>
        </div>

        {/* Metric 4: Price Hike Alert */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            summary.priceHikedCount > 0
              ? "bg-amber-50/70 border-amber-200 text-amber-950"
              : "bg-[#FBF6EF]/70 border-[#0D0D0C]/[0.06] text-[#0D0D0C]"
          }`}
        >
          <span className="text-[11px] font-medium uppercase tracking-wider opacity-70 block flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            <span>Price Increases Tracked</span>
          </span>
          <div className="text-xl sm:text-2xl font-serif font-semibold mt-1">
            {summary.priceHikedCount > 0
              ? `+${formatCurrency(summary.totalPriceHikeAnnualImpact, currency)}`
              : "R0.00"}
            <span className="text-xs font-sans font-normal opacity-70 ml-1">/yr impact</span>
          </div>
          <p className="text-[11px] opacity-80 mt-1">
            {summary.priceHikedCount > 0
              ? `${summary.priceHikedCount} subscription price hike(s) detected`
              : "All subscriptions at baseline prices"}
          </p>
        </div>
      </div>

      {/* 3. Popular Presets Ribbon (Fast 1-click addition) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#0D0D0C]/60">
          <span className="font-medium text-[#0D0D0C]">Quick Add Popular South African Services:</span>
          <span className="text-[11px]">Click preset to pre-fill</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {POPULAR_PRESETS.slice(0, 7).map((preset) => (
            <button
              key={preset.name}
              onClick={() => openAddModal(preset)}
              className="px-3 py-1.5 rounded-full bg-[#FBF6EF] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] border border-[#0D0D0C]/[0.08] text-xs font-medium text-[#0D0D0C] transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3 h-3 opacity-60" />
              <span>{preset.name}</span>
              <span className="text-[10px] opacity-60">({formatCurrency(preset.monthlyAmount, currency)})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Filter Tabs & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[#FBF6EF] p-1 rounded-full border border-[#0D0D0C]/[0.08] shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              activeFilter === "all"
                ? "bg-[#0D0D0C] text-[#FFFDFA] shadow-xs"
                : "text-[#0D0D0C]/70 hover:text-[#0D0D0C]"
            }`}
          >
            All ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveFilter("forgotten")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeFilter === "forgotten"
                ? "bg-rose-700 text-[#FFFDFA] shadow-xs"
                : "text-[#0D0D0C]/70 hover:text-[#0D0D0C]"
            }`}
          >
            <span>⚠️ Forgotten / Review</span>
            {summary.forgottenCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-900 text-[10px] font-bold flex items-center justify-center">
                {summary.forgottenCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveFilter("priceHikes")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeFilter === "priceHikes"
                ? "bg-amber-700 text-[#FFFDFA] shadow-xs"
                : "text-[#0D0D0C]/70 hover:text-[#0D0D0C]"
            }`}
          >
            <span>📈 Price Increases</span>
            {summary.priceHikedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold flex items-center justify-center">
                {summary.priceHikedCount}
              </span>
            )}
          </button>
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#0D0D0C]/50">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FFFDFA] text-[#0D0D0C] focus:outline-none focus:ring-1 focus:ring-[#0D0D0C]"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5. Subscriptions Directory List */}
      {filteredSubscriptions.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[#FBF6EF]/50 border border-dashed border-[#0D0D0C]/[0.1] space-y-3">
          <ShieldAlert className="w-8 h-8 text-[#0D0D0C]/40 mx-auto" />
          <h3 className="font-serif text-lg font-medium text-[#0D0D0C]">No subscriptions found in this view</h3>
          <p className="text-xs text-[#0D0D0C]/60 max-w-sm mx-auto">
            {activeFilter === "forgotten"
              ? "Good job! You have zero forgotten or wasteful subscriptions flagged."
              : activeFilter === "priceHikes"
              ? "None of your tracked subscriptions have logged price hikes."
              : "Add your recurring subscriptions above to begin tracking monthly and annual totals."}
          </p>
          <button
            onClick={() => openAddModal()}
            className="px-4 py-2 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs font-medium inline-flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subscription</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubscriptions.map((sub) => {
            const Icon = getCategoryIcon(sub.category);
            const annualCost = sub.monthlyAmount * 12;
            const hasHike = sub.previousAmount && sub.monthlyAmount > sub.previousAmount;
            const hikeDiff = hasHike ? sub.monthlyAmount - (sub.previousAmount || 0) : 0;
            const hikePercent = hasHike && sub.previousAmount
              ? Math.round((hikeDiff / sub.previousAmount) * 100)
              : 0;

            return (
              <div
                key={sub.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  sub.isForgotten
                    ? "bg-rose-50/30 border-rose-200/80 shadow-[0_2px_12px_rgba(225,29,72,0.04)]"
                    : "bg-[#FFFDFA] border-[#0D0D0C]/[0.08] hover:border-[#0D0D0C]/[0.2] shadow-xs"
                }`}
              >
                {/* Top Section */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] flex items-center justify-center text-[#0D0D0C] shrink-0">
                        <Icon className="w-4 h-4 stroke-[1.8]" />
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-medium text-[#0D0D0C] leading-tight">
                          {sub.name}
                        </h4>
                        <span className="text-[11px] text-[#0D0D0C]/50 flex items-center gap-1 mt-0.5">
                          <span>{sub.category}</span>
                          <span>•</span>
                          <span>Billed {sub.billingDay}th</span>
                        </span>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(sub)}
                        className="p-1.5 rounded-full hover:bg-[#0D0D0C]/[0.05] text-[#0D0D0C]/50 hover:text-[#0D0D0C] transition-colors"
                        title="Edit subscription"
                        aria-label="Edit subscription"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${sub.name} from Subscription Detective?`)) {
                            deleteSubscription(sub.id);
                          }
                        }}
                        className="p-1.5 rounded-full hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors"
                        title="Delete subscription"
                        aria-label="Delete subscription"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Pricing Matrix: Monthly & Annual */}
                  <div className="p-3 rounded-xl bg-[#FBF6EF]/60 border border-[#0D0D0C]/[0.05] flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-[#0D0D0C]/50 block">
                        Monthly
                      </span>
                      <div className="text-base font-serif font-medium text-[#0D0D0C]">
                        {formatCurrency(sub.monthlyAmount, currency)}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-[#0D0D0C]/50 block">
                        Annual Total
                      </span>
                      <div className="text-base font-serif font-semibold text-[#0D0D0C]">
                        {formatCurrency(annualCost, currency)}
                        <span className="text-[11px] font-sans font-normal text-[#0D0D0C]/50 ml-0.5">/yr</span>
                      </div>
                    </div>
                  </div>

                  {/* Price Hike Warning Banner */}
                  {hasHike && (
                    <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-between text-[11px] text-amber-900">
                      <span className="flex items-center gap-1 font-medium">
                        <TrendingUp className="w-3 h-3 text-amber-600" />
                        <span>Price Hike: +{formatCurrency(hikeDiff, currency)}/mo (+{hikePercent}%)</span>
                      </span>
                      <span className="text-[10px] text-amber-700/80">
                        +{formatCurrency(hikeDiff * 12, currency)}/yr
                      </span>
                    </div>
                  )}

                  {/* Forgotten / Leak Badge */}
                  {sub.isForgotten && (
                    <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between text-[11px] text-rose-900">
                      <span className="flex items-center gap-1 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Flagged as Forgotten</span>
                      </span>
                      <span className="text-[10px] font-semibold text-rose-700">
                        Save {formatCurrency(annualCost, currency)}/yr
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Controls: Forgotten Toggle & Cancel Button */}
                <div className="pt-2 border-t border-[#0D0D0C]/[0.05] flex items-center justify-between gap-2">
                  {/* Toggle Forgotten */}
                  <button
                    onClick={() => toggleSubscriptionForgotten(sub.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all inline-flex items-center gap-1 border ${
                      sub.isForgotten
                        ? "bg-rose-100/70 border-rose-300 text-rose-900 hover:bg-rose-200"
                        : "bg-transparent border-[#0D0D0C]/[0.1] text-[#0D0D0C]/60 hover:text-[#0D0D0C] hover:border-[#0D0D0C]/[0.2]"
                    }`}
                    title={sub.isForgotten ? "Mark as actively used" : "Flag as forgotten / unused"}
                  >
                    {sub.isForgotten ? (
                      <>
                        <Check className="w-3 h-3 text-rose-700" />
                        <span>Forgotten</span>
                      </>
                    ) : (
                      <>
                        <HelpCircle className="w-3 h-3" />
                        <span>Review</span>
                      </>
                    )}
                  </button>

                  {/* Direct Cancellation / Cancellation Assistant */}
                  <div className="flex items-center gap-1.5">
                    {sub.cancellationUrl ? (
                      <a
                        href={sub.cancellationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-full bg-[#0D0D0C] hover:bg-[#0D0D0C]/80 text-[#FFFDFA] text-[11px] font-medium inline-flex items-center gap-1 transition-all shadow-xs"
                      >
                        <span>Cancel</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    ) : (
                      <button
                        onClick={() => setCancellingSub(sub)}
                        className="px-3 py-1 rounded-full bg-[#FBF6EF] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] border border-[#0D0D0C]/[0.1] text-[11px] font-medium text-[#0D0D0C] transition-all inline-flex items-center gap-1"
                      >
                        <span>Cancel Info</span>
                      </button>
                    )}

                    {sub.cancellationNotes && sub.cancellationUrl && (
                      <button
                        onClick={() => setCancellingSub(sub)}
                        className="p-1 rounded-full hover:bg-[#0D0D0C]/[0.05] text-[#0D0D0C]/50 hover:text-[#0D0D0C]"
                        title="View cancellation terms"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Native <dialog> Modal for Adding / Editing Subscriptions */}
      <dialog
        ref={formDialogRef}
        aria-labelledby={formTitleId}
        onClick={(e) => {
          // Light dismiss on backdrop click
          if (e.target === formDialogRef.current) {
            setIsModalOpen(false);
          }
        }}
        onCancel={() => setIsModalOpen(false)}
        className="vela-native-dialog m-auto"
      >
        <div className="p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#0D0D0C]/[0.08]">
            <div>
              <h3 id={formTitleId} className="font-serif text-xl font-medium text-[#0D0D0C]">
                {editingSub ? "Edit Subscription" : "Add Recurring Subscription"}
              </h3>
              <p className="text-xs text-[#0D0D0C]/50 mt-0.5">
                Track monthly cost, annual burn, and cancellation instructions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-8 h-8 rounded-full border border-[#0D0D0C]/[0.1] flex items-center justify-center text-[#0D0D0C]/60 hover:text-[#0D0D0C] hover:bg-[#0D0D0C]/[0.05] transition-all"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Service Name */}
            <div>
              <label className="block text-xs font-medium text-[#0D0D0C]/80 mb-1">
                Subscription / Service Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Netflix, Spotify, Virgin Active, Afrihost"
                className="w-full px-3.5 py-2 rounded-xl border border-[#0D0D0C]/[0.15] bg-[#FBF6EF]/50 text-sm text-[#0D0D0C] focus:outline-none focus:ring-1 focus:ring-[#0D0D0C]"
              />
            </div>

            {/* Monthly Amount & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#0D0D0C]/80 mb-1">
                  Monthly Cost (ZAR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={formData.monthlyAmount}
                  onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })}
                  placeholder="199.00"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#0D0D0C]/[0.15] bg-[#FBF6EF]/50 text-sm text-[#0D0D0C] focus:outline-none focus:ring-1 focus:ring-[#0D0D0C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0D0D0C]/80 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as SubscriptionCategory })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#0D0D0C]/[0.15] bg-[#FBF6EF]/50 text-sm text-[#0D0D0C] focus:outline-none focus:ring-1 focus:ring-[#0D0D0C]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Billing Day & Previous Amount (Price Hike Tracking) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#0D0D0C]/80 mb-1">
                  Billing Day of Month
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={formData.billingDay}
                  onChange={(e) =>
                    setFormData({ ...formData, billingDay: parseInt(e.target.value, 10) || 1 })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#0D0D0C]/[0.15] bg-[#FBF6EF]/50 text-sm text-[#0D0D0C] focus:outline-none focus:ring-1 focus:ring-[#0D0D0C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0D0D0C]/80 mb-1">
                  Previous Amount (For Price Hikes)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.previousAmount}
                  onChange={(e) => setFormData({ ...formData, previousAmount: e.target.value })}
                  placeholder="e.g. 159 (Optional)"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#0D0D0C]/[0.15] bg-[#FBF6EF]/50 text-sm text-[#0D0D0C] focus:outline-none focus:ring-1 focus:ring-[#0D0D0C]"
                />
              </div>
            </div>

            {/* Direct Cancellation URL */}
            <div>
              <label className="block text-xs font-medium text-[#0D0D0C]/80 mb-1">
                Direct Cancellation Link (Optional)
              </label>
              <input
                type="url"
                value={formData.cancellationUrl}
                onChange={(e) => setFormData({ ...formData, cancellationUrl: e.target.value })}
                placeholder="https://www.netflix.com/youraccount"
                className="w-full px-3.5 py-2 rounded-xl border border-[#0D0D0C]/[0.15] bg-[#FBF6EF]/50 text-sm text-[#0D0D0C] focus:outline-none focus:ring-1 focus:ring-[#0D0D0C]"
              />
            </div>

            {/* Cancellation Notes / Notice Period */}
            <div>
              <label className="block text-xs font-medium text-[#0D0D0C]/80 mb-1">
                Cancellation Notes & Notice Rules (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.cancellationNotes}
                onChange={(e) => setFormData({ ...formData, cancellationNotes: e.target.value })}
                placeholder="e.g. Requires 30 days notice to gym manager; or cancel via App Store"
                className="w-full px-3.5 py-2 rounded-xl border border-[#0D0D0C]/[0.15] bg-[#FBF6EF]/50 text-sm text-[#0D0D0C] focus:outline-none focus:ring-1 focus:ring-[#0D0D0C]"
              />
            </div>

            {/* Forgotten / Audit Flag Toggle */}
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-amber-950 block">
                  Flag as Forgotten / Low Usage?
                </span>
                <span className="text-[11px] text-amber-800/80">
                  Adds service to your audit leak queue to save money.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.isForgotten}
                onChange={(e) => setFormData({ ...formData, isForgotten: e.target.checked })}
                className="w-4 h-4 rounded text-[#0D0D0C] border-gray-300 focus:ring-black cursor-pointer"
              />
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#0D0D0C]/[0.08]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-full border border-[#0D0D0C]/[0.1] text-xs font-medium text-[#0D0D0C]/70 hover:text-[#0D0D0C] hover:bg-[#0D0D0C]/[0.05]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs font-medium hover:bg-[#0D0D0C]/90 shadow-sm transition-all"
              >
                {editingSub ? "Save Changes" : "Add to Detective"}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* 7. Native <dialog> Modal for Cancellation Terms & Assistant */}
      <dialog
        ref={cancelDialogRef}
        aria-labelledby={cancelTitleId}
        onClick={(e) => {
          if (e.target === cancelDialogRef.current) {
            setCancellingSub(null);
          }
        }}
        onCancel={() => setCancellingSub(null)}
        className="vela-native-dialog max-w-md m-auto"
      >
        {cancellingSub && (
          <div className="p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#0D0D0C]/[0.08]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 id={cancelTitleId} className="font-serif text-lg font-medium text-[#0D0D0C]">
                  Cancel {cancellingSub.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCancellingSub(null)}
                className="w-8 h-8 rounded-full border border-[#0D0D0C]/[0.1] flex items-center justify-center text-[#0D0D0C]/60 hover:text-[#0D0D0C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-950">
                <span className="text-[11px] font-semibold uppercase tracking-wider block text-rose-800">
                  Potential Savings
                </span>
                <div className="text-xl font-serif font-semibold mt-0.5">
                  Save {formatCurrency(cancellingSub.monthlyAmount * 12, currency)} / year
                </div>
                <p className="text-xs text-rose-900/80 mt-1">
                  Cancelling this service frees up {formatCurrency(cancellingSub.monthlyAmount, currency)} every single month.
                </p>
              </div>

              {cancellingSub.cancellationNotes ? (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-[#0D0D0C]">
                    Cancellation Instructions & Notice Terms:
                  </span>
                  <div className="p-3.5 rounded-xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] text-xs text-[#0D0D0C]/80 leading-relaxed whitespace-pre-wrap">
                    {cancellingSub.cancellationNotes}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#0D0D0C]/60">
                  No custom notes entered for this service. You can update this by editing the subscription.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#0D0D0C]/[0.08]">
              <button
                type="button"
                onClick={() => setCancellingSub(null)}
                className="px-4 py-2 rounded-full border border-[#0D0D0C]/[0.1] text-xs font-medium text-[#0D0D0C]/70 hover:text-[#0D0D0C]"
              >
                Close
              </button>

              {cancellingSub.cancellationUrl ? (
                <a
                  href={cancellingSub.cancellationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs font-medium inline-flex items-center gap-1.5 shadow-sm hover:bg-[#0D0D0C]/90"
                >
                  <span>Open Cancellation Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    toggleSubscriptionForgotten(cancellingSub.id);
                    setCancellingSub(null);
                  }}
                  className="px-4 py-2 rounded-full bg-rose-600 text-[#FFFDFA] text-xs font-medium hover:bg-rose-700"
                >
                  {cancellingSub.isForgotten ? "Keep Flagged" : "Flag as Forgotten"}
                </button>
              )}
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
