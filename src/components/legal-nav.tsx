"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, FileText, Scale, AlertTriangle, ArrowLeft } from "lucide-react";

export function LegalNav() {
  const pathname = usePathname();

  const tabs = [
    { href: "/privacy", label: "Privacy Policy", icon: ShieldCheck },
    { href: "/terms", label: "Terms of Service", icon: FileText },
    { href: "/legal/popia", label: "POPIA Compliance", icon: Scale },
    { href: "/legal/disclaimer", label: "Financial Disclaimer", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#0D0D0C]/60 hover:text-[#0D0D0C] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Mint Month</span>
        </Link>
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#0D0D0C]/40">
          Effective Date: November 1, 2026 • Republic of South Africa
        </span>
      </div>

      {/* Pill tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#0D0D0C]/[0.08]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-2 shrink-0 ${
                isActive
                  ? "bg-[#0D0D0C] text-[#FFFDFA] shadow-sm"
                  : "bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] text-[#0D0D0C]/70 hover:text-[#0D0D0C] hover:border-[#0D0D0C]/30"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
