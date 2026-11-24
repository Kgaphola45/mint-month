"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import confetti from "canvas-confetti";
import {
  Car,
  Building2,
  Home,
  ShieldCheck,
  Plane,
  CreditCard,
  Sparkles,
  Plus,
  ArrowUpRight,
  Sliders,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  HelpCircle,
  Coins,
  TrendingUp,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { LifeGoal, LifeGoalCategory, GoalFeasibility } from "@/types";
import { formatCurrency } from "@/lib/utils";

function getGoalIcon(cat: LifeGoalCategory) {
  switch (cat) {
    case "car":
      return Car;
    case "apartment":
      return Building2;
    case "house":
      return Home;
    case "emergency":
      return ShieldCheck;
    case "travel":
      return Plane;
    case "debt_free":
      return CreditCard;
    default:
      return Sparkles;
  }
}

const GOAL_TEMPLATES: Array<{
  category: LifeGoalCategory;
  title: string;
  defaultAmount: number;
  monthsAhead: number;
  notes: string;
}> = [
  {
    category: "car",
    title: "Buy a Car / Vehicle Deposit",
    defaultAmount: 65000,
    monthsAhead: 18,
    notes: "Ring-fenced deposit or cash purchase fund for a reliable vehicle.",
  },
  {
    category: "apartment",
    title: "Move into an Apartment",
    defaultAmount: 35000,
    monthsAhead: 10,
    notes: "Covers 2 months lease deposit, moving truck, and basic setup essentials.",
  },
  {
    category: "house",
    title: "Buy a House / Home Deposit",
    defaultAmount: 180000,
    monthsAhead: 36,
    notes: "10% home loan deposit, bond registration, and SARS transfer duty.",
  },
  {
    category: "emergency",
    title: "Build 3-Month Emergency Cushion",
    defaultAmount: 45000,
    monthsAhead: 14,
    notes: "Liquid reserve covering 3 months of essential fixed and living expenses.",
  },
  {
    category: "travel",
    title: "Holiday & Travel Adventure",
    defaultAmount: 30000,
    monthsAhead: 12,
    notes: "Return flights, accommodation, visa fees, and travel insurance.",
  },
  {
    category: "debt_free",
    title: "Pay Off All Debt Contracts",
    defaultAmount: 50000,
    monthsAhead: 15,
    notes: "Complete settlement fund for store cards, personal loans, and financing.",
  },
];

export function FinancialGoalRoadmap() {
  const {
    currency,
    lifeGoals,
    addLifeGoal,
    updateLifeGoal,
    deleteLifeGoal,
    contributeToLifeGoal,
    getGoalRoadmapSummary,
  } = useExpenseStore();

  const [extraSavingsShift, setExtraSavingsShift] = useState(500);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<LifeGoal | null>(null);

  // Contribute quick modal
  const [contributeGoal, setContributeGoal] = useState<LifeGoal | null>(null);
  const [contributeAmount, setContributeAmount] = useState("");

  const formDialogRef = useRef<HTMLDialogElement>(null);
  const contributeDialogRef = useRef<HTMLDialogElement>(null);
  const formTitleId = useId();
  const contributeTitleId = useId();

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    category: LifeGoalCategory;
    targetAmount: string;
    currentSaved: string;
    targetDate: string;
    monthlyContribution: string;
    notes: string;
  }>({
    title: "",
    category: "car",
    targetAmount: "",
    currentSaved: "0",
    targetDate: "",
    monthlyContribution: "",
    notes: "",
  });

  const summary = getGoalRoadmapSummary(extraSavingsShift);

  // Native <dialog> control with light-dismiss compliance
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

  useEffect(() => {
    const dialog = contributeDialogRef.current;
    if (!dialog) return;

    if (contributeGoal) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [contributeGoal]);

  const openAddModal = (template?: (typeof GOAL_TEMPLATES)[0]) => {
    setEditingGoal(null);
    const now = new Date();
    const monthsAhead = template ? template.monthsAhead : 18;
    const targetDateObj = new Date(now.getFullYear(), now.getMonth() + monthsAhead, 1);
    const targetDateStr = `${targetDateObj.getFullYear()}-${String(
      targetDateObj.getMonth() + 1
    ).padStart(2, "0")}`;

    if (template) {
      const needed = template.defaultAmount;
      const monthly = Math.ceil(needed / monthsAhead);
      setFormData({
        title: template.title,
        category: template.category,
        targetAmount: template.defaultAmount.toString(),
        currentSaved: "0",
        targetDate: targetDateStr,
        monthlyContribution: monthly.toString(),
        notes: template.notes,
      });
    } else {
      setFormData({
        title: "",
        category: "car",
        targetAmount: "",
        currentSaved: "0",
        targetDate: targetDateStr,
        monthlyContribution: "",
        notes: "",
      });
    }
    setIsModalOpen(true);
  };

  const openEditModal = (goal: LifeGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      category: goal.category,
      targetAmount: goal.targetAmount.toString(),
      currentSaved: goal.currentSaved.toString(),
      targetDate: goal.targetDate || "",
      monthlyContribution: goal.monthlyContribution ? goal.monthlyContribution.toString() : "",
      notes: goal.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmount = parseFloat(formData.targetAmount);
    const currentSaved = parseFloat(formData.currentSaved) || 0;
    const monthlyContribution = formData.monthlyContribution
      ? parseFloat(formData.monthlyContribution)
      : undefined;

    if (!formData.title.trim() || isNaN(targetAmount) || targetAmount <= 0) return;

    if (editingGoal) {
      updateLifeGoal(editingGoal.id, {
        title: formData.title.trim(),
        category: formData.category,
        targetAmount,
        currentSaved,
        targetDate: formData.targetDate || undefined,
        monthlyContribution: monthlyContribution && !isNaN(monthlyContribution) ? monthlyContribution : undefined,
        notes: formData.notes.trim() || undefined,
        isCompleted: currentSaved >= targetAmount,
      });
    } else {
      addLifeGoal({
        title: formData.title.trim(),
        category: formData.category,
        targetAmount,
        currentSaved,
        targetDate: formData.targetDate,
        monthlyContribution: monthlyContribution && !isNaN(monthlyContribution) ? monthlyContribution : undefined,
        notes: formData.notes.trim() || undefined,
        isCompleted: currentSaved >= targetAmount,
      });
    }

    setIsModalOpen(false);
  };

  const handleContributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoal) return;
    const amount = parseFloat(contributeAmount);
    if (isNaN(amount) || amount <= 0) return;

    contributeToLifeGoal(contributeGoal.id, amount);
    const willComplete = contributeGoal.currentSaved + amount >= contributeGoal.targetAmount;
    try {
      confetti({
        particleCount: willComplete ? 65 : 28,
        spread: willComplete ? 70 : 45,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }

    setContributeGoal(null);
    setContributeAmount("");
  };

  const getFeasibilityBadgeClass = (feasibility: GoalFeasibility) => {
    switch (feasibility) {
      case "realistic":
        return "bg-emerald-50 text-emerald-800 border-emerald-200/80";
      case "moderate":
        return "bg-sky-50 text-sky-800 border-sky-200/80";
      case "stretch":
        return "bg-amber-50 text-amber-900 border-amber-200/80";
      case "unrealistic":
        return "bg-rose-50 text-rose-900 border-rose-200/80";
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-7">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#0D0D0C]/[0.06]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] sm:text-[15px] font-normal text-[#0D0D0C]/56">
              Major Ambitions & Feasibility Roadmap
            </span>
            <span className="px-2.5 py-0.5 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FBF6EF] text-[11px] text-[#0D0D0C] font-normal">
              {summary.activeCount} Active · {summary.completedCount} Achieved
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C] mt-1 font-serif">
            Financial Goal Roadmap
          </h2>
          <p className="text-sm text-[#0D0D0C]/56 mt-1 max-w-2xl">
            Bridge everyday spending decisions with major life ambitions: buying a car, moving into an apartment, buying a house, travel, or becoming debt-free.
          </p>
        </div>

        <button
          onClick={() => openAddModal()}
          className="h-10 px-5 rounded-full bg-[#0D0D0C] hover:bg-[#0D0D0C]/90 text-[#FFFDFA] text-xs font-medium inline-flex items-center gap-2 transition-all shadow-sm shrink-0 self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Set Major Life Goal</span>
        </button>
      </div>

      {/* 2. Executive Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
          <span className="text-[12px] font-normal text-[#0D0D0C]/56 block">
            Total Target Capital
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-medium text-[#0D0D0C] mt-1">
            {formatCurrency(summary.totalTargetAmount, currency)}
          </div>
          <p className="text-[11px] text-[#0D0D0C]/50 mt-1">
            Across {summary.activeCount + summary.completedCount} planned ambitions
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D0D0C] text-[#FFFDFA] shadow-sm">
          <span className="text-[12px] font-normal text-[#FFFDFA]/60 block flex items-center justify-between">
            <span>Capital Funded So Far</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-medium text-[#FFFDFA] mt-1">
            {formatCurrency(summary.totalCurrentSaved, currency)}
            <span className="text-xs font-sans font-normal text-[#FFFDFA]/60 ml-1.5">
              ({summary.overallProgressPercent}%)
            </span>
          </div>
          <p className="text-[11px] text-[#FFFDFA]/70 mt-1">
            {formatCurrency(Math.max(0, summary.totalTargetAmount - summary.totalCurrentSaved), currency)} to go
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
          <span className="text-[12px] font-normal text-[#0D0D0C]/56 block">
            Combined Monthly Demand
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-medium text-[#0D0D0C] mt-1">
            {formatCurrency(summary.totalMonthlyRequired, currency)}
            <span className="text-xs font-sans font-normal text-[#0D0D0C]/50 ml-1">/mo</span>
          </div>
          <p className="text-[11px] text-[#0D0D0C]/50 mt-1">
            Needed to hit all goals on schedule
          </p>
        </div>

        <div
          className={`p-5 rounded-2xl border transition-all ${
            summary.capacityUtilizationPercent > 100
              ? "bg-rose-50/70 border-rose-200 text-rose-950"
              : summary.capacityUtilizationPercent > 70
              ? "bg-amber-50/70 border-amber-200 text-amber-950"
              : "bg-[#FBF6EF] border-[#0D0D0C]/[0.06] text-[#0D0D0C]"
          }`}
        >
          <span className="text-[12px] font-normal opacity-70 block flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Discretionary Squeeze</span>
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-medium mt-1">
            {summary.capacityUtilizationPercent}%
            <span className="text-xs font-sans font-normal opacity-70 ml-1">of surplus</span>
          </div>
          <p className="text-[11px] opacity-70 mt-1">
            {summary.capacityUtilizationPercent > 100
              ? "Goals exceed current monthly safe-to-spend pool"
              : `Leaves ${formatCurrency(
                  Math.max(0, summary.monthlySavingsCapacity - summary.totalMonthlyRequired),
                  currency
                )}/mo for living`}
          </p>
        </div>
      </div>

      {/* 3. Interactive Everyday Spending Impact Simulator (Modern Web Slider) */}
      {summary.activeCount > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0D0D0C]/50 block flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Everyday Spending Shift Simulator</span>
              </span>
              <h3 className="font-serif text-lg font-medium text-[#0D0D0C] mt-0.5">
                What if you cut dining or impulse shopping by +{formatCurrency(extraSavingsShift, currency)}/mo?
              </h3>
            </div>
            <div className="text-xs text-[#0D0D0C]/60 bg-[#FFFDFA] px-3 py-1.5 rounded-full border border-[#0D0D0C]/[0.08] self-start sm:self-auto">
              Simulating <strong className="text-[#0D0D0C]">+{formatCurrency(extraSavingsShift, currency)}</strong> monthly shift
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#0D0D0C]/60">
              <span>R0 (No extra savings)</span>
              <span>R1,500/mo</span>
              <span>R3,000/mo (High discipline)</span>
            </div>
            {/* Labeled native range input adhering to modern-web-guidance slider */}
            <input
              type="range"
              id="spending-shift-slider"
              min="0"
              max="3000"
              step="100"
              value={extraSavingsShift}
              onChange={(e) => setExtraSavingsShift(parseInt(e.target.value, 10) || 0)}
              aria-label="Everyday spending shift amount in South African Rands"
              aria-valuetext={`${formatCurrency(extraSavingsShift, currency)} per month`}
              className="w-full accent-[#0D0D0C] h-2 bg-[#0D0D0C]/[0.1] rounded-lg cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-[#FFFDFA] border border-[#0D0D0C]/[0.06] flex items-center justify-between text-xs text-[#0D0D0C]">
            <span className="flex items-center gap-1.5 font-normal text-[#0D0D0C]/70">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                By redirecting {formatCurrency(extraSavingsShift, currency)}/mo away from takeout and quick splurges:
              </span>
            </span>
            <span className="font-semibold text-emerald-800 shrink-0">
              Goals complete months earlier!
            </span>
          </div>
        </div>
      )}

      {/* 4. Life Goals Roadmap Cards */}
      {summary.goals.length === 0 ? (
        <div className="p-10 text-center rounded-[20px] bg-[#FBF6EF]/50 border border-dashed border-[#0D0D0C]/[0.12] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] flex items-center justify-center mx-auto text-[#0D0D0C]/50">
            <Sparkles className="w-5 h-5 stroke-[1.8]" />
          </div>
          <h3 className="font-serif text-lg font-medium text-[#0D0D0C]">
            No major life goals set yet
          </h3>
          <p className="text-xs sm:text-sm text-[#0D0D0C]/60 max-w-md mx-auto">
            Set your top life ambitions: buying a car, moving out, purchasing a house, travel, or becoming debt-free. Mint Month will calculate required monthly contributions and test feasibility.
          </p>
          <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
            {GOAL_TEMPLATES.slice(0, 4).map((tpl) => (
              <button
                key={tpl.title}
                onClick={() => openAddModal(tpl)}
                className="px-3 py-1.5 rounded-full bg-[#FFFDFA] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] border border-[#0D0D0C]/[0.1] text-xs font-medium text-[#0D0D0C] transition-all shadow-xs"
              >
                + {tpl.title}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {summary.goals.map((item) => {
            const { goal } = item;
            const Icon = getGoalIcon(goal.category);

            return (
              <div
                key={goal.id}
                className={`p-6 rounded-[22px] border transition-all flex flex-col justify-between space-y-4 ${
                  goal.isCompleted
                    ? "bg-emerald-50/30 border-emerald-200/80 shadow-xs"
                    : "bg-[#FFFDFA] border-[#0D0D0C]/[0.08] hover:border-[#0D0D0C]/[0.2] shadow-xs"
                }`}
              >
                {/* Card Top: Icon, Title & Feasibility Pill */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] flex items-center justify-center text-[#0D0D0C] shrink-0">
                        <Icon className="w-4 h-4 stroke-[1.8]" />
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-medium text-[#0D0D0C] leading-tight">
                          {goal.title}
                        </h4>
                        <span className="text-[11px] text-[#0D0D0C]/50 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {goal.isCompleted
                              ? "Achieved"
                              : `Target: ${item.estimatedCompletionDate}`}
                          </span>
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getFeasibilityBadgeClass(
                        item.feasibility
                      )}`}
                    >
                      {item.feasibilityLabel}
                    </span>
                  </div>

                  {/* Progress Matrix */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#0D0D0C]">
                        {formatCurrency(goal.currentSaved, currency)}
                        <span className="text-[#0D0D0C]/45 font-normal ml-1">
                          of {formatCurrency(goal.targetAmount, currency)}
                        </span>
                      </span>
                      <span className="font-serif font-semibold text-[#0D0D0C]">
                        {item.progressPercent}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-[#0D0D0C]/[0.07] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          goal.isCompleted ? "bg-emerald-600" : "bg-[#0D0D0C]"
                        }`}
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Monthly Demand & Horizon */}
                  {!goal.isCompleted && (
                    <div className="p-3 rounded-xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-[#0D0D0C]/50 block">
                          Monthly Savings Needed
                        </span>
                        <div className="text-sm font-serif font-medium text-[#0D0D0C]">
                          {formatCurrency(item.requiredMonthlySavings, currency)}
                          <span className="text-[11px] font-sans font-normal text-[#0D0D0C]/50">/mo</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-semibold text-[#0D0D0C]/50 block">
                          Horizon
                        </span>
                        <div className="text-sm font-serif font-medium text-[#0D0D0C]">
                          {item.monthsRemaining} months
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Impact of +R500 Extra Savings Shift */}
                  {!goal.isCompleted && extraSavingsShift > 0 && item.impactOfExtraSavings.monthsSaved > 0 && (
                    <div className="px-3 py-2 rounded-lg bg-emerald-50/70 border border-emerald-200/70 flex items-center justify-between text-[11px] text-emerald-950">
                      <span className="flex items-center gap-1 font-medium">
                        <Sparkles className="w-3 h-3 text-emerald-700" />
                        <span>Saves {item.impactOfExtraSavings.monthsSaved} month(s)</span>
                      </span>
                      <span className="text-emerald-800 text-[10px]">
                        Done by {item.impactOfExtraSavings.newCompletionDate}
                      </span>
                    </div>
                  )}

                  {/* Realism Advice */}
                  <p className="text-[11px] text-[#0D0D0C]/65 leading-relaxed pt-0.5">
                    {item.feasibilityAdvice}
                  </p>
                </div>

                {/* Card Controls */}
                <div className="pt-3 border-t border-[#0D0D0C]/[0.06] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(goal)}
                      className="p-1.5 rounded-full hover:bg-[#0D0D0C]/[0.05] text-[#0D0D0C]/50 hover:text-[#0D0D0C]"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove "${goal.title}" from your roadmap?`)) {
                          deleteLifeGoal(goal.id);
                        }
                      }}
                      className="p-1.5 rounded-full hover:bg-rose-50 text-rose-500 hover:text-rose-700"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {!goal.isCompleted && (
                    <button
                      onClick={() => {
                        setContributeGoal(goal);
                        setContributeAmount(
                          item.requiredMonthlySavings > 0
                            ? item.requiredMonthlySavings.toString()
                            : "1000"
                        );
                      }}
                      className="h-8 px-3.5 rounded-full bg-[#0D0D0C] hover:bg-[#0D0D0C]/90 text-[#FFFDFA] text-xs font-medium inline-flex items-center gap-1 transition-all shadow-xs"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Funds</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Native <dialog> Modal for Add / Edit Life Goal */}
      <dialog
        ref={formDialogRef}
        {...({ closedby: "any" } as any)}
        aria-labelledby={formTitleId}
        onClick={(e) => {
          if (e.target === formDialogRef.current) {
            const rect = formDialogRef.current.getBoundingClientRect();
            const isInDialog =
              rect.top <= e.clientY &&
              e.clientY <= rect.top + rect.height &&
              rect.left <= e.clientX &&
              e.clientX <= rect.left + rect.width;
            if (!isInDialog) {
              setIsModalOpen(false);
            }
          }
        }}
        onCancel={() => setIsModalOpen(false)}
        className="vela-native-dialog max-w-lg m-auto"
      >
        <div className="p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#0D0D0C]/[0.08]">
            <div>
              <h3 id={formTitleId} className="font-serif text-xl font-medium text-[#0D0D0C]">
                {editingGoal ? "Edit Life Ambition" : "Set Major Life Goal"}
              </h3>
              <p className="text-xs text-[#0D0D0C]/50 mt-0.5">
                Calculate monthly contributions and test realism against your safe-to-spend pool.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-8 h-8 rounded-full border border-[#0D0D0C]/[0.1] flex items-center justify-center text-[#0D0D0C]/60 hover:text-[#0D0D0C]"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Quick Templates Picker inside Modal */}
            {!editingGoal && (
              <div className="p-3 rounded-xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] space-y-1.5">
                <span className="text-[11px] font-normal text-[#0D0D0C]/55 block">
                  Optional: Pre-fill from major life templates
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {GOAL_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.title}
                      type="button"
                      onClick={() => openAddModal(tpl)}
                      className="px-2.5 py-1 rounded-full bg-[#FFFDFA] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] border border-[#0D0D0C]/[0.08] text-[11px] font-medium text-[#0D0D0C] transition-colors"
                    >
                      {tpl.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Goal Title */}
            <div>
              <label className="block text-xs font-medium text-[#0D0D0C]/80 mb-1">
                Goal Ambition Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Buy a Car, Move into Apartment, Europe Travel"
                className="w-full px-3.5 py-2 rounded-xl border border-[#0D0D0C]/[0.15] bg-[#FBF6EF]/50 text-sm text-[#0D0D0C] focus:outline-none focus:ring-1 focus:ring-[#0D0D0C]"
              />
            </div>

            {/* Category & Target Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#0D0D0C]/80 mb-1">
                  Ambition Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as LifeGoalCategory })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#0D0D0C]/[0.15] bg-[#FBF6EF]/50 text-sm text-[#0D0D0C] focus:outline-none focus:ring-1 focus:ring-[#0D0D0C]"
                >
                  <option value="car">Buy a Car</option>
                  <option value="apartment">Move into Apartment</option>
                  <option value="house">Buy a House</option>
                  <option value="emergency">Emergency Fund</option>
                  <option value="travel">Holiday & Travel</option>
                  <option value="debt_free">Pay Off All Debt</option>
                  <option value="custom">Custom Ambition</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0D0D0C]/80 mb-1">
                  Target Capital Amount (ZAR) *
                </label>
                <input
                  type="number"
                  step="100"
                  min="500"
                  required
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  placeholder="65000"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#0D0D0C]/[0.15] bg-[#FBF6EF]/50 text-sm text-[#0D0D0C] focus:outline-none focus:ring-1 focus:ring-[#0D0D0C]"
                />
              </div>
            </div>

            {/* Current Saved & Target Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#0D0D0C]/80 mb-1">
                  Already Saved / Funded (ZAR)
                </label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  value={formData.currentSaved}
                  onChange={(e) => setFormData({ ...formData, currentSaved: e.target.value })}
                  placeholder="0"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#0D0D0C]/[0.15] bg-[#FBF6EF]/50 text-sm text-[#0D0D0C] focus:outline-none focus:ring-1 focus:ring-[#0D0D0C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0D0D0C]/80 mb-1">
                  Target Completion Month *
                </label>
                <input
                  type="month"
                  required
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#0D0D0C]/[0.15] bg-[#FBF6EF]/50 text-sm text-[#0D0D0C] focus:outline-none focus:ring-1 focus:ring-[#0D0D0C]"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-[#0D0D0C]/80 mb-1">
                Strategy Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Transfer duty, bond registration, or trade-in value"
                className="w-full px-3.5 py-2 rounded-xl border border-[#0D0D0C]/[0.15] bg-[#FBF6EF]/50 text-sm text-[#0D0D0C] focus:outline-none focus:ring-1 focus:ring-[#0D0D0C]"
              />
            </div>

            {/* Submit & Cancel */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#0D0D0C]/[0.08]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-full border border-[#0D0D0C]/[0.1] text-xs font-medium text-[#0D0D0C]/70 hover:text-[#0D0D0C]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs font-medium hover:bg-[#0D0D0C]/90 shadow-sm"
              >
                {editingGoal ? "Save Ambition" : "Add to Roadmap"}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* 6. Native <dialog> Modal for Quick Contribute / Add Funds */}
      <dialog
        ref={contributeDialogRef}
        {...({ closedby: "any" } as any)}
        aria-labelledby={contributeTitleId}
        onClick={(e) => {
          if (e.target === contributeDialogRef.current) {
            const rect = contributeDialogRef.current.getBoundingClientRect();
            const isInDialog =
              rect.top <= e.clientY &&
              e.clientY <= rect.top + rect.height &&
              rect.left <= e.clientX &&
              e.clientX <= rect.left + rect.width;
            if (!isInDialog) {
              setContributeGoal(null);
            }
          }
        }}
        onCancel={() => setContributeGoal(null)}
        className="vela-native-dialog max-w-sm m-auto"
      >
        {contributeGoal && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#0D0D0C]/[0.08]">
              <h3 id={contributeTitleId} className="font-serif text-lg font-medium text-[#0D0D0C]">
                Add Funds: {contributeGoal.title}
              </h3>
              <button
                type="button"
                onClick={() => setContributeGoal(null)}
                className="w-7 h-7 rounded-full border border-[#0D0D0C]/[0.1] flex items-center justify-center text-[#0D0D0C]/60 hover:text-[#0D0D0C]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleContributeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#0D0D0C]/80 mb-1">
                  Contribution Amount (ZAR)
                </label>
                <input
                  type="number"
                  step="50"
                  min="1"
                  required
                  autoFocus
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#0D0D0C]/[0.15] bg-[#FBF6EF]/50 text-base font-serif font-medium text-[#0D0D0C] focus:outline-none focus:ring-1 focus:ring-[#0D0D0C]"
                />
                <span className="text-[11px] text-[#0D0D0C]/50 mt-1 block">
                  Currently saved: {formatCurrency(contributeGoal.currentSaved, currency)} of{" "}
                  {formatCurrency(contributeGoal.targetAmount, currency)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setContributeGoal(null)}
                  className="px-3.5 py-1.5 rounded-full border border-[#0D0D0C]/[0.1] text-xs text-[#0D0D0C]/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs font-medium"
                >
                  Confirm Contribution
                </button>
              </div>
            </form>
          </div>
        )}
      </dialog>
    </div>
  );
}
