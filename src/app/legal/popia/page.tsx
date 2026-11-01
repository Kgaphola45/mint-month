import React from "react";
import type { Metadata } from "next";
import { LegalNav } from "@/components/legal-nav";
import { Scale, CheckCircle2, ShieldAlert, FileText, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "POPIA Compliance & Subject Rights — Mint Month",
  description:
    "Information on Mint Month compliance with South Africa's Protection of Personal Information Act (POPIA Act No. 4 of 2013).",
};

export default function PopiaCompliancePage() {
  const conditions = [
    {
      num: "Condition 1",
      title: "Accountability",
      desc: "Mint Month designates a formal Information Officer responsible for ensuring continuous adherence to all statutory requirements under POPIA.",
    },
    {
      num: "Condition 2",
      title: "Processing Limitation",
      desc: "Information is processed with direct user consent and strictly minimized. We never collect national ID numbers, banking passwords, or telemetry without reason.",
    },
    {
      num: "Condition 3",
      title: "Purpose Specification",
      desc: "Personal data is collected exclusively for private expense tracking, budget calculations, and transactional security verifications.",
    },
    {
      num: "Condition 4",
      title: "Further Processing Limitation",
      desc: "Financial tallies are never transferred, cross-matched, or commoditized for commercial marketing, insurance profiling, or credit scoring.",
    },
    {
      num: "Condition 5",
      title: "Information Quality",
      desc: "Users retain full, unhindered ability to update, correct, categorize, or re-label any recorded expense or financial balance at any time.",
    },
    {
      num: "Condition 6",
      title: "Openness",
      desc: "Complete transparency regarding where data resides (local IndexedDB cache and encrypted cloud Supabase storage) and how it is processed.",
    },
    {
      num: "Condition 7",
      title: "Security Safeguards",
      desc: "Hardware-level AES-256 database encryption, cryptographic bcrypt password hashing, HTTPS/TLS 1.3 transport, and Postgres Row-Level Security.",
    },
    {
      num: "Condition 8",
      title: "Data Subject Participation",
      desc: "Unconditional self-service access to export all stored records (CSV/JSON) or immediately destroy all personal data via Settings.",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      <LegalNav />

      {/* Hero Header */}
      <div className="space-y-3 pb-8 border-b border-[#0D0D0C]/[0.08]">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-950 text-xs font-medium">
          <Scale className="w-3.5 h-3.5 text-emerald-700" />
          <span>Statutory Compliance • Act No. 4 of 2013</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#0D0D0C]">
          POPIA Compliance Statement
        </h1>
        <p className="text-base text-[#0D0D0C]/65 max-w-2xl leading-relaxed">
          Comprehensive compliance declaration under the Protection of Personal Information Act (POPIA) for data subjects residing in the Republic of South Africa.
        </p>
      </div>

      {/* 8 Conditions of Lawful Processing Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-[#0D0D0C]">
          The 8 Statutory Conditions for Lawful Processing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conditions.map((item) => (
            <div
              key={item.num}
              className="p-5 rounded-2xl bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] space-y-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {item.num}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-semibold text-[#0D0D0C]">{item.title}</h3>
              <p className="text-xs text-[#0D0D0C]/60 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rights & Forms */}
      <div className="space-y-8 bg-[#FFFDFA] p-8 sm:p-12 rounded-[28px] border border-[#0D0D0C]/[0.08] shadow-[0_8px_32px_rgba(13,13,12,0.02)] text-sm text-[#0D0D0C]/80 leading-relaxed">
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-[#0D0D0C] tracking-tight">
            Exercising Form 1 & Form 2 Statutory Requests
          </h3>
          <p>
            While Mint Month provides automated self-service buttons inside the Settings dashboard for immediate data download (Form 1 equivalent) and account destruction (Form 2 equivalent), you may also submit formal statutory requests directly to our designated Information Officer:
          </p>
          <div className="p-4 rounded-xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] font-mono text-xs space-y-1">
            <p className="font-semibold text-[#0D0D0C]">Designated Information Officer: Emmanuel Kgaphola</p>
            <p>Direct Inquiries: emmanuelkgaphola@outlook.com</p>
            <p>Physical Jurisdiction: Gauteng, Republic of South Africa</p>
          </div>
        </section>

        <section className="space-y-3 pt-6 border-t border-[#0D0D0C]/[0.08]">
          <h3 className="text-lg font-semibold text-[#0D0D0C] tracking-tight">
            The Information Regulator (South Africa)
          </h3>
          <p>
            Should you believe that your personal information has been processed in contravention of POPIA and we have failed to satisfactorily resolve your complaint, you are entitled to lodge a complaint with the statutory supervisory body:
          </p>
          <div className="p-4 rounded-xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] text-xs space-y-1 text-[#0D0D0C]/75">
            <p className="font-semibold text-[#0D0D0C]">The Information Regulator (South Africa)</p>
            <p>JD House, 27 Stiemens Street, Braamfontein, Johannesburg, 2001</p>
            <p>P.O Box 31533, Braamfontein, Johannesburg, 2017</p>
            <p>General Enquiries: enquiries@inforegulator.org.za</p>
            <p>Complaints: POPIAComplaints@inforegulator.org.za</p>
          </div>
        </section>
      </div>
    </div>
  );
}
