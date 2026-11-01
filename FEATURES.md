# Mint Month — Feature Specifications & Deep Dive

> A comprehensive reference guide for all 12 power-user features, calculation engines, and design systems in **Mint Month**.

---

## Table of Contents
1. [⌘K Linear / Raycast Command Palette](#1-k-linear--raycast-command-palette)
2. [The "Can I Afford It?" Purchase Simulator](#2-the-can-i-afford-it-purchase-simulator)
3. [Month-End "Editorial Financial Story" (Monthly Wrapped)](#3-month-end-editorial-financial-story-monthly-wrapped)
4. [Guilt-Free Safe-to-Spend Daily Meter](#4-guilt-free-safe-to-spend-daily-meter)
5. [Payday & Debit Order Email Digest](#5-payday--debit-order-email-digest)
6. [Upcoming Recurring Bills & Debit Order Timeline](#6-upcoming-recurring-bills--debit-order-timeline)
7. [Multi-Month Budget Management & Category Ticks](#7-multi-month-budget-management--category-ticks)
8. [Debt & Financing Contract Tracker](#8-debt--financing-contract-tracker)
9. [Analytics & Comparison Hub](#9-analytics--comparison-hub)
10. [Comprehensive Transaction Ledger](#10-comprehensive-transaction-ledger)
11. [Privacy-First Architecture & Multi-User Accounts](#11-privacy-first-architecture--multi-user-accounts)
12. [Vela-Inspired Editorial Aesthetic](#12-vela-inspired-editorial-aesthetic)

---

### 1. ⌘K Linear / Raycast Command Palette
**Hotkey:** <kbd>Ctrl+K</kbd> / <kbd>⌘K</kbd> anywhere in the application.

A keyboard-first launcher designed for instantaneous workflow execution without leaving your keyboard.

- **Natural Language Quick-Add:**
  - `Add R250 lunch` → Auto-detects amount (`250`), resolves category to `Food & Dining`, logs to active month on today's date, and triggers micro-confetti.
  - `Add 45 uber` → Resolves amount `45`, classifies into `Transport`.
  - `Add R899 groceries` → Classifies into `Groceries`.
- **Month Switching:**
  - `Go to September` or `Go to Oct` → Instantly sets the global active month and updates all ledger calculations.
- **Instant Shortcuts:**
  - `Afford [amount]` (e.g. `Afford R1200`) → Launches the Purchase Simulator pre-filled.
  - `Export CSV` → Directly triggers browser CSV file download of the entire ledger.
  - `Digest` → Opens the email summary modal to send or preview the payday digest.
  - `Wrapped` → Opens the 3-slide editorial magazine story.
- **Global Page Navigation:** Fast jump to `/` (Dashboard), `/transactions`, `/budgets`, `/compare` (Analytics), and `/settings`.

---

### 2. The "Can I Afford It?" Purchase Simulator
**Hotkey:** <kbd>A</kbd>

A pre-purchase decision engine that evaluates the consequence of an outlay *before* you swipe your card.

- **Daily Runway Consequence Calculation:**
  Instead of passive budget warnings, Mint Month translates discretionary purchases into daily living consequences:
  $$\text{New Daily Safe Spend} = \frac{\text{Current Safe Buffer} - \text{Purchase Amount}}{\text{Days Remaining until Payday}}$$
  *Example:* *"Buying this will reduce your guilt-free allowance from R280/day → R185/day for the remaining 14 days until payday."*
- **Dynamic Editorial Verdicts:**
  - **Comfortably Affordable** (Sage `#DFE9D4`): Outlay consumes less than 15% of remaining safe discretionary pool.
  - **Moderate Allowance Impact** (Peach `#F8DCC7`): Outlay is manageable but tightens daily pace by 15–35%.
  - **Significantly Tightens Daily Pace** (Lavender `#ECD6E2`): Outlay consumes 35–65% of buffer; daily allowance drops sharply.
  - **Exceeds Discretionary Buffer** (Rose Ink): Outlay exceeds the remaining safe cash pool and would encroach into ring-fenced debit order money.
- **Quick-Preset Outlay Pills:** One-tap chips for common spends: `+R150`, `+R350`, `+R750`, `+R1,450`, `+R2,500`, and `+R5,000`.
- **One-Click Commit:** "Proceed & Log Expense" button immediately writes the item into your ledger with category auto-tagging.

---

### 3. Month-End "Editorial Financial Story" (Monthly Wrapped)
**Hotkey:** <kbd>W</kbd>

On the 1st of every month (or on-demand via header button and hotkey), Mint Month synthesizes the closed month into a publication-grade 3-slide magazine story:

- **Slide 1: The Verdict & Daily Rhythm:**
  - Editorial headline: *"In October, you stayed under budget by R1,240 and logged 9 no-spend days."*
  - Key performance indicators: *Total Outflow*, *Preserved Buffer*, *No-Spend Days*, and *Average Daily Burn*.
  - 31-day visual calendar rhythm heatmap spotlighting quiet low-spend days vs. spike days.
- **Slide 2: Category Volume & Habit Shifts:**
  - Headline: *"Groceries was your highest category (34%), while Entertainment dropped by 18% compared to September."*
  - Identifies top volume driver vs. smartest pullback category with month-over-month percentage change ($\Delta$).
- **Slide 3: Payday Readiness & Debt Momentum:**
  - Headline: *"3 debit orders cleared on time. R3,800 saved into debt paydown."*
  - Ring-fence audit: 100% on-time contract fulfillment, total principal debt reduced across active loans, and cash cushion carried forward.
- **Retina Export & Print:**
  - High-res PNG export of any individual slide using client-side rasterization (`html-to-image`).
  - Print/save clean publication-styled A4 PDF reports via `@media print`.

---

### 4. Guilt-Free Safe-to-Spend Daily Meter
Guarantees zero end-of-month surprises by quarantining contract commitments upfront.

- **Contract Ring-Fencing:**
  Fixed obligations (rent, car finance, medical aid, WiFi, loan repayments) are quarantined on day 1:
  $$\text{Safe Buffer} = \text{Net Salary} - \sum \text{Debit Orders} - \sum \text{Discretionary Spend to Date}$$
- **Daily Safe-to-Spend Rate:**
  $$\text{Daily Safe Spend} = \frac{\text{Safe Buffer}}{\text{Days Remaining in Cycle}}$$
- **Multi-Segment Allocation Visual:**
  Interactive visual gauge showing:
  - Slate Gray: Ring-fenced debit orders & fixed contracts.
  - Warm Peach / Rose: Discretionary spend consumed.
  - Soft Sage: Remaining guilt-free buffer for the month.

---

### 5. Payday & Debit Order Email Digest
Consolidated morning briefing delivered directly to your inbox via personal Gmail SMTP.

- **What It Sends:**
  - Monthly take-home salary and contract ring-fence status.
  - Itemized debit order checklist (cleared vs. upcoming dates).
  - Countdown to next payday and remaining daily guilt-free allowance.
- **Privacy & Transport:**
  - Sent securely through your own Gmail App Password via Nodemailer.
  - Zero external marketing or tracking relays.
  - Includes local `devBypassOtp` fallback so developers can test auth and email flows locally without credentials.

---

### 6. Upcoming Recurring Bills & Debit Order Timeline
A dedicated forward-looking schedule for every recurring obligation.

- **Date Countdowns:** Badges indicating *Today*, *In 2 days*, *In 5 days*, or *Cleared*.
- **Interactive Checklist:** Mark debit orders as cleared with a single tap—instantly updates the ring-fenced ledger and visual timeline.
- **Provider Metadata:** Categorize by banking debit order, direct EFT, or card subscription.

---

### 7. Multi-Month Budget Management & Category Ticks
Organized strictly on a month-by-month basis.

- **Category Caps:** Establish granular spending targets per category (e.g. Groceries, Dining, Fuel, Entertainment).
- **Visual Progress Trackers:** Real-time color-graded progress bars with soft amber alerts at 80% and rose warnings at 100%.
- **Reconciliation Ticks:** Mark individual categories as "Sorted" once reconciled at month end.
- **Cycle Propagation:** Propagate custom budget allocations to all future months with one click.

---

### 8. Debt & Financing Contract Tracker
Centralizes split-pay platforms (PayJustNow, Mobicred), vehicle financing, and fixed-term contracts.

- **Contract Details:** Tracks original balance, monthly payment, payments completed, and total remaining debt.
- **"Next Payoff" Spotlight:** Highlights the nearest completing debt obligation to maintain psychological debt-paydown momentum.
- **Progress Gauges:** Visual percentage bars displaying debt amortized to date.

---

### 9. Analytics & Comparison Hub (`/compare`)
Deep analytical insights into financial habits over time:

- **Month-over-Month Head-to-Head:** Side-by-side comparative cards for income, expenditure, and savings rate.
- **Cumulative Burn-Rate Pace:** Interactive chart tracking actual day-by-day spend against the ideal linear burn rate.
- **Day-of-Week Rhythm:** Uncovers weekend spending spikes vs. weekday discipline.
- **50/30/20 Cashflow Architecture:** Automatically categorizes outflows into Needs, Wants, and Savings/Debt Paydown.

---

### 10. Comprehensive Transaction Ledger (`/transactions`)
A responsive tabular ledger designed for speed and clarity:

- **Real-Time Filtering:** Filter by category, payment method (`Card`, `Cash`, `Bank`, `EFT`, `Instant EFT`), and recurring flags.
- **Instant Search:** Full-text search across descriptions, notes, amounts, and dates.
- **Inline Editing & Removal:** Update or delete entries inline; all dependent dashboard statistics recalculate instantaneously.
- **CSV Import & Export:** One-click spreadsheet export for external accounting.

---

### 11. Privacy-First Architecture & Multi-User Accounts
- **100% Client-Side Storage:** All user data, budgets, and transactions reside strictly in browser storage (`localStorage` / Zustand persist).
- **Zero Third-Party Relays:** No telemetry trackers, ad pixels, or third-party analytical cookies.
- **Multi-Account Switching:** Support for distinct household or personal profiles with salted bcrypt password hashing.
- **Hardened Auth Flows:** In-memory rate limiting, 10-minute expiry windows, and SHA-256 hashed one-time pins for password recovery.
- **Multi-Currency Engine:** Seamless switching between South African Rand (`ZAR R`), US Dollar (`USD $`), Euro (`EUR €`), British Pound (`GBP £`), and custom currency codes.
- **Full Data Portability:** Complete JSON backup download and single-click JSON restore.

---

### 12. Vela-Inspired Editorial Aesthetic
A design language inspired by print publication editorial layouts:

- **Color Palette:** Warm cream canvas (`#FBF6EF`), crisp paper cards (`#FFFDFA`), charcoal body ink (`#0D0D0C`), and soft muted accents (lemon, peach, sage, rose).
- **Fractal Noise Grain:** Subtle 18% SVG noise overlay with CSS `mix-blend-mode: multiply` for physical paper texture.
- **Typography:** `Inter Tight` paired with `-0.032em` letter-tracking on primary metric numbers for a sharp financial press aesthetic.
- **Borders & Elevation:** Hairline borders (`rgba(13, 13, 12, 0.08)`) and diffuse shadow treatments (`0 20px 48px -12px rgba(13, 13, 12, 0.06)`).

