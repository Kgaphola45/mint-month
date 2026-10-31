"use client";

import React, { useState } from "react";
import {
  Mail,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Wallet,
  ShieldCheck,
  Info,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatCurrency, formatMonthYear } from "@/lib/utils";

interface PaydayDigestModalProps {
  open: boolean;
  onClose: () => void;
}

export function PaydayDigestModal({ open, onClose }: PaydayDigestModalProps) {
  const {
    selectedMonth,
    currency,
    currentUser,
    getSafeToSpend,
    getRecurringTimeline,
    debts,
  } = useExpenseStore();

  const safe = getSafeToSpend(selectedMonth);
  const timeline = getRecurringTimeline(selectedMonth);

  const defaultEmail = currentUser?.email || "emmanuelkgaphola@outlook.com";
  const [recipientEmail, setRecipientEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    sent: boolean;
    sandbox?: boolean;
    allowedEmail?: string;
    previewSubject?: string;
  } | null>(null);

  // Sync recipient email when modal opens or user changes
  React.useEffect(() => {
    if (open) {
      setRecipientEmail(currentUser?.email || "emmanuelkgaphola@outlook.com");
      setError(null);
      setSuccessResult(null);
    }
  }, [open, currentUser]);

  if (!open) return null;

  const upcomingDebitOrders = timeline.items.filter((item) => !item.isCleared);
  const upcomingCount = upcomingDebitOrders.length;
  const upcomingTotal = upcomingDebitOrders.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const previewSubject = `Your ${formatMonthYear(
    selectedMonth
  )} Plan: ${upcomingCount} debit orders scheduled (${formatCurrency(
    upcomingTotal,
    currency
  )}), leaving you ${formatCurrency(
    Math.max(0, safe.dailyAllowance),
    currency
  )}/day Safe-to-Spend`;

  const handleSendDigest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessResult(null);

    if (!recipientEmail || !recipientEmail.includes("@")) {
      setError("Please enter a valid recipient email address.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: recipientEmail.trim(),
        name: currentUser?.name || "Valued Member",
        monthStr: formatMonthYear(selectedMonth),
        salary: safe.monthlyIncome,
        safeToSpendDaily: Math.max(0, safe.dailyAllowance),
        safeToSpendTotal: Math.max(0, safe.safeToSpendRemaining),
        fixedCommitments: safe.fixedCommitments,
        daysRemaining: safe.daysRemaining,
        daysUntilPayday: safe.daysUntilPayday,
        paydayDay: safe.paydayDay,
        debitOrders: timeline.items.map((item) => ({
          name: item.note.replace(/\s*\(Recurring\)\s*/i, ""),
          amount: item.amount,
          day: item.day,
          cleared: item.isCleared,
        })),
        debts: debts.map((d) => ({
          name: d.name,
          paidInstalments: d.paidInstalments,
          totalInstalments: d.totalInstalments,
          monthlyAmount: d.monthlyAmount,
        })),
      };

      const res = await fetch("/api/digest/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to deliver digest email.");
        setLoading(false);
        return;
      }

      setSuccessResult({
        sent: data.sent,
        sandbox: data.sandbox,
        allowedEmail: data.allowedEmail,
        previewSubject: data.previewSubject || previewSubject,
      });
      setLoading(false);
    } catch {
      setError("Network error while delivering digest. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0D0D0C]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] rounded-[28px] w-full max-w-lg shadow-[0_24px_48px_rgba(0,0,0,0.14)] p-6 sm:p-7 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#0D0D0C]/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0D0D0C] text-[#FFFDFA] flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0D0D0C]" />
                <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#0D0D0C]/50">
                  Email Dispatch
                </span>
              </div>
              <h3 className="text-xl font-medium tracking-tight text-[#0D0D0C]">
                Payday & Debit Order Digest
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

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-5 pr-1 flex-1">
          {/* Success Banner */}
          {successResult && successResult.sent && (
            <div className="p-4 rounded-[20px] bg-[#96CE96]/30 border border-[#96CE96]/60 text-xs text-[#0D0D0C] space-y-1 animate-in fade-in">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
                <span>Digest dispatched successfully!</span>
              </div>
              <p className="text-[#0D0D0C]/75 text-[11px] pl-6">
                Sent to <strong className="text-[#0D0D0C] font-semibold">{recipientEmail}</strong>. Please check your inbox and Junk folder.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-[16px] bg-[#ECD6E2]/60 border border-[#ECD6E2] text-xs text-[#0D0D0C] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Subject Preview Card */}
          <div className="p-4 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#0D0D0C]/45 block">
              Email Subject Line
            </span>
            <p className="text-xs font-medium text-[#0D0D0C] leading-snug">
              &ldquo;{previewSubject}&rdquo;
            </p>
          </div>

          {/* Key Metrics Snapshot */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3.5 rounded-[18px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] text-center">
              <span className="text-[10px] uppercase tracking-wider text-[#0D0D0C]/45 font-medium block">
                Daily Spend
              </span>
              <span className="text-base font-semibold text-[#0D0D0C] mt-0.5 block">
                {formatCurrency(Math.max(0, safe.dailyAllowance), currency)}
              </span>
              <span className="text-[10px] text-[#0D0D0C]/50">/ day</span>
            </div>

            <div className="p-3.5 rounded-[18px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] text-center">
              <span className="text-[10px] uppercase tracking-wider text-[#0D0D0C]/45 font-medium block">
                Upcoming Bills
              </span>
              <span className="text-base font-semibold text-[#0D0D0C] mt-0.5 block">
                {formatCurrency(upcomingTotal, currency)}
              </span>
              <span className="text-[10px] text-[#0D0D0C]/50">
                {upcomingCount} pending
              </span>
            </div>

            <div className="p-3.5 rounded-[18px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] text-center">
              <span className="text-[10px] uppercase tracking-wider text-[#0D0D0C]/45 font-medium block">
                Payday
              </span>
              <span className="text-base font-semibold text-[#0D0D0C] mt-0.5 block">
                {safe.paydayDay}th
              </span>
              <span className="text-[10px] text-[#0D0D0C]/50">
                {safe.daysUntilPayday > 0 ? `in ${safe.daysUntilPayday}d` : "today"}
              </span>
            </div>
          </div>

          {/* Debit Orders Table Preview */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#0D0D0C]/50">
              Debit Orders Included ({timeline.items.length})
            </span>
            <div className="border border-[#0D0D0C]/[0.08] rounded-[18px] overflow-hidden max-h-40 overflow-y-auto">
              {timeline.items.map((item, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 flex items-center justify-between text-xs border-b border-[#0D0D0C]/[0.05] last:border-none hover:bg-[#FBF6EF]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        item.isCleared ? "bg-emerald-500" : "bg-[#F99654]"
                      }`}
                    />
                    <span className="truncate text-[#0D0D0C] font-medium">
                      {item.note.replace(/\s*\(Recurring\)\s*/i, "")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-[#0D0D0C]/50">
                      {item.day}th
                    </span>
                    <span className="font-semibold text-[#0D0D0C]">
                      {formatCurrency(item.amount, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recipient Email Form */}
          <form onSubmit={handleSendDigest} className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-[0.04em] text-[#0D0D0C]/60">
                Send Digest To
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0D0D0C]/40 stroke-[1.5]" />
                <input
                  type="email"
                  required
                  placeholder="you@domain.co.za"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FBF6EF] text-sm text-[#0D0D0C] placeholder:text-[#0D0D0C]/35 focus:outline-none focus:border-[#0D0D0C] focus:bg-[#FFFDFA] transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 h-11 rounded-full border border-[#0D0D0C]/[0.14] hover:bg-[#FBF6EF] text-xs font-medium text-[#0D0D0C] transition-colors"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={loading || !recipientEmail.trim()}
                className="w-2/3 h-11 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5 stroke-[2]" />
                <span>{loading ? "Delivering..." : "Send Financial Digest"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

