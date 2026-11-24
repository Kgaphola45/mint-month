"use client";

import React, { useState } from "react";
import { fireConfetti } from "@/lib/confetti";
import {
  PiggyBank,
  Plus,
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
  Trash2,
  Pencil,
  ShieldCheck,
  Users,
  Palmtree,
  Wrench,
  X,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency } from "@/lib/utils";
import { SavingsGoal, SavingsVaultType } from "@/types";

const VAULT_TYPE_META: Record<
  SavingsVaultType,
  { label: string; badgeBg: string; icon: React.ComponentType<{ className?: string }> }
> = {
  emergency: {
    label: "Emergency Fund",
    badgeBg: "bg-[#DFE9D4]",
    icon: ShieldCheck,
  },
  stokvel: {
    label: "Stokvel Pool",
    badgeBg: "bg-[#F4EBC6]",
    icon: Users,
  },
  holiday: {
    label: "December / Holiday",
    badgeBg: "bg-[#F8DCC7]",
    icon: Palmtree,
  },
  sinking: {
    label: "Sinking Fund (Car / Annual)",
    badgeBg: "bg-[#ECD6E2]",
    icon: Wrench,
  },
};

const SA_VAULT_PRESETS: Array<{
  name: string;
  vaultType: SavingsVaultType;
  targetAmount: number;
  monthlyContribution: number;
  dueDay: number;
  notes: string;
}> = [
  {
    name: "3-Month Emergency Cushion",
    vaultType: "emergency",
    targetAmount: 30000,
    monthlyContribution: 2000,
    dueDay: 25,
    notes: " unexpected medical, tyre, or household emergencies",
  },
  {
    name: "Year-End Grocery & Cash Stokvel",
    vaultType: "stokvel",
    targetAmount: 12000,
    monthlyContribution: 1000,
    dueDay: 26,
    notes: "Monthly Stokvel contribution paid out in November/December",
  },
  {
    name: "December Holiday & Festive Fund",
    vaultType: "holiday",
    targetAmount: 18000,
    monthlyContribution: 1500,
    dueDay: 25,
    notes: "Ring-fenced festive travel, gifts, and family hosting",
  },
  {
    name: "Car Service & Licence Disc Vault",
    vaultType: "sinking",
    targetAmount: 6500,
    monthlyContribution: 550,
    dueDay: 28,
    notes: "Annual vehicle service, brake pads, and NATIS disc renewal",
  },
];

