# Mint Month 🌿

> **A minimal, privacy-first expense tracker for every month.**
> Editorial Vela-inspired aesthetic, organized strictly by month.

---

## 📧 Email Setup - Free Gmail

Mint Month uses Nodemailer with free personal Gmail SMTP (no domain verification or paid tier required):

1. **Enable 2-Step Verification**:
   - Go to your [Google Account Security](https://myaccount.google.com/security).
   - Under "How you sign in to Google", ensure **2-Step Verification** is enabled.

2. **Generate an App Password**:
   - Search for **App passwords** in the search bar at the top of your Google Account (or visit [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
   - Name your app (e.g. `Mint Month`) and click **Create**.
   - Copy the generated 16-character password (e.g. `abcd efgh ijkl mnop`).

3. **Configure Environment Variables**:
   - Create `.env.local` (or configure your Vercel Project Environment Variables):
     ```env
     GMAIL_USER=your_email@gmail.com
     GMAIL_APP_PASSWORD=your_16_char_app_password
     ```
   - In development mode, if email credentials are not yet configured or fail, the application provides a local `devBypassOtp` automatically so you can test all verification flows without disruption.

---

## ✨ Features

- **Organized Strictly by Month**: Jump between months seamlessly (`<` and `>` or drop-down month selector). All metrics, charts, and transactions belong strictly to the selected month.
- **Ultra-Fast Quick Add (`⌘K` or `N`)**:
  - One-click quick amounts (`+100`, `+500`, `+1000`, etc.)
  - Large currency amount display with live formatted currency
  - Category picker with colored icon tags
  - Payment method selector (`Card`, `Cash`, `EFT`, `Other`)
  - Micro-confetti celebrations upon logging expenses
- **Smart Monthly Budget Management**:
  - Set total monthly budget caps
  - Set category-specific spending limits
  - Live color-coded progress bars
- **Recurring Expenses & Debit Orders**:
  - Flag any expense as **Monthly Recurring** (e.g. Rent, WiFi, Netflix, Gym)
  - Automatically projects into future months on the identical calendar day
  - Mark debit orders as cleared with instant visual feedback
- **Payday Planner & Safe-to-Spend**:
  - Quarantines fixed bills and commitments before payday
  - Calculates exact guilt-free daily allowance
  - Send financial digests directly to your email
- **Editorial Vela Aesthetic**:
  - Cream background `#FBF6EF` with `#FFFDFA` cards
  - SVG fractal noise grain overlay
  - Clean Inter Tight typography with tight tracking for figures
- **Full Transaction Management**:
  - Filter by category, payment method, recurring status, and date scope
  - Real-time search across notes, categories, and amounts
- **Settings & Privacy-First Architecture**:
  - Currency switcher (ZAR R, USD $, EUR €, GBP £, INR ₹, etc.)
  - Category manager: create and customize custom categories
  - Full CSV export and JSON backup & restore

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 App Router
- **Email Service**: Nodemailer (Free Gmail SMTP transport)
- **Validation**: Zod
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: Zustand (persistent local store)
- **Charts**: Recharts
- **Date Utilities**: `date-fns`
- **Animations**: `framer-motion` & `canvas-confetti`

---

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Clean port & start development server**:
   ```bash
   npm run dev:clean
   ```
   Or standard:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Privacy

Mint Month does not transmit your personal financial records to third-party ad networks or tracking servers. All records live locally in your browser storage until you choose to export or sync.
