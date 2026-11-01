import React from "react";
import type { Metadata } from "next";
import { LegalNav } from "@/components/legal-nav";
import { FileText, AlertTriangle, Scale, CheckCircle2, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — Mint Month",
  description:
    "Terms and Conditions governing the use of Mint Month expense tracker in South Africa. Includes FAIS Act non-advice disclaimer and user rights.",
};

export default function TermsOfServicePage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      <LegalNav />

      {/* Hero Header */}
      <div className="space-y-3 pb-8 border-b border-[#0D0D0C]/[0.08]">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FFFDFA] text-[#0D0D0C] text-xs font-medium">
          <FileText className="w-3.5 h-3.5 text-[#0D0D0C]" />
          <span>Terms & Conditions • Republic of South Africa</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#0D0D0C]">
          Terms of Service
        </h1>
        <p className="text-base text-[#0D0D0C]/65 max-w-2xl leading-relaxed">
          Please read these terms carefully before utilizing Mint Month. By accessing our platform, you agree to these conditions of transparent, self-directed financial tallying.
        </p>
      </div>

      {/* Mandatory Statutory Notice */}
      <div className="p-6 sm:p-7 rounded-2xl bg-amber-50 border border-amber-300/80 text-amber-950 space-y-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
          <h2 className="text-sm font-semibold tracking-tight">
            Important Notice: Non-Advisory Software Tool (FAIS Act Disclaimer)
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
          Mint Month is a self-directed calculation software platform. <strong>Mint Month is NOT an authorized Financial Services Provider (FSP)</strong> under the <em>Financial Advisory and Intermediary Services Act, 2002 (Act No. 37 of 2002, &quot;FAIS&quot;)</em>, nor is it a registered credit bureau or debt counseling practitioner under the <em>National Credit Act, 2005 (Act No. 34 of 2005)</em>. No calculation, &quot;Safe-to-Spend&quot; indicator, &quot;Can I Afford It&quot; simulation, or report constitutes certified financial, legal, or investment advice.
        </p>
      </div>

      {/* Terms Body */}
      <div className="space-y-10 text-sm sm:text-[15px] text-[#0D0D0C]/80 leading-relaxed bg-[#FFFDFA] p-8 sm:p-12 rounded-[28px] border border-[#0D0D0C]/[0.08] shadow-[0_8px_32px_rgba(13,13,12,0.02)]">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0D0D0C] tracking-tight">
            1. Acceptance of Terms
          </h2>
          <p>
            By registering an account, opening the application, or utilizing any functionality of <strong>Mint Month</strong> (&quot;the Platform&quot;), you enter into a legally binding contract with Mint Month governed by the laws of the Republic of South Africa.
          </p>
          <p>
            If you do not accept these Terms in their entirety, you must immediately discontinue use of the platform and delete your local/cloud records.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0D0D0C] tracking-tight">
            2. Scope & Nature of the Service
          </h2>
          <p>
            Mint Month provides an editorial, privacy-first ledger designed to allow users to manually record and analyze their personal monthly expenses, recurring debit orders, and debt repayment schedules.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#0D0D0C]/70">
            <li>The platform performs mathematical tallying based strictly on values entered by you.</li>
            <li>We do not connect directly to banking APIs (e.g. Capitec, FNB, Standard Bank, Nedbank, Absa, Discovery Bank).</li>
            <li>We do not initiate debit orders, execute electronic funds transfers (EFTs), or manage creditor payments on your behalf.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0D0D0C] tracking-tight">
            3. User Ledger Ownership & Intellectual Property
          </h2>
          <p>
            You retain <strong>100% sole ownership, copyright, and title</strong> over all transactional data, budget entries, category descriptions, and financial targets entered into your ledger.
          </p>
          <p>
            Mint Month grants you a personal, non-exclusive, revocable license to use the application interface and design system. All brand identity, typography systems, editorial algorithms, and software code remain the exclusive intellectual property of Mint Month.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0D0D0C] tracking-tight">
            4. User Responsibilities & Acceptable Use
          </h2>
          <p>You agree to:</p>
          <ol className="list-decimal pl-5 space-y-1.5 text-[#0D0D0C]/70">
            <li>Maintain the confidentiality of your login credentials and authentication OTPs.</li>
            <li>Supply accurate email addresses for account recovery verification.</li>
            <li>Refrain from attempting automated penetration testing, reverse-engineering, or denial-of-service exploits against our API routes.</li>
            <li>Not use the platform for unlawful money laundering or proceeds of crime tracking under South Africa&apos;s Financial Intelligence Centre Act (FICA).</li>
          </ol>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0D0D0C] tracking-tight">
            5. Disclaimer of Warranties & Limitation of Liability
          </h2>
          <p>
            The service is delivered on an <strong>&quot;AS IS&quot; and &quot;AS AVAILABLE&quot;</strong> basis without warranty of any kind, whether express or implied.
          </p>
          <p>
            To the maximum extent permitted by Section 61 of the Consumer Protection Act, 2008, <strong>Mint Month and its developers shall not be liable</strong> for:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#0D0D0C]/70">
            <li>Overdraft fees, dishonoured debit order penalties, or interest charges incurred with your banking institution.</li>
            <li>Inaccuracies resulting from user-entered mathematical or category errors.</li>
            <li>Data loss resulting from browser cache clearing, device theft, or local disk corruption.</li>
            <li>Temporary downtime or network disruptions experienced by upstream cloud providers.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0D0D0C] tracking-tight">
            6. Account Termination & Self-Service Erasure
          </h2>
          <p>
            You may terminate your agreement with us at any time by executing the &quot;Permanently Delete Account&quot; function under Settings. Upon execution, all stored database records and credentials associated with your profile are irrevocably eradicated.
          </p>
          <p>
            We reserve the right to suspend or restrict accounts that violate these terms or abuse automated server resources.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3 pt-4 border-t border-[#0D0D0C]/[0.08]">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0D0D0C] tracking-tight">
            7. Governing Law & Jurisdiction
          </h2>
          <p>
            These Terms are governed exclusively by the laws of the <strong>Republic of South Africa</strong>. Any disputes arising in connection with these Terms shall be subject to the exclusive jurisdiction of the Magistrates&apos; Court or the High Court of South Africa (Gauteng Division, Johannesburg).
          </p>
        </section>
      </div>
    </div>
  );
}

