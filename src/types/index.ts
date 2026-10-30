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