export function SavingsVaultTracker() {
  const {
    savingsGoals,
    currency,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    contributeToSavingsGoal,
    getSavingsSummary,
  } = useExpenseStore();

  const summary = getSavingsSummary();

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [vaultType, setVaultType] = useState<SavingsVaultType>("emergency");
  const [targetAmount, setTargetAmount] = useState("25000");
  const [savedAmount, setSavedAmount] = useState("0");
  const [monthlyContribution, setMonthlyContribution] = useState("1500");
  const [dueDay, setDueDay] = useState("25");
  const [ringFence, setRingFence] = useState(true);
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setVaultType("emergency");
    setTargetAmount("25000");
    setSavedAmount("0");
    setMonthlyContribution("1500");
    setDueDay("25");
    setRingFence(true);
    setNotes("");
    setFormOpen(false);
  };

  const handleOpenEdit = (goal: SavingsGoal) => {
    setEditingId(goal.id);
    setName(goal.name);
    setVaultType(goal.vaultType);
    setTargetAmount(goal.targetAmount.toString());
    setSavedAmount(goal.savedAmount.toString());
    setMonthlyContribution(goal.monthlyContribution.toString());
    setDueDay((goal.dueDay || 25).toString());
    setRingFence(goal.ringFenceInSafeToSpend);
    setNotes(goal.notes || "");
    setFormOpen(true);
  };

  const handleApplyPreset = (preset: (typeof SA_VAULT_PRESETS)[number]) => {
    addSavingsGoal({
      name: preset.name,
      vaultType: preset.vaultType,
      targetAmount: preset.targetAmount,
      savedAmount: 0,
      monthlyContribution: preset.monthlyContribution,
      dueDay: preset.dueDay,
      ringFenceInSafeToSpend: true,
      notes: preset.notes,
    });
    try {
      fireConfetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 },
        colors: ["#96CE96", "#F99654", "#0D0D0C"],
      });
    } catch {
      // ignore
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetAmount) || 0;
    const parsedSaved = Math.max(0, parseFloat(savedAmount) || 0);
    const parsedMonthly = Math.max(0, parseFloat(monthlyContribution) || 0);
    const parsedDay = Math.min(31, Math.max(1, parseInt(dueDay, 10) || 25));

    if (!name.trim() || parsedTarget <= 0) return;

    if (editingId) {
      updateSavingsGoal(editingId, {
        name: name.trim(),
        vaultType,
        targetAmount: parsedTarget,
        savedAmount: parsedSaved,
        monthlyContribution: parsedMonthly,
        dueDay: parsedDay,
        ringFenceInSafeToSpend: ringFence,
        notes: notes.trim(),
      });
    } else {
      addSavingsGoal({
        name: name.trim(),
        vaultType,
        targetAmount: parsedTarget,
        savedAmount: parsedSaved,
        monthlyContribution: parsedMonthly,
        dueDay: parsedDay,
        ringFenceInSafeToSpend: ringFence,
        notes: notes.trim(),
      });
    }

    resetForm();
  };

  const handleContribute = (goal: SavingsGoal) => {
    const willComplete =
      goal.savedAmount + goal.monthlyContribution >= goal.targetAmount;
    contributeToSavingsGoal(goal.id);
    try {
      fireConfetti({
        particleCount: willComplete ? 60 : 28,
        spread: willComplete ? 70 : 45,
        origin: { y: 0.75 },
        colors: ["#96CE96", "#F99654", "#0D0D0C"],
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#0D0D0C]/[0.06]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-normal text-[#0D0D0C]/56">
              Pay-Yourself-First & Ring-Fenced Reserves
            </span>
            <span className="px-2.5 py-0.5 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FBF6EF] text-[11px] text-[#0D0D0C] font-normal">
              {summary.activeCount} Active · {summary.completedCount} Funded
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C] mt-1">
            Emergency Fund, Savings Vaults & Stokvel Tracker
          </h2>
          <p className="text-sm text-[#0D0D0C]/56 mt-1">
            Ring-fence monthly savings, Stokvel pools, December holiday funds, and car service sinking vaults directly out of your Safe-to-Spend balance.
          </p>
        </div>

        <button
          onClick={() => {
            if (formOpen) {
              resetForm();
            } else {
              setFormOpen(true);
            }
          }}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm self-start md:self-auto shrink-0"
        >
          {formOpen ? (
            <>
              <X className="w-4 h-4 stroke-[2]" />
              <span>Close Form</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 stroke-[2]" />
              <span>New Savings Vault</span>
            </>
          )}
        </button>
      </div>

      {/* Quick South African Vault Templates */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#0D0D0C]/45 mr-1">
          Quick SA Templates:
        </span>
        {SA_VAULT_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => handleApplyPreset(preset)}
            className="px-3 py-1.5 rounded-full bg-[#FBF6EF] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] border border-[#0D0D0C]/[0.08] text-xs font-medium text-[#0D0D0C] transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-3 h-3" />
            <span>{preset.name}</span>
            <span className="opacity-60 text-[11px]">
              (R{preset.monthlyContribution.toLocaleString()}/mo)
            </span>
          </button>
        ))}
      </div>

      {/* Inline Add / Edit Form */}
      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-[22px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.1] space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-[#0D0D0C]">
              {editingId ? "Edit Savings Vault / Stokvel" : "Create Savings Vault or Stokvel Goal"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-[#0D0D0C]/50 hover:text-[#0D0D0C]"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#0D0D0C]/60 mb-1">
                Vault / Stokvel Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Emergency Fund, Year-End Stokvel, Licence Disc"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-full bg-[#FFFDFA] border border-[#0D0D0C]/[0.12] text-xs text-[#0D0D0C] focus:outline-none focus:border-[#0D0D0C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#0D0D0C]/60 mb-1">
                Vault Type
              </label>
              <select
                value={vaultType}
                onChange={(e) => setVaultType(e.target.value as SavingsVaultType)}
                className="w-full h-10 px-3.5 rounded-full bg-[#FFFDFA] border border-[#0D0D0C]/[0.12] text-xs text-[#0D0D0C] focus:outline-none focus:border-[#0D0D0C]"
              >
                <option value="emergency">Emergency Fund</option>
                <option value="stokvel">Stokvel Pool</option>
                <option value="holiday">December / Holiday</option>
                <option value="sinking">Sinking Fund (Car / Annual)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#0D0D0C]/60 mb-1">
                Target Goal (R)
              </label>
              <input
                type="number"
                min="100"
                step="any"
                required
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full h-10 px-3.5 rounded-full bg-[#FFFDFA] border border-[#0D0D0C]/[0.12] text-xs text-[#0D0D0C] focus:outline-none focus:border-[#0D0D0C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#0D0D0C]/60 mb-1">
                Saved So Far (R)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={savedAmount}
                onChange={(e) => setSavedAmount(e.target.value)}
                className="w-full h-10 px-3.5 rounded-full bg-[#FFFDFA] border border-[#0D0D0C]/[0.12] text-xs text-[#0D0D0C] focus:outline-none focus:border-[#0D0D0C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#0D0D0C]/60 mb-1">
                Monthly Contribution (R)
              </label>
              <input
                type="number"
                min="50"
                step="any"
                required
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                className="w-full h-10 px-3.5 rounded-full bg-[#FFFDFA] border border-[#0D0D0C]/[0.12] text-xs text-[#0D0D0C] focus:outline-none focus:border-[#0D0D0C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#0D0D0C]/60 mb-1">
                Transfer Day (1–31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full h-10 px-3.5 rounded-full bg-[#FFFDFA] border border-[#0D0D0C]/[0.12] text-xs text-[#0D0D0C] focus:outline-none focus:border-[#0D0D0C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#0D0D0C]/60 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., FNB Savings Pocket / Stokvel"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-10 px-3.5 rounded-full bg-[#FFFDFA] border border-[#0D0D0C]/[0.12] text-xs text-[#0D0D0C] focus:outline-none focus:border-[#0D0D0C]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <label className="flex items-center gap-2.5 text-xs text-[#0D0D0C] cursor-pointer">
              <input
                type="checkbox"
                checked={ringFence}
                onChange={(e) => setRingFence(e.target.checked)}
                className="w-4 h-4 accent-[#0D0D0C] cursor-pointer"
              />
              <span>
                <strong>Ring-Fence in Safe-to-Spend:</strong> Quarantine this monthly contribution from my daily spending allowance just like a debit order
              </span>
            </label>

            <button
              type="submit"
              className="h-10 px-6 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs font-medium hover:opacity-90 transition-all shadow-sm shrink-0"
            >
              {editingId ? "Update Vault" : "Save Vault Goal"}
            </button>
          </div>
        </form>
      )}

      {/* Summary Metric Cards */}
      {savingsGoals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
            <div className="flex items-center justify-between text-xs text-[#0D0D0C]/56 mb-1">
              <span>Ring-Fenced Monthly Savings</span>
              <Lock className="w-4 h-4 stroke-[1.5] text-[#0D0D0C]/40" />
            </div>
            <div className="text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C]">
              {formatCurrency(summary.totalMonthlyRingFenced, currency)}
              <span className="text-xs font-normal text-[#0D0D0C]/50"> / mo</span>
            </div>
            <p className="text-xs text-[#0D0D0C]/50 mt-1">
              Quarantined out of Safe-to-Spend
            </p>
          </div>

          <div className="p-5 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
            <div className="flex items-center justify-between text-xs text-[#0D0D0C]/56 mb-1">
              <span>Total Vault Balance Saved</span>
              <PiggyBank className="w-4 h-4 stroke-[1.5] text-[#0D0D0C]/40" />
            </div>
            <div className="text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C]">
              {formatCurrency(summary.totalSaved, currency)}
            </div>
            <p className="text-xs text-[#0D0D0C]/50 mt-1">
              Target: {formatCurrency(summary.totalTarget, currency)}
            </p>
          </div>

          <div className="p-5 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
            <div className="flex items-center justify-between text-xs text-[#0D0D0C]/56 mb-1">
              <span>Overall Vault Completion</span>
              <Sparkles className="w-4 h-4 stroke-[1.5] text-[#0D0D0C]/40" />
            </div>
            <div className="text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C]">
              {summary.overallProgress}%
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#0D0D0C]/[0.08] overflow-hidden mt-2">
              <div
                className="h-full rounded-full bg-[#96CE96] transition-all duration-500"
                style={{ width: `${summary.overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Vaults List */}
      {savingsGoals.length === 0 ? (
        <div className="p-8 sm:p-10 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full border border-[#0D0D0C]/[0.1] flex items-center justify-center text-[#0D0D0C]/50 mb-3">
            <PiggyBank className="w-6 h-6 stroke-[1.25]" />
          </div>
          <h4 className="text-base font-medium text-[#0D0D0C]">
            No Savings Vaults or Stokvel Goals Yet
          </h4>
          <p className="text-xs text-[#0D0D0C]/56 max-w-md mt-1">
            Tap any of the <strong>Quick SA Templates</strong> above (Emergency Cushion, Year-End Stokvel, December Holiday, or Car Service) to ring-fence your monthly savings out of your Safe-to-Spend allowance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savingsGoals.map((goal) => {
            const meta = VAULT_TYPE_META[goal.vaultType] || VAULT_TYPE_META.emergency;
            const TypeIcon = meta.icon;
            const percent =
              goal.targetAmount > 0
                ? Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100))
                : 0;
            const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
            const monthsLeft =
              goal.monthlyContribution > 0
                ? Math.ceil(remaining / goal.monthlyContribution)
                : 0;
            const isDone = Boolean(goal.isCompleted || goal.savedAmount >= goal.targetAmount);

            return (
              <div
                key={goal.id}
                className={`p-5 rounded-[22px] border transition-all ${
                  isDone
                    ? "bg-[#DFE9D4]/25 border-[#DFE9D4]"
                    : "bg-[#FBF6EF] border-[#0D0D0C]/[0.07] hover:border-[#0D0D0C]/[0.16]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-[#0D0D0C] inline-flex items-center gap-1 ${meta.badgeBg}`}
                      >
                        <TypeIcon className="w-3 h-3" />
                        <span>{meta.label}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateSavingsGoal(goal.id, {
                            ringFenceInSafeToSpend: !goal.ringFenceInSafeToSpend,
                          })
                        }
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border inline-flex items-center gap-1 transition-colors ${
                          goal.ringFenceInSafeToSpend
                            ? "bg-[#0D0D0C] text-[#FFFDFA] border-[#0D0D0C]"
                            : "bg-[#FFFDFA] text-[#0D0D0C]/60 border-[#0D0D0C]/[0.1]"
                        }`}
                        title="Toggle whether this monthly contribution is quarantined from Safe-to-Spend"
                      >
                        {goal.ringFenceInSafeToSpend ? (
                          <>
                            <Lock className="w-2.5 h-2.5" />
                            <span>Ring-Fenced</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-2.5 h-2.5" />
                            <span>Flexible</span>
                          </>
                        )}
                      </button>
                    </div>

                    <h4 className="text-lg font-medium text-[#0D0D0C] tracking-tight mt-1.5">
                      {goal.name}
                    </h4>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-semibold text-[#0D0D0C]">
                      {formatCurrency(goal.monthlyContribution, currency)}
                      <span className="text-xs font-normal text-[#0D0D0C]/50"> / mo</span>
                    </div>
                    <span className="text-[11px] text-[#0D0D0C]/50 block">
                      {isDone
                        ? "100% Funded"
                        : monthsLeft > 0
                        ? `~${monthsLeft} mo to target`
                        : "Active"}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#0D0D0C]/70">
                      <strong className="text-[#0D0D0C] font-semibold">
                        {formatCurrency(goal.savedAmount, currency)}
                      </strong>{" "}
                      of {formatCurrency(goal.targetAmount, currency)}
                    </span>
                    <span className="font-semibold text-[#0D0D0C]">{percent}%</span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-[#0D0D0C]/[0.08] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: isDone ? "#96CE96" : "#0D0D0C",
                      }}
                    />
                  </div>
                </div>

                {goal.notes && (
                  <p className="text-xs text-[#0D0D0C]/50 mt-2 line-clamp-1">
                    {goal.notes}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-[#0D0D0C]/[0.06] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(goal)}
                      className="px-2.5 py-1 rounded-full border border-[#0D0D0C]/[0.1] hover:bg-[#FFFDFA] text-xs text-[#0D0D0C]/70 hover:text-[#0D0D0C] inline-flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSavingsGoal(goal.id)}
                      className="p-1.5 rounded-full border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                      title="Delete vault"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {!isDone ? (
                    <button
                      type="button"
                      onClick={() => handleContribute(goal)}
                      className="h-8 px-3.5 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs font-medium hover:opacity-90 active:scale-95 transition-all inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <span>+ Deposit {formatCurrency(goal.monthlyContribution, currency)}</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-900 bg-[#DFE9D4] px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Goal Reached</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
