# Mint Month 🌿

> **A minimal, privacy-first expense tracker and cashflow planner.**
> Built with an editorial magazine aesthetic, organized strictly by month.

---

## ⚡ Power-User Features & Overview

Mint Month is designed for mindful personal finance—combining pre-purchase decision simulation, debit order ring-fencing, monthly wrapped storytelling, and a keyboard-first command workflow.

---

### 1. ⌘K Linear / Raycast Command Palette (`Ctrl+K` / `⌘K`)
Keyboard-first command center for power users with natural language action parsing:
- **`Add R250 lunch`** → Immediately parses the amount, auto-detects the category (`Food & Dining`), logs the expense for today, and triggers confetti.
- **`Go to September`** → Instantly switches the active month and updates all ledger metrics.
- **`Export CSV`** → Downloads your entire ledger as a clean spreadsheet file with one keystroke.
- **`Digest`** → Triggers the ring-fenced salary breakdown and debit order email summary modal.
- **`Afford R1450`** → Launches the Purchase Decision Simulator pre-filled with your amount.
- **Global Search & Navigation** → Instantly jump between Dashboard, Transactions, Budgets, Analytics, or Settings.

---

### 2. 🔮 The "Can I Afford It?" Purchase Simulator (Hotkey: `A`)
A decision-making tool to evaluate discretionary outlays *before* you swipe your card:
- **Daily Runway Consequence:** Calculates the exact impact on your daily allowance until payday:
  > *“Buying this will reduce your guilt-free allowance from R280/day → R185/day for the remaining 14 days until payday.”*
- **Dynamic Editorial Verdict Badges:**
  - `Comfortably Affordable` (Soft Sage `#DFE9D4`)
  - `Moderate Allowance Impact` (Soft Peach `#F8DCC7`)
  - `Significantly Tightens Daily Pace` (Muted Lavender `#ECD6E2`)
  - `Exceeds Discretionary Buffer` (Rose Ink `bg-rose-100`)
- **Quick Preset Pills:** Tap `+R150`, `+R350`, `+R750`, `+R1,450`, `+R2,500`, or `+R5,000`.
- **One-Click Log:** "Proceed & Log Expense" saves the outlay directly to your ledger with celebratory micro-confetti.

---

### 3. 📖 Month-End "Editorial Financial Story" (Monthly Wrapped, Hotkey: `W`)
On the 1st of every month (or anytime via header and hotkey), Mint Month presents a 3-slide editorial magazine review of the closed month:
- **Slide 1: The Verdict:**
  > *“In October, you stayed under budget by R1,240 and logged 9 no-spend days.”*
  - Features 4 editorial metric cards (*Total Outflow*, *Preserved Buffer*, *No-Spend Days*, *Daily Pace*).
  - 31-day calendar rhythm heatmap highlighting quiet no-spend days and peak outlay days.
- **Slide 2: Category Shifts:**
  > *“Groceries was your highest category (34%), while Entertainment dropped by 18% compared to September.”*
  - Spotlights your #1 volume driver vs. your smartest pullback category with month-over-month $\Delta$ percentage shifts.
- **Slide 3: Payday Readiness & Resilience:**
  > *“3 debit orders cleared on time. R3,800 saved into debt paydown.”*
  - Verifies 100% on-time contract fulfillment, principal debt reduction across active agreements, and forward cash cushion into the new month.
- **Publication-Grade Export:**
  - Export any slide or the full review as high-res retina PNG images (`html-to-image`).
  - Print/save clean A4 PDF reports via browser `window.print()` with custom print styling.

---

### 4. 🇿🇦 Guilt-Free Safe-to-Spend Daily Meter
Guarantees zero month-end debit order surprises:
- **Contract Ring-Fencing:** Quarantines fixed debit orders, loans, and subscriptions before computing your spending money.
- **Daily Allowance Formula:** Accurately calculates what you can spend each day without touching money locked for contracts:
  $$\text{Daily Allowance} = \frac{\text{Take-Home Salary} - \text{Fixed Commitments} - \text{Discretionary Spent}}{\text{Days Remaining}}$$
- **Visual Allocation Bar:** Multi-segment breakdown displaying locked debit orders, variable spend so far, and remaining safe buffer.

---

### 5. 📬 Payday & Debit Order Email Digest
One-click email summary sent directly to your inbox via free Gmail Nodemailer:
- Sends a consolidated briefing: take-home salary, debit orders cleared vs. pending, days until payday, and remaining guilt-free cushion.
- Dev bypass support for seamless local testing without live email credentials.

---

### 6. 📅 Upcoming Recurring Bills & Debit Order Timeline
- Track recurring contracts (e.g. WiFi, Phone, Laptop, Medical Aid, Insurance).
- Calendar-day countdowns (*e.g. in 3 days*, *today*, *cleared*).
- One-click checklist to mark debit orders as cleared with instant visual strike-through and ledger updates.

