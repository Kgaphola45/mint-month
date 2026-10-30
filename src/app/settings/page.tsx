"use client";

import React, { useState } from "react";
import {
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Database,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { CategoryManagerModal } from "@/components/category-manager-modal";

export default function SettingsPage() {
  const {
    categories,
    expenses,
    budgets,
    exportDataCSV,
    exportDataJSON,
    importDataJSON,
    resetToDefaults,
  } = useExpenseStore();

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState<string>("");

  const handleDownloadCSV = () => {
    const csv = exportDataCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `mint-month-backup-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `mint-month-backup-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        if (success) {
          setImportStatus("Data backup successfully restored!");
          setTimeout(() => setImportStatus(""), 4000);
        } else {
          setImportStatus("Error: Invalid JSON backup file format.");
          setTimeout(() => setImportStatus(""), 4000);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    resetToDefaults();
    setConfirmReset(false);
    setImportStatus("Workspace restored to default seed data.");
    setTimeout(() => setImportStatus(""), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#0D0D0C]/[0.08]">
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#0D0D0C]">
          Settings & Preferences
        </h1>
        <p className="text-sm text-[#0D0D0C]/56 mt-1">
          Configure currency, custom categories, data backups, and privacy
        </p>
      </div>

      {importStatus && (
        <div className="p-4 rounded-[20px] bg-[#FFFDF8] border border-[#0D0D0C]/[0.12] text-[#0D0D0C] text-xs font-medium flex items-center gap-2.5 shadow-sm">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* 1. Currency Configuration */}
      <div className="p-8 rounded-[24px] bg-[#FFFDF8] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-5">
        <div>
          <h3 className="text-[16px] font-normal text-[#0D0D0C]/56">
            Currency
          </h3>
          <p className="text-xs text-[#0D0D0C]/42 mt-0.5">
            Configured strictly in South African Rands (ZAR / R)
          </p>
        </div>

        <div className="p-5 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FFFDF8] text-[#0D0D0C] font-medium text-base flex items-center justify-center">
              R
            </div>
            <div>
              <span className="text-sm font-medium text-[#0D0D0C] block">
                South African Rand (ZAR)
              </span>
              <span className="text-xs text-[#0D0D0C]/56">
                All budgets, expenses, and charts are rendered in Rands only
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FFFDF8] text-[#0D0D0C] text-xs font-medium flex items-center gap-1.5 shadow-sm">
            <Check className="w-3.5 h-3.5" /> Active
          </span>
        </div>
      </div>

      {/* 2. Category Management */}
      <div className="p-8 rounded-[24px] bg-[#FFFDF8] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h3 className="text-[16px] font-normal text-[#0D0D0C]/56">
            Category Manager
          </h3>
          <p className="text-xs text-[#0D0D0C]/42 mt-0.5">
            {categories.length} categories active ({categories.filter((c) => c.isCustom).length} custom additions)
          </p>
        </div>

        <button
          onClick={() => setCategoryModalOpen(true)}
          className="btn-vela-outline px-4 py-2.5 text-xs font-medium"
        >
          Customize Categories →
        </button>
      </div>

      {/* 3. Data Backup & Export / Import */}
      <div className="p-8 rounded-[24px] bg-[#FFFDF8] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-5">
        <div>
          <h3 className="text-[16px] font-normal text-[#0D0D0C]/56">
            Export & Backup Data
          </h3>
          <p className="text-xs text-[#0D0D0C]/42 mt-0.5">
            Export your monthly ledger as CSV or full JSON backup
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center justify-between p-4 rounded-[18px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] hover:border-[#0D0D0C]/20 transition-all text-left"
          >
            <div>
              <span className="text-xs font-medium text-[#0D0D0C] block">
                Export to CSV
              </span>
              <span className="text-[11px] text-[#0D0D0C]/56">
                Spreadsheet ready format (Excel, Sheets)
              </span>
            </div>
            <Download className="w-4 h-4 text-[#0D0D0C]/60 shrink-0" />
          </button>

          <button
            onClick={handleDownloadJSON}
            className="flex items-center justify-between p-4 rounded-[18px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] hover:border-[#0D0D0C]/20 transition-all text-left"
          >
            <div>
              <span className="text-xs font-medium text-[#0D0D0C] block">
                Export Full Backup (JSON)
              </span>
              <span className="text-[11px] text-[#0D0D0C]/56">
                Contains expenses, budgets, and recurring items
              </span>
            </div>
            <Database className="w-4 h-4 text-[#0D0D0C]/60 shrink-0" />
          </button>
        </div>

        {/* Import JSON */}
        <div className="pt-2">
          <label className="flex items-center justify-between p-4 rounded-[18px] border border-dashed border-[#0D0D0C]/[0.15] hover:border-[#0D0D0C] hover:bg-[#FBF6EF]/50 cursor-pointer transition-all">
            <div className="flex items-center gap-3">
              <Upload className="w-4 h-4 text-[#0D0D0C]/60" />
              <div>
                <span className="text-xs font-medium text-[#0D0D0C] block">
                  Restore from JSON Backup
                </span>
                <span className="text-[11px] text-[#0D0D0C]/56">
                  Select a valid `.json` export file from disk
                </span>
              </div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 4. Privacy & Zero-Knowledge Architecture */}
      <div className="p-8 rounded-[24px] bg-[#FFFDF8] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-[#0D0D0C]/[0.1] flex items-center justify-center text-[#0D0D0C]">
            <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="text-[16px] font-normal text-[#0D0D0C]/56">
              Privacy-First & Local Storage
            </h3>
            <p className="text-xs text-[#0D0D0C]/42 mt-0.5">
              100% Client-Side Encryption and Offline Storage
            </p>
          </div>
        </div>

        <p className="text-xs text-[#0D0D0C]/56 leading-relaxed">
          Mint Month runs fully in your browser. All expenses, budgets, categories, and payment details are stored strictly in your browser's private local storage. No trackers, no ad telemetry, and no external servers inspect your transactions.
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-[#0D0D0C]/[0.06] text-xs text-[#0D0D0C]/56">
          <span>Current Database Records:</span>
          <span className="font-medium text-[#0D0D0C]">
            {expenses.length} expenses • {budgets.length} budgets • {categories.length} categories
          </span>
        </div>
      </div>

      {/* 5. Danger Zone: Reset Data */}
      <div className="p-8 rounded-[24px] bg-[#FFFDF8] border border-rose-300 shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h3 className="text-sm font-medium text-rose-800">
            Reset All Workspace Data
          </h3>
          <p className="text-xs text-[#0D0D0C]/56 mt-0.5">
            Clear customized entries and reload default seed data
          </p>
        </div>

        {confirmReset ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetData}
              className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition-colors shadow-sm"
            >
              Yes, Reset Everything
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-3.5 py-2 rounded-full border border-[#0D0D0C]/20 hover:border-[#0D0D0C] text-xs font-medium text-[#0D0D0C] transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="px-4 py-2 rounded-full border border-rose-300 hover:border-rose-500 hover:bg-rose-50 text-rose-700 text-xs font-medium transition-colors self-start sm:self-auto"
          >
            Reset to Defaults
          </button>
        )}
      </div>

      {/* Category Management Modal */}
      <CategoryManagerModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
      />
    </div>
  );
}
