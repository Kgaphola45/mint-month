"use client";

import React, { useState } from "react";
import {
  Settings,
  Coins,
  Palette,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Database,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { CURRENCIES } from "@/lib/currencies";
import { CategoryManagerModal } from "@/components/category-manager-modal";

export default function SettingsPage() {
  const {
    currency,
    setCurrency,
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
      const success = importDataJSON(content);
      if (success) {
        setImportStatus("Data imported successfully!");
        setTimeout(() => setImportStatus(""), 4000);
      } else {
        setImportStatus("Failed to parse JSON file.");
        setTimeout(() => setImportStatus(""), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-muted text-foreground flex items-center justify-center">
          <Settings className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Configure currency, custom categories, data backups, and privacy
          </p>
        </div>
      </div>

      {importStatus && (
        <div className="p-3.5 rounded-2xl bg-mint-500/10 border border-mint-500/30 text-mint-600 dark:text-mint-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          {importStatus}
        </div>
      )}

      {/* 1. Currency Configuration */}
      <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Currency
            </h3>
            <p className="text-xs text-muted-foreground">
              Configured in South African Rands only (ZAR - R)
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-mint-500/10 border border-mint-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-mint-500 text-white font-mono font-bold text-lg flex items-center justify-center shadow-sm">
              R
            </div>
            <div>
              <span className="text-sm font-bold text-foreground block">
                South African Rand (ZAR)
              </span>
              <span className="text-xs text-muted-foreground">
                All budgets, expenses, and charts are rendered in Rands only
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-mint-500/20 text-mint-700 dark:text-mint-300 text-xs font-bold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Active Currency
          </span>
        </div>
      </div>

      {/* 2. Category Management */}
      <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-mint-500/10 text-mint-500 flex items-center justify-center">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Manage Categories
            </h3>
            <p className="text-xs text-muted-foreground">
              {categories.length} categories active ({categories.filter((c) => c.isCustom).length} custom)
            </p>
          </div>
        </div>

        <button
          onClick={() => setCategoryModalOpen(true)}
          className="px-4 py-2 rounded-2xl bg-card hover:bg-muted border border-border text-xs font-semibold text-foreground transition-all shadow-sm active:scale-95"
        >
          Customize Categories →
        </button>
      </div>

      {/* 3. Data Backup & Export / Import */}
      <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Export & Backup Data
            </h3>
            <p className="text-xs text-muted-foreground">
              Export your expense sheets as CSV or full JSON backup
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center justify-between p-3.5 rounded-2xl border border-border/60 hover:bg-muted/40 transition-colors text-left"
          >
            <div>
              <span className="text-xs font-bold text-foreground block">
                Export to CSV
              </span>
              <span className="text-[11px] text-muted-foreground">
                Compatible with Excel, Google Sheets, Numbers
              </span>
            </div>
            <Download className="w-4 h-4 text-mint-500 shrink-0" />
          </button>

          <button
            onClick={handleDownloadJSON}
            className="flex items-center justify-between p-3.5 rounded-2xl border border-border/60 hover:bg-muted/40 transition-colors text-left"
          >
            <div>
              <span className="text-xs font-bold text-foreground block">
                Export Full Backup (JSON)
              </span>
              <span className="text-[11px] text-muted-foreground">
                Contains expenses, budgets, categories
              </span>
            </div>
            <Database className="w-4 h-4 text-blue-500 shrink-0" />
          </button>
        </div>

        {/* Import JSON */}
        <div className="pt-2">
          <label className="flex items-center justify-between p-3.5 rounded-2xl border border-dashed border-border/80 hover:border-mint-500/50 hover:bg-muted/30 cursor-pointer transition-all">
            <div className="flex items-center gap-3">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Import Backup JSON
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Restore previously exported Mint Month backup file
                </span>
              </div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="text-xs font-semibold text-mint-600 dark:text-mint-400">
              Browse File
            </span>
          </label>
        </div>
      </div>

      {/* 4. Danger Zone: Reset Data */}
      <div className="p-6 rounded-3xl bg-rose-500/[0.03] border border-rose-500/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <Trash2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Clear & Reset Data
            </h3>
            <p className="text-xs text-muted-foreground">
              Reset all entries back to initial 3-month sample data
            </p>
          </div>
        </div>

        {confirmReset ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                resetToDefaults();
                setConfirmReset(false);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
            >
              Yes, Reset Everything
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-3 py-1.5 rounded-xl bg-muted text-foreground text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="px-4 py-2 rounded-2xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            Reset to Sample Data
          </button>
        )}
      </div>

      {/* 5. Supabase & Privacy Architecture Note */}
      <div className="p-6 rounded-3xl bg-muted/20 border border-border/50 text-xs text-muted-foreground space-y-2">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <ShieldCheck className="w-4 h-4 text-mint-500" />
          Privacy-First & Cloud-Ready Architecture
        </div>
        <p className="leading-relaxed">
          Mint Month runs on an offline-first storage adapter layer (`src/lib/storage.ts`). The data models (Expense, Category, Budget) are 100% structured to connect directly to <strong>Supabase</strong> with standard Postgres Foreign Keys and JSONB fields whenever you want multi-device synchronization.
        </p>
      </div>

      {/* Modal for Categories */}
      <CategoryManagerModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
      />
    </div>
  );
}
