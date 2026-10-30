export type PaymentMethod = "Card" | "Bank" | "Cash" | "EFT" | "Instant EFT";

export interface Category {
  id: string;
  name: string;
  color: string; // Hex color or tailwind color
  icon: string;  // Lucide icon name
  isCustom?: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  note: string;
  date: string; // ISO date string YYYY-MM-DD
  paymentMethod: PaymentMethod;
  isRecurring?: boolean;
  createdAt?: string;
}

export interface Budget {
  month: string; // 'YYYY-MM' format
  total: number;
  categories: Record<string, number>; // categoryId -> amount
  sortedCategories?: string[]; // category IDs that have a tick (marked sorted)
  isTotalSorted?: boolean;     // whether total budget is marked sorted
  recurringCategories?: string[]; // category IDs configured to appear in every month's budget
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export interface MonthSummary {
  month: string; // 'YYYY-MM'
  totalSpent: number;
  totalBudget: number;
  remaining: number;
  dailyAverage: number;
  daysPassed: number;
  daysInMonth: number;
  percentageUsed: number;
  sortedCount: number;
  totalCategoriesWithBudget: number;
  recurringCount: number;
}

export interface RecurringTimelineItem {
  id: string;
  expenseId: string;
  note: string;
  amount: number;
  categoryId: string;
  category: Category;
  paymentMethod: PaymentMethod;
  date: string;         // 'YYYY-MM-DD'
  day: number;          // 1 - 31
  isCleared: boolean;   // Whether this debit order/bill has cleared
  status: "cleared" | "today" | "upcoming";
  daysUntil: number;    // negative if passed, 0 if today, positive if upcoming
}

export interface RecurringTimelineSummary {
  totalCommitted: number;
  clearedAmount: number;
  pendingAmount: number;
  totalCount: number;
  clearedCount: number;
  pendingCount: number;
  percentageCleared: number;
}

export interface DebtInstalment {
  id: string;
  name: string; // e.g. "PayJustNow", "Phone Contract", "Laptop Contract", "TFG Account"
  totalInstalments: number; // e.g. 3, 24, 6
  paidInstalments: number; // e.g. 2, 14, 4
  monthlyAmount: number; // e.g. 550, 899, 1199, 650
  totalAmount?: number; // total contract value
  startDate?: string; // 'YYYY-MM'
  targetPayoffDate?: string; // e.g. 'Nov 2026'
  categoryId?: string; // 'cat-debt' or 'cat-clothing'
  notes?: string;
  isPaidOff?: boolean;
}

export interface DebtSummary {
  totalMonthly: number;
  totalRemaining: number;
  totalPaid: number;
  totalContractValue: number;
  overallProgress: number;
  activeCount: number;
  paidOffCount: number;
  nextPayoffName?: string;
  nextPayoffMonths?: number;
}

export interface SafeToSpendSummary {
  month: string;
  monthlyIncome: number;
  fixedCommitments: number; // recurring bills, debit orders, contracts (locked)
  pendingCommitments: number; // not yet cleared this month
  clearedCommitments: number; // already deducted
  budgetedLiving: number; // living category limits
  nonRecurringSpent: number; // variable expenses spent so far
  totalSpent: number;
  safeToSpendPool: number; // income - fixedCommitments
  safeToSpendRemaining: number; // safeToSpendPool - nonRecurringSpent
  dailyAllowance: number; // safeToSpendRemaining / daysRemaining
  daysRemaining: number;
  daysPassed: number;
  daysInMonth: number;
  paydayDay: number;
  daysUntilPayday: number;
  status: "comfortable" | "balanced" | "tight" | "overspent";
  fixedCommitmentsCount: number;
}

export interface PaydaySettings {
  defaultIncome: number;
  paydayDay: number; // 1-31, default 25
  incomesByMonth?: Record<string, number>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  avatarColor?: string;
  monthlySalary?: number;
  paydayDay?: number;
  createdAt: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  monthlySalary?: number;
}

export interface LoginInput {
  email: string;
  password: string;
}
