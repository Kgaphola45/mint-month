# Mint Month 🌿

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)

> **A minimal, privacy-first personal cashflow planner with an editorial magazine aesthetic.**  
> Pre-purchase decision simulation, debit order ring-fencing, monthly wrapped stories, and a keyboard-first command workflow.

---

## 🎬 Showcase: ⌘K Command Palette & Purchase Simulator

| ⌘K Raycast / Linear Command Palette | "Can I Afford It?" Purchase Simulator |
| :---: | :---: |
| Type `Add R250 lunch`, switch months, export CSV | Translates impulse buys into daily living runway consequences |

<!-- Add your demo preview recording below: CleanShot / ScreenToGif / Loom GIF (recommended: 800x450) -->
```
   ┌────────────────────────────────────────────────────────────────────────┐
   │  ⌘K  > Add R250 lunch                                                  │
   │  Parsed: R250.00 • Category: Food & Dining • Date: Today               │
   │  --------------------------------------------------------------------  │
   │  🔮 "Buying this will reduce your guilt-free allowance from            │
   │      R280/day → R185/day for the remaining 14 days until payday."      │
   └────────────────────────────────────────────────────────────────────────┘
```
> 📹 *Place a demo GIF or screen recording at `docs/preview.gif` to display in your repository header.*

---

## ⚡ Key Highlights

- **⌘K Command Palette** — Press <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> to add expenses via natural language (`Add R250 lunch`), switch months (`Go to September`), or trigger CSV exports without touching your mouse.
- **"Can I Afford It?" Simulator** — Press <kbd>A</kbd> to test impulse purchases against your real daily runway before you swipe your card.
- **Month-End "Monthly Wrapped"** — Press <kbd>W</kbd> on the 1st of any month for a publication-grade 3-slide editorial magazine story with retina PNG and PDF export.
- **Guilt-Free Safe-to-Spend Meter** — Quarantines fixed debit orders and contracts upfront so you always know your exact daily discretionary cushion.
- **Payday & Debit Order Email Digest** — Receive your ring-fenced monthly briefing directly in your inbox via free Gmail SMTP.
- **100% Local-First & Private** — All financial records live in your browser's persistent storage. Zero bank logins required, zero tracking cookies.

📖 **[Read the complete 12-feature architectural deep dive in FEATURES.md →](FEATURES.md)**

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 App Router
- **Language & Types:** TypeScript 5
- **Styling:** Tailwind CSS with custom editorial grain paper system
- **State Store:** Zustand (persistent client-side storage)
- **Email Delivery:** Nodemailer (Personal Gmail SMTP / local dev bypass)
- **Charts & Export:** Recharts, `html-to-image`, `@media print`
- **Icons & Delight:** Lucide React, `canvas-confetti`, `framer-motion`

---

## 🚀 Quickstart

```bash
# 1. Clone the repository
git clone https://github.com/your-username/mint-month.git
cd mint-month

# 2. Install dependencies
npm install

# 3. Setup environment variables (optional for email digests)
cp .env.example .env.local

# 4. Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to start managing your cashflow.

---

## ⌨️ Essential Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> | Open Command Palette |
| <kbd>A</kbd> | Open "Can I Afford It?" Purchase Simulator |
| <kbd>W</kbd> | Open Monthly Wrapped Editorial Story |
| <kbd>N</kbd> | Quick Add Expense |
| <kbd>Esc</kbd> | Close any open modal |

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.
