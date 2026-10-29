# Mint Month 🌿

> **A minimal, privacy-first expense tracker for every month.**
> Linear + Apple Wallet inspired aesthetic, organized strictly by month.

---

## ✨ Features

- **Organized Strictly by Month**: Jump between months seamlessly (`<` and `>` or drop-down month selector). All metrics, charts, and transactions belong strictly to the selected month.
- **Ultra-Fast Quick Add (`⌘K` or `N`)**:
  - One-click quick amounts (`+100`, `+500`, `+1000`, etc.)
  - Large currency amount display with live formatted currency
  - Category picker with colored icon tags
  - Payment method selector (`UPI`, `Card`, `Cash`, `Bank`)
  - Micro-confetti celebrations upon logging expenses
- **Smart Monthly Budget Management**:
  - Set total monthly budget caps
  - Set category-specific spending limits
  - Live color-coded progress bars:
    - 🟢 Green: `< 75%` (Safe)
    - 🟡 Yellow: `75% - 90%` (Warning)
    - 🔴 Red: `> 90%` (Critical / Over-budget alert banner)
- **Recurring Expenses**:
  - Flag any expense as **Monthly Recurring** (e.g. Rent, WiFi, Netflix, Gym)
  - Automatically projects into future months on the identical calendar day
- **Interactive Visual Charts**:
  - **Category Breakdown Donut Chart**: Hover to view category percentage, amount, and transaction counts with dynamic central indicator.
  - **Daily Spending Flow Bar Chart**: Highlights peak expenditure days and daily average reference lines.
- **Month Comparison & Trends**:
  - Side-by-side head-to-head comparison of Selected Month vs Previous Month.
  - Category delta shifts (increases and decreases).
  - 6-month historical trend line chart showing spending trajectories against budgets.
- **Full Transaction Management**:
  - Filter by category, payment method, recurring status, and date scope (selected month vs all-time).
  - Real-time search across notes, categories, and amounts.
  - Sort by date or amount.
- **Settings & Privacy-First Architecture**:
  - Currency switcher (default **INR ₹**, USD $, EUR €, GBP £, JPY ¥, CAD, AUD).
  - Category manager: create and customize custom categories with 25+ Lucide icons and 15 curated colors.
  - Full CSV export (Excel/Sheets compatible).
  - Full JSON backup & restore.
  - Reset to initial 3-month sample data.
- **Apple Wallet + Linear Aesthetic**:
  - Deep obsidian dark mode & crisp paper light mode (`next-themes`).
  - Smooth fluid micro-interactions powered by `framer-motion`.
  - Rounded corners (`rounded-2xl`, `rounded-3xl`), soft ambient shadows, and glassmorphism.
  - Mobile-first responsive with frosted-glass bottom navigation bar.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: Zustand (persistent local store)
- **Charts**: Recharts
- **Date Utilities**: `date-fns`
- **Animations**: `framer-motion` & `canvas-confetti`
- **Storage**: Offline-First LocalStorage adapter with Supabase-ready schema

---

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄 Data Model & Supabase Readiness

The storage adapter (`src/lib/storage.ts`) implements a clean interface ready for Supabase or any REST/GraphQL backend:

```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT false
);

CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  amount NUMERIC NOT NULL,
  category_id TEXT REFERENCES categories(id),
  note TEXT,
  date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE budgets (
  id TEXT PRIMARY KEY,
  month TEXT NOT NULL UNIQUE, -- 'YYYY-MM'
  total NUMERIC NOT NULL,
  categories JSONB DEFAULT '{}'::jsonb
);
```

---

## 🔒 Privacy

Mint Month does not transmit your personal financial records to third-party ad networks or tracking servers. All records live locally in your browser storage until you choose to export or sync.

