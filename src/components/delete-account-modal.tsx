"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, X, Check } from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ open, onClose }: DeleteAccountModalProps) {
  const router = useRouter();
  const { currentUser, deleteAccount } = useExpenseStore();

  const [confirmInput, setConfirmInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || !currentUser) return null;

  const userEmail = currentUser.email || "";
  const isConfirmed =
    confirmInput.trim().toLowerCase() === userEmail.toLowerCase() ||
    confirmInput.trim().toUpperCase() === "DELETE";

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) return;

    setError(null);
    setLoading(true);

    try {
      const res = await deleteAccount(currentUser.id);
      if (res.success) {
        onClose();
        router.push("/");
      } else {
        setError(res.error || "Failed to delete account. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0D0D0C]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-[#FFFDFA] border border-rose-300 rounded-[28px] w-full max-w-md shadow-[0_24px_48px_rgba(0,0,0,0.14)] p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-rose-600 block">
                Danger Zone
              </span>
              <h3 className="text-xl font-medium tracking-tight text-[#0D0D0C]">
                Permanently Delete Account
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#0D0D0C]/[0.1] hover:bg-[#FBF6EF] flex items-center justify-center text-[#0D0D0C]/60 hover:text-[#0D0D0C] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning text */}
        <div className="p-4 rounded-[18px] bg-rose-50 border border-rose-200/80 text-xs text-rose-950 space-y-2 leading-relaxed">
          <p className="font-semibold text-rose-900">
            This action is permanent and cannot be undone.
          </p>
          <p className="text-rose-800/80">
            All records belonging to <strong className="font-semibold text-rose-950">{userEmail}</strong> will be immediately and irrevocably erased:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-rose-800/80 text-[11px]">
            <li>All recorded expenses, debit orders, and transaction histories</li>
            <li>Category budgets, custom tags, and instalment trackers</li>
            <li>Account credentials and security tokens</li>
          </ul>
        </div>

        {error && (
          <div className="p-3.5 rounded-[16px] bg-[#ECD6E2]/60 border border-[#ECD6E2] text-xs text-[#0D0D0C] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Confirmation Form */}
        <form onSubmit={handleDelete} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/70">
              Type <span className="font-mono font-semibold text-rose-700">{userEmail}</span> or <span className="font-mono font-semibold text-rose-700">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              required
              placeholder={userEmail}
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              className="w-full h-11 px-4 rounded-full border border-rose-300 bg-[#FBF6EF] text-sm text-[#0D0D0C] placeholder:text-[#0D0D0C]/30 focus:outline-none focus:border-rose-600 focus:bg-[#FFFDFA] transition-all"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-1/2 h-11 rounded-full border border-[#0D0D0C]/[0.16] hover:bg-[#FBF6EF] text-xs font-medium text-[#0D0D0C] transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !isConfirmed}
              className="w-1/2 h-11 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
              <span>{loading ? "Deleting..." : "Delete Permanently"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

