import React from "react";
import type { Metadata } from "next";
import { LegalNav } from "@/components/legal-nav";
import { AlertTriangle, ShieldCheck, Scale, Calculator, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Financial & Regulatory Disclaimer — Mint Month",
  description:
    "Important statutory disclaimer regarding the mathematical and non-advisory nature of Mint Month under South Africa's FAIS Act and National Credit Act.",
};

export default function FinancialDisclaimerPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      <LegalNav />

      {/* Hero Header */}
      <div className="space-y-3 pb-8 border-b border-[#0D0D0C]/[0.08]">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-950 text-xs font-medium">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
          <span>FAIS Act Notice • Calculation Tool Only</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#0D0D0C]">
          Financial & Non-Advisory Disclaimer
        </h1>
        <p className="text-base text-[#0D0D0C]/65 max-w-2xl leading-relaxed">
          Mint Month is an independent, self-directed mathematical software platform. Read this statutory disclaimer to understand the precise legal boundaries of our calculations.
        </p>
      </div>

      {/* Main Alert Card */}
      <div className="p-6 sm:p-8 rounded-[24px] bg-amber-50/70 border border-amber-300/80 text-amber-950 space-y-4 shadow-sm">
        <h2 className="text-base sm:text-lg font-semibold tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
          <span>Notice Under the Financial Advisory and Intermediary Services Act (FAIS)</span>
        </h2>
        <p className="text-sm leading-relaxed text-amber-900/90">
          <strong>Mint Month is NOT an authorized Financial Services Provider (FSP)</strong> under the <em>Financial Advisory and Intermediary Services Act, 2002 (Act No. 37 of 2002, &quot;FAIS&quot;)</em>. We are not registered with the Financial Sector Conduct Authority (FSCA) or the Prudential Authority of the South African Reserve Bank.
        </p>
        <p className="text-sm leading-relaxed text-amber-900/90">
          No feature, algorithm, statistical projection, Safe-to-Spend indicator, or Monthly Editorial Story constitutes financial advice, investment counsel, tax advice, legal opinion, or insurance intermediation.
        </p>
      </div>

      {/* Specific Feature Breakdowns */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight text-[#0D0D0C]">
          Statutory Interpretation of Core Algorithmic Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] space-y-2.5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] flex items-center justify-center text-[#0D0D0C]">
              <Calculator className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-[#0D0D0C]">
              Daily &quot;Safe-to-Spend&quot; Meter
            </h3>
            <p className="text-xs text-[#0D0D0C]/65 leading-relaxed">
              The Safe-to-Spend meter is a purely deterministic mathematical formula: (discretionary cash buffer divided by the calendar days remaining until your specified payday). It does not assess credit risk, bank liquidity, interest fluctuations, or sudden bank account debits.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] space-y-2.5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] flex items-center justify-center text-[#0D0D0C]">
              <Info className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-[#0D0D0C]">
              &quot;Can I Afford It?&quot; Simulator
            </h3>
            <p className="text-xs text-[#0D0D0C]/65 leading-relaxed">
              This feature simulates hypothetical consequences of a planned purchase on remaining discretionary runway. It is NOT a statutory affordability assessment as contemplated in Section 81 of the National Credit Act, 2005 (Act No. 34 of 2005).
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] space-y-2.5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] flex items-center justify-center text-[#0D0D0C]">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-[#0D0D0C]">
              Debt & Instalment Tracker
            </h3>
            <p className="text-xs text-[#0D0D0C]/65 leading-relaxed">
              Our debt contract modules are personal milestone trackers for store cards, phone contracts, or personal loans. Mint Month does not provide debt counseling, debt mediation, or restructuring services under Section 86 of the National Credit Act.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] space-y-2.5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] flex items-center justify-center text-[#0D0D0C]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-[#0D0D0C]">
              Independent Professional Advice
            </h3>
            <p className="text-xs text-[#0D0D0C]/65 leading-relaxed">
              If you require professional financial planning, retirement guidance, insolvency counseling, or investment advice, consult an authorized financial advisor licensed with the Financial Sector Conduct Authority (FSCA).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

