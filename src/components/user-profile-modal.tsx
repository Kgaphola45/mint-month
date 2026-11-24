"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Check,
  User as UserIcon,
  Wallet,
  Calendar,
  Download,
  Database,
  RefreshCw,
  Shield,
  Palette,
  Lock,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency } from "@/lib/utils";
import { isSuperUser, SUPER_USER_EMAIL } from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const AVATAR_SWATCHES = [
  { label: "Obsidian Ink", color: "#0D0D0C" },
  { label: "Editorial Sage", color: "#4D7C5D" },
  { label: "Warm Terracotta", color: "#C86432" },
  { label: "Karoo Ochre", color: "#B8862D" },
  { label: "Cape Plum", color: "#7E4B68" },
  { label: "Atlantic Slate", color: "#334E68" },
  { label: "Deep Forest", color: "#234E3D" },
  { label: "Proteas Crimson", color: "#8F2D38" },
];

export function UserProfileModal() {
  const {
    profileModalOpen,
    setProfileModalOpen,
    currentUser,
    incomes,
    selectedMonth,
    paydayDay,
    currency,
    getSafeToSpend,
    updateUserProfile,
    exportDataCSV,
    exportDataJSON,
    syncSupabaseData,
    isSyncingSupabase,
  } = useExpenseStore();

  const dialogRef = useRef<HTMLDialogElement>(null);

  const [nameInput, setNameInput] = useState("");
  const [avatarColor, setAvatarColor] = useState("#0D0D0C");
  const [salaryInput, setSalaryInput] = useState("25000");
  const [paydayInput, setPaydayInput] = useState(25);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const isSuper = isSuperUser(currentUser);
  const isPrimaryOwner =
    (currentUser?.email || "").trim().toLowerCase() === SUPER_USER_EMAIL;
  const safe = getSafeToSpend(selectedMonth);

  // Sync form state when modal opens
  useEffect(() => {
    if (profileModalOpen && currentUser) {
      setNameInput(currentUser.name || "");
      setAvatarColor(currentUser.avatarColor || "#0D0D0C");
      const activeIncome =
        incomes[selectedMonth] || incomes.default || currentUser.monthlySalary || 25000;
      setSalaryInput(activeIncome.toString());
      setPaydayInput(paydayDay || currentUser.paydayDay || 25);
      setStatusMessage("");
    }
  }, [profileModalOpen, currentUser, incomes, selectedMonth, paydayDay]);

  // Open/close native <dialog> via showModal() / close()
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (profileModalOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [profileModalOpen]);

  // Fallback for browsers without native closedby="any" support + close event sync
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleNativeClose = () => {
      dialog.returnValue = "";
      setProfileModalOpen(false);
    };

    const handleLightDismissFallback = (event: MouseEvent) => {
      if ("closedBy" in HTMLDialogElement.prototype) return;
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isDialogContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (isDialogContent) return;
      dialog.close();
    };

    dialog.addEventListener("close", handleNativeClose);
    dialog.addEventListener("click", handleLightDismissFallback);
    return () => {
      dialog.removeEventListener("close", handleNativeClose);
      dialog.removeEventListener("click", handleLightDismissFallback);
    };
  }, [setProfileModalOpen]);

  if (!currentUser) return null;

  const parsedSalary = parseFloat(salaryInput) || 25000;
  const previewSafePool = Math.max(0, parsedSalary - safe.fixedCommitments);
  const previewRemaining = previewSafePool - safe.nonRecurringSpent;
  const previewDaily =
    safe.daysRemaining > 0
      ? Math.round((previewRemaining / safe.daysRemaining) * 100) / 100
      : previewRemaining;

  const initials = (nameInput || currentUser.name || "U")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleClose = () => {
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    }
    setProfileModalOpen(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedSalary <= 0) return;

    setSaving(true);
    const res = await updateUserProfile({
      name: isPrimaryOwner ? "Emmanuel Kgaphola" : nameInput.trim() || currentUser.name,
      avatarColor,
      monthlySalary: parsedSalary,
      paydayDay: Math.max(1, Math.min(31, paydayInput || 25)),
    });
    setSaving(false);

    if (res.success) {
      setStatusMessage("Profile, salary & preferences synced to Supabase!");
      setTimeout(() => {
        setStatusMessage("");
        handleClose();
      }, 900);
    }
  };

  const handleDownloadCSV = () => {
    const csv = exportDataCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `mint-month-ledger-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusMessage("CSV statement downloaded!");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  const handleDownloadJSON = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `mint-month-vault-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusMessage("JSON backup downloaded!");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  const handleCloudSync = async () => {
    if (!isSupabaseConfigured()) return;
    await syncSupabaseData(currentUser.id);
    setStatusMessage("Cloud vault synchronized with Supabase!");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="profile-dialog-title"
      className="vela-native-dialog"
      {...({ closedby: "any" } as any)}
    >
      {/* Header */}
      <div className="p-6 border-b border-[#0D0D0C]/[0.08] flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#0D0D0C]/50">
              Personal Vault Profile
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-1 ${
                isSuper
                  ? "bg-[#0D0D0C] text-[#FFFDFA]"
                  : "bg-[#0D0D0C]/[0.07] text-[#0D0D0C]/75"
              }`}
            >
              {isSuper ? (
                <>
                  <Shield className="w-2.5 h-2.5" />
                  <span>Super User</span>
                </>
              ) : (
                <span>Standard Account</span>
              )}
            </span>
          </div>
          <h1
            id="profile-dialog-title"
            className="text-xl sm:text-2xl font-medium tracking-tight text-[#0D0D0C] mt-0.5"
          >
            My Profile &amp; Preferences
          </h1>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="p-2 rounded-full border border-[#0D0D0C]/[0.08] hover:bg-[#FBF6EF] text-[#0D0D0C]/60 hover:text-[#0D0D0C] transition-colors"
          aria-label="Close profile dialog"
        >
          <X className="w-4 h-4 stroke-[1.75]" />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto space-y-5 flex-1">
        {statusMessage && (
          <div className="p-3 rounded-[16px] bg-[#DFE9D4]/80 border border-emerald-300 text-emerald-950 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-800 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Avatar Preview & Swatch Selector */}
        <div className="p-4 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold text-[#FFFDFA] shadow-sm shrink-0 transition-colors"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <span className="text-sm font-medium text-[#0D0D0C] block truncate">
                {isPrimaryOwner ? "Emmanuel Kgaphola" : nameInput || currentUser.name}
              </span>
              <span className="text-xs text-[#0D0D0C]/50 block truncate">
                {currentUser.email}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#0D0D0C]/50 flex items-center gap-1">
              <Palette className="w-3 h-3" />
              <span>Avatar Accent</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {AVATAR_SWATCHES.map((swatch) => {
                const active = avatarColor.toLowerCase() === swatch.color.toLowerCase();
                return (
                  <button
                    key={swatch.color}
                    type="button"
                    onClick={() => setAvatarColor(swatch.color)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                      active ? "scale-110 ring-2 ring-[#0D0D0C] ring-offset-2 ring-offset-[#FBF6EF]" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: swatch.color }}
                    title={swatch.label}
                    aria-label={swatch.label}
                  >
                    {active && <Check className="w-3 h-3 text-[#FFFDFA] stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/60 flex items-center justify-between">
            <span>Full Name</span>
            {isPrimaryOwner && (
              <span className="text-[10px] text-[#0D0D0C]/45 inline-flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Primary Super User Identity</span>
              </span>
            )}
          </label>
          <div className="relative">
            <UserIcon className="w-4 h-4 text-[#0D0D0C]/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              disabled={isPrimaryOwner}
              value={isPrimaryOwner ? "Emmanuel Kgaphola" : nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              autoFocus={!isPrimaryOwner}
              className="w-full h-11 pl-10 pr-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm font-medium text-[#0D0D0C] focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDFA] disabled:opacity-70 transition-all"
            />
          </div>
        </div>

        {/* Monthly Take-Home Salary & Payday */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/60">
              Monthly Take-Home Salary (R)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#0D0D0C]/40">
                R
              </span>
              <input
                type="number"
                min="1000"
                step="any"
                required
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
                className="w-full h-11 pl-8 pr-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm font-medium text-[#0D0D0C] focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDFA] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/60">
              Payday Day (1–31)
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-[#0D0D0C]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="1"
                max="31"
                required
                value={paydayInput}
                onChange={(e) => setPaydayInput(parseInt(e.target.value, 10) || 25)}
                className="w-full h-11 pl-9 pr-3 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm font-medium text-[#0D0D0C] focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDFA] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Quick Salary Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[15000, 25000, 35000, 50000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setSalaryInput(preset.toString())}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                parsedSalary === preset
                  ? "bg-[#0D0D0C] text-[#FFFDFA] border-[#0D0D0C]"
                  : "bg-[#FBF6EF] text-[#0D0D0C]/75 border-[#0D0D0C]/[0.1] hover:border-[#0D0D0C]/30"
              }`}
            >
              R{preset.toLocaleString()}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSalaryInput(Math.max(1000, parsedSalary + 1000).toString())}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FBF6EF] text-[#0D0D0C]/75 border border-[#0D0D0C]/[0.1] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] transition-colors"
          >
            +R1,000
          </button>
          <button
            type="button"
            onClick={() => setSalaryInput(Math.max(1000, parsedSalary + 5000).toString())}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FBF6EF] text-[#0D0D0C]/75 border border-[#0D0D0C]/[0.1] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] transition-colors"
          >
            +R5,000
          </button>
        </div>

        {/* Live Daily Safe-to-Spend Impact Preview */}
        <div className="p-3.5 rounded-[18px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0D0D0C]/45 block">
              Projected Daily Safe-to-Spend
            </span>
            <span className="text-lg font-semibold text-[#0D0D0C]">
              {formatCurrency(Math.max(0, previewDaily), currency)}
              <span className="text-xs font-normal text-[#0D0D0C]/50"> / day</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#0D0D0C]/50 block">Quarantined Bills &amp; Savings</span>
            <span className="font-medium text-[#0D0D0C]">
              {formatCurrency(safe.fixedCommitments, currency)}
            </span>
          </div>
        </div>

        {/* Self-Service Personal Statements & Cloud Sync */}
        <div className="pt-2 border-t border-[#0D0D0C]/[0.06] space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0D0D0C]/45 block">
            Personal Data &amp; Cloud Sync
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="h-9 px-3 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-xs font-medium text-[#0D0D0C] inline-flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJSON}
              className="h-9 px-3 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-xs font-medium text-[#0D0D0C] inline-flex items-center justify-center gap-1.5 transition-all"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Backup JSON</span>
            </button>

            <button
              type="button"
              onClick={handleCloudSync}
              disabled={isSyncingSupabase}
              className="h-9 px-3 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-xs font-medium text-[#0D0D0C] inline-flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSupabase ? "animate-spin" : ""}`} />
              <span>{isSyncingSupabase ? "Syncing..." : "Sync Cloud"}</span>
            </button>
          </div>
        </div>

        {/* Submit / Cancel Footer */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleClose}
            className="h-11 px-5 rounded-full border border-[#0D0D0C]/[0.14] text-xs font-medium text-[#0D0D0C] hover:bg-[#FBF6EF] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-11 px-6 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <Check className="w-4 h-4 stroke-[2]" />
            <span>{saving ? "Saving..." : "Save Profile & Salary"}</span>
          </button>
        </div>
      </form>
    </dialog>
  );
}