---

### 7. 🎯 Multi-Month Budget Management & Category Ticks
- Set total monthly budget caps and category-level limits.
- Color-coded progress bars with warning alerts when limits are approached or exceeded.
- "Sorted" tick marks to reconcile categories at month-end.
- Recurring budget propagation: copy current month budgets to all future cycles with one click.

---

### 8. 💳 Debt & Financing Contract Tracker
- Monitor fixed-term agreements, split-pay platforms (PayJustNow), and device contracts.
- Tracks total contract amount, monthly instalment, remaining balance, and months left.
- "Next Payoff" spotlight: highlights which contract finishes next to keep debt momentum visible.

---

### 9. 📊 Analytics & Comparison Hub (`/compare`)
- **Month-over-Month Head-to-Head:** Side-by-side comparison of total spend and budget performance.
- **Cumulative Burn-Rate Pace:** Interactive chart tracking actual spending against the ideal linear burn rate.
- **Day-of-Week Rhythm:** Uncovers spending patterns across weekdays vs. weekends.
- **Cashflow Architecture:** 50/30/20 breakdown of Needs, Wants, and Savings/Debt.

---

### 10. 📝 Comprehensive Transaction Ledger (`/transactions`)
- Filter transactions by category, payment method (`Card`, `Cash`, `Bank`, `EFT`, `Instant EFT`), and recurring status.
- Real-time search across notes, amounts, and dates.
- Instant inline editing and deletion with automatic recalculation across all dashboard stats.

---

### 11. 🔒 Privacy-First Architecture & Multi-User Accounts
- **100% Local-First:** All financial records are stored client-side in browser storage. Zero tracking servers, zero third-party ads.
- **Multi-Account Switcher:** Secure local user accounts with salted bcrypt hashing.
- **Hardened Auth Flow:** In-memory rate limiting, 10-minute expiry, and SHA-256 hashed one-time pins for password recovery.
- **Multi-Currency Support:** South African Rand (`ZAR R`), US Dollar (`USD $`), Euro (`EUR €`), British Pound (`GBP £`), and more.
- **Data Portability:** Complete export to CSV and full JSON backup/restore.

---

### 12. 🎨 Vela-Inspired Editorial Aesthetic
- Editorial cream background `#FBF6EF` with `#FFFDFA` warm paper cards.
- Subtle SVG fractal noise grain overlay at 18% opacity with mix-blend-multiply.
- Inter Tight typography with -0.032em tracking for large figures.
- Hairline borders (`#0D0D0C/0.08`) and muted accents (lemon, peach, sage, rose).

---

## 📧 Email Setup - Free Gmail

Mint Month uses Nodemailer with personal Gmail SMTP (no domain verification or paid tier required):

1. **Enable 2-Step Verification**:
   - Go to your [Google Account Security](https://myaccount.google.com/security).
   - Under "How you sign in to Google", ensure **2-Step Verification** is enabled.

2. **Generate an App Password**:
   - Search for **App passwords** in your Google Account (or visit [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
   - Name your app (e.g. `Mint Month`) and click **Create**.
   - Copy the generated 16-character password (e.g. `abcd efgh ijkl mnop`).

3. **Configure Environment Variables**:
   - Create `.env.local`:
     ```env
     GMAIL_USER=your_email@gmail.com
     GMAIL_APP_PASSWORD=your_16_char_app_password
     ```
   - In development mode, if credentials are missing or email fails, the application returns a local `devBypassOtp` automatically so you can test all auth and digest flows smoothly.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 App Router
- **Email Service**: Nodemailer (Free Gmail SMTP)
- **Validation**: Zod
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: Zustand (persistent local store)
- **Charts**: Recharts
- **Image & PDF Export**: `html-to-image` & `@media print`
- **Date Engine**: `date-fns`
- **Animations & Delight**: `canvas-confetti` & `framer-motion`

---

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev:clean
   ```
   Or standard:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
| :--- | :--- |
| <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> | Open Linear Command Palette |
| <kbd>A</kbd> | Open "Can I Afford It?" Purchase Simulator |
| <kbd>W</kbd> | Open Month-End Editorial Story (Monthly Wrapped) |
| <kbd>N</kbd> | Open Quick Add Expense Modal |
| <kbd>&larr;</kbd> / <kbd>&rarr;</kbd> | Navigate slides inside the Editorial Story |
| <kbd>Esc</kbd> | Close any open modal or command palette |

---

## 🔒 Privacy

Mint Month does not transmit your personal financial records to third-party ad networks or tracking servers. All records live locally in your browser storage until you choose to export or sync.
