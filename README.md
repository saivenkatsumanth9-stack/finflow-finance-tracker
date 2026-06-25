# FinFlow — Personal Finance Tracker

"Your money, finally understood."

FinFlow is a premium, dark-first, client-side personal finance web application built for young professionals and students to track budgets, expenses, and savings goals.

## ✨ Core Features
* **Occupational Customization:** Tailored onboarding preset structures for **Students** (Allowance & Canteen spends) and **Employees** (Salaries & Zerodha SIPs).
* **Cost Customization for Debits:** Set a custom "Monthly Spend Limit (Debited Cap)" and partition *that* cap using 50/30/20 presets among categories, rather than splitting your entire net income.
* **Dynamic Ledger Labels:** Shows **"Credited To"** / **"Debited From"** depending on transaction directions (Banking terminology support).
* **Local Heuristic AI Assistant:** FLO Assistant runs simulated offline analyses of your transactions.
* **Offline First:** All data is saved safely in client-side `localStorage`.

## 🛠️ Tech Stack
* **Frontend:** React + Tailwind CSS v4 + Framer Motion
* **Charts:** Recharts
* **OCR Scanner:** Tesseract.js (Extract text directly from receipt photos offline)

## 🚀 Setup & Launch
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
