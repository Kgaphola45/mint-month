import React from "react";
import type { Metadata } from "next";
import { LegalNav } from "@/components/legal-nav";
import { ShieldCheck, Lock, HardDrive, EyeOff, Trash2, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Mint Month",
  description:
    "Privacy-first monthly expense tracker for South Africans. Learn how your data is protected under POPIA with zero bank linking and zero data selling.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      <LegalNav />

      {/* Hero Header */}
      <div className="space-y-3 pb-8 border-b border-[#0D0D0C]/[0.08]">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-950 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>POPIA Compliant • Zero Data Selling • Local-First</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#0D0D0C]">
          Privacy Policy
        </h1>
        <p className="text-base text-[#0D0D0C]/65 max-w-2xl leading-relaxed">
          Mint Month is built on a simple premise: your personal financial tally belongs solely to you. We never ask for your bank credentials, we never sell your records to advertisers, and we never harvest data.
        </p>
      </div>

      {/* 3 Core Architectural Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] flex items-center justify-center text-[#0D0D0C]">
            <EyeOff className="w-5 h-5 stroke-[1.8]" />
          </div>
          <h2 className="text-sm font-semibold text-[#0D0D0C]">Zero Bank Credentials</h2>
          <p className="text-xs text-[#0D0D0C]/60 leading-relaxed">
            We never perform screen scraping or mandate third-party bank linking. You never submit banking passwords, PINs, or OTPs.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] flex items-center justify-center text-[#0D0D0C]">
            <HardDrive className="w-5 h-5 stroke-[1.8]" />
          </div>
          <h2 className="text-sm font-semibold text-[#0D0D0C]">Local-First Architecture</h2>
          <p className="text-xs text-[#0D0D0C]/60 leading-relaxed">
            Your transactions are cached locally in your browser&apos;s IndexedDB for instant offline access and sub-5ms rendering speeds.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] flex items-center justify-center text-[#0D0D0C]">
            <Lock className="w-5 h-5 stroke-[1.8]" />
          </div>
          <h2 className="text-sm font-semibold text-[#0D0D0C]">Row-Level Security (RLS)</h2>
          <p className="text-xs text-[#0D0D0C]/60 leading-relaxed">
            Encrypted cloud sync enforces Postgres Row-Level Security: only your cryptographically signed auth UUID can query or write your records.
          </p>
        </div>
      </div>

      {/* Detailed Legal Sections */}
      <div className="space-y-10 text-sm sm:text-[15px] text-[#0D0D0C]/80 leading-relaxed bg-[#FFFDFA] p-8 sm:p-12 rounded-[28px] border border-[#0D0D0C]/[0.08] shadow-[0_8px_32px_rgba(13,13,12,0.02)]">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0D0D0C] tracking-tight">
            1. Regulatory Framework & Responsible Party
          </h2>
          <p>
            This Privacy Policy governs the collection, processing, and protection of personal data by <strong>Mint Month</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;the Service&quot;), operating within the <strong>Republic of South Africa</strong>.
          </p>
          <p>
            We process your personal information strictly in accordance with the <strong>Protection of Personal Information Act, 2013 (Act No. 4 of 2013, &quot;POPIA&quot;)</strong>, the <strong>Consumer Protection Act, 2008 (Act No. 68 of 2008)</strong>, and where applicable, international standards including the <strong>General Data Protection Regulation (GDPR)</strong>.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0D0D0C] tracking-tight">
            2. Categories of Information Processed
          </h2>
          <p>
            We collect the absolute minimum data required to facilitate your monthly financial tallying:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#0D0D0C]/70">
            <li>
              <strong className="text-[#0D0D0C]">Account Credentials:</strong> Full name, verified email address, and a one-way cryptographically salted password hash.
            </li>
            <li>
              <strong className="text-[#0D0D0C]">Self-Logged Financial Records:</strong> Outlay amounts, custom category labels, payment methods (e.g. Cash, Card, EFT), transaction dates, and personal notes.
            </li>
            <li>
              <strong className="text-[#0D0D0C]">Budgetary Settings:</strong> Monthly budget thresholds, quarantined debit order targets, and debt instalment milestones.
            </li>
          </ul>
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 mt-3">
            <strong>Explicit Exclusion:</strong> Mint Month will never request, store, or process your South African National Identity Number, Passport Number, credit card CVV/CVC codes, or banking portal login passwords.
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0D0D0C] tracking-tight">
            3. Purpose of Processing Under POPIA Section 13
          </h2>
          <p>
            Your information is processed strictly for defined, lawful purposes:
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-[#0D0D0C]/70">
            <li>Enabling self-directed calculation of your daily guilt-free allowance and runway.</li>
            <li>Syncing your records securely across your authorized browsers and devices.</li>
            <li>Dispatching essential security OTPs and monthly email financial digests requested by you.</li>
            <li>Preventing fraudulent access and unauthorized token manipulation.</li>
          </ol>
          <p>
            <strong>We do not sell, license, lease, or monetize your financial ledger to insurance providers, lending institutions, or data brokers.</strong>
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0D0D0C] tracking-tight">
            4. Third-Party Operators & Sub-Processors
          </h2>
          <p>
            We engage only audited enterprise infrastructure providers adhering to ISO/IEC 27001, SOC 2 Type II, and POPIA operator obligations:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[#0D0D0C]/70">
            <li>
              <strong className="text-[#0D0D0C]">Supabase Inc.:</strong> Secure PostgreSQL database hosting with hardware-level AES-256 encryption at rest and Row-Level Security isolation.
            </li>
            <li>
              <strong className="text-[#0D0D0C]">Microsoft 365 / Outlook SMTP:</strong> Dispatches transactional communications (password reset OTPs, welcome verification).
            </li>
          </ul>
          <p className="text-xs text-[#0D0D0C]/50">
            We employ zero third-party advertising tracking scripts, zero Google Analytics telemetry beacons, and zero Facebook Pixel cookies.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0D0D0C] tracking-tight">
            5. Data Subject Rights (Access, Correction & Deletion)
          </h2>
          <p>
            Under Section 23 and Section 24 of POPIA, you possess unconditional rights over your personal data:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#0D0D0C]/70">
            <li>
              <strong className="text-[#0D0D0C]">Right of Complete Portability:</strong> Export your ledger anytime in comma-separated values (CSV) or JSON spreadsheet formats via Settings.
            </li>
            <li>
              <strong className="text-[#0D0D0C]">Right of Correction:</strong> Update or modify any budget category, income amount, or transaction directly within the app.
            </li>
            <li>
              <strong className="text-[#0D0D0C]">Right of Absolute Erasure (&quot;Right to be Forgotten&quot;):</strong> Trigger the &quot;Permanently Delete Account&quot; action in Settings. This permanently purges your user record, authentication credentials, and all transaction history across both local device storage and our cloud database with immediate effect.
            </li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0D0D0C] tracking-tight">
            6. Security Measures Under POPIA Section 19
          </h2>
          <p>
            We maintain rigorous technical and organizational safeguards:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#0D0D0C]/70">
            <li>Strict HTTPS and Transport Layer Security (TLS 1.3) across all client-server exchanges.</li>
            <li>Multi-tenant row isolation ensuring users cannot query or inspect other accounts.</li>
            <li>Short-lived one-time passcodes (OTP) for sensitive operations expiring in 15 minutes.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="space-y-3 pt-4 border-t border-[#0D0D0C]/[0.08]">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0D0D0C] tracking-tight">
            7. Information Officer Contact
          </h2>
          <p>
            To lodge an inquiry, exercise your data subject rights under POPIA, or report a suspected security concern, contact our Information Officer:
          </p>
          <div className="p-5 rounded-2xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] text-xs space-y-1 font-mono">
            <p className="font-semibold text-[#0D0D0C]">Information Officer: Emmanuel Kgaphola</p>
            <p>Email: emmanuelkgaphola@outlook.com</p>
            <p>Jurisdiction: High Court of South Africa (Gauteng Division)</p>
          </div>
        </section>
      </div>
    </div>
  );
}

