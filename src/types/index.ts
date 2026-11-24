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
  isPlanned?: boolean; // Planned future purchase for Cash Flow Calendar
  createdAt?: string;
}

export interface Budget {
  month: string; // 'YYYY-MM' format
  total: number;
  categories: Record<string, number>; // categoryId -> amount
  sortedCategories?: string[]; // category IDs that have a tick (marked sorted)
  sortedTransactions?: string[]; // transaction IDs marked sorted for this month
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
  totalTransactions: number;
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
  previousAmount?: number;
  priceHikeAmount?: number;
  priceHikePercent?: number;
}

export interface RecurringTimelineSummary {
  totalCommitted: number;
  clearedAmount: number;
  pendingAmount: number;
  totalCount: number;
  clearedCount: number;
  pendingCount: number;
  percentageCleared: number;
  priceHikeCount?: number;
  totalPriceHikeImpact?: number;
}

export type SavingsVaultType = "emergency" | "stokvel" | "sinking" | "holiday";

export interface SavingsGoal {
  id: string;
  name: string;
  vaultType: SavingsVaultType;
  targetAmount: number;
  savedAmount: number;
  monthlyContribution: number;
  dueDay?: number;
  ringFenceInSafeToSpend: boolean;
  notes?: string;
  isCompleted?: boolean;
  createdAt?: string;
}

export interface SavingsSummary {
  totalMonthlyRingFenced: number;
  totalSaved: number;
  totalTarget: number;
  overallProgress: number;
  activeCount: number;
  completedCount: number;
}

export type SubscriptionCategory =
  | "Streaming & TV"
  | "Music & Audio"
  | "Fitness & Health"
  | "Connectivity & WiFi"
  | "Software & AI"
  | "Insurance & Finance"
  | "Gaming & Cloud"
  | "Other";

export interface Subscription {
  id: string;
  name: string; // e.g. "Netflix Standard", "Showmax", "Virgin Active", "Spotify"
  monthlyAmount: number; // monthly cost in ZAR
  category: SubscriptionCategory;
  billingDay: number; // 1 - 31
  previousAmount?: number; // for price-hike detection
  isForgotten?: boolean; // Flagged as forgotten / rarely used / candidate for cancellation
  cancellationUrl?: string; // direct cancellation link, e.g. "https://www.netflix.com/youraccount"
  cancellationNotes?: string; // cancellation instructions or notice period
  notes?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface SubscriptionSummary {
  totalMonthly: number;
  totalAnnual: number;
  activeCount: number;
  forgottenCount: number;
  forgottenAnnualSavings: number;
  priceHikedCount: number;
  totalPriceHikeAnnualImpact: number;
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
  dueDay?: number; // 1 - 31, monthly payment due day
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
  ringFencedSavings?: number;
}

export interface PaydaySettings {
  defaultIncome: number;
  paydayDay: number; // 1-31, default 25
  incomesByMonth?: Record<string, number>;
}

export type UserRole = "superuser" | "standard";

export const SUPER_USER_EMAIL = "proit45ma@gmail.com";

export function isSuperUser(user?: { email?: string; role?: UserRole } | null): boolean {
  if (!user) return false;
  if (user.role === "superuser") return true;
  return (user.email || "").trim().toLowerCase() === SUPER_USER_EMAIL;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
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

export type CashFlowEventType =
  | "salary"
  | "debit_order"
  | "subscription"
  | "debt"
  | "savings"
  | "planned_purchase"
  | "expense";

export interface CashFlowEvent {
  id: string;
  type: CashFlowEventType;
  title: string;
  amount: number;
  isIncome: boolean;
  category?: string;
  isCleared?: boolean;
}

export interface CashFlowDay {
  dayNumber: number;
  dateStr: string; // 'YYYY-MM-DD'
  dayOfWeek: string; // 'Mon', 'Tue', etc.
  isCurrentDay: boolean;
  isPast: boolean;
  isPayday: boolean;
  events: CashFlowEvent[];
  inflowTotal: number;
  outflowTotal: number;
  netChange: number;
  projectedClosingBalance: number;
  isTight: boolean;
  tightReason?: string;
}

export interface CashFlowCalendarSummary {
  month: string;
  startingBalance: number;
  projectedEndingBalance: number;
  totalInflows: number;
  totalOutflows: number;
  lowestBalance: number;
  lowestBalanceDate: string;
  lowestBalanceDay: number;
  tightDaysCount: number;
  heavyOutflowDaysCount: number;
  days: CashFlowDay[];
}

// -------------------------------------------------------------
// Financial Health Score & Assessment Types
// -------------------------------------------------------------
export type FinancialHealthGrade = "Excellent" | "Resilient" | "Moderate" | "Vulnerable";

export type HealthPillarId =
  | "savings_rate"
  | "debt_to_income"
  | "emergency_fund"
  | "budget_adherence"
  | "commitments"
  | "income_stability";

export interface HealthPillarAssessment {
  id: HealthPillarId;
  title: string;
  score: number;
  maxScore: number;
  percentage: number;
  metricValue: string;
  statusLabel: string;
  statusTier: "healthy" | "warning" | "critical";
  prescription: string;
  potentialPointsGain: number;
}

export interface HealthScoreRecommendation {
  id: string;
  pillarId: HealthPillarId;
  title: string;
  actionText: string;
  pointsBoost: number;
  targetAnchor?: string;
}

export interface FinancialHealthScoreSummary {
  overallScore: number; // 0 - 100
  maxScore: number; // 100
  grade: FinancialHealthGrade;
  tierNumber: number; // 1, 2, 3, 4
  headline: string;
  summaryText: string;
  pillars: HealthPillarAssessment[];
  topRecommendations: HealthScoreRecommendation[];
  savingsRatePercent: number;
  debtToIncomePercent: number;
  emergencyFundMonths: number;
  budgetAdherencePercent: number;
  commitmentsRatioPercent: number;
  isIncomeStable: boolean;
}

// -------------------------------------------------------------
// Major Life Goals & Roadmap Types
// -------------------------------------------------------------
export type LifeGoalCategory =
  | "car"
  | "apartment"
  | "house"
  | "emergency"
  | "travel"
  | "debt_free"
  | "custom";

export type GoalFeasibility = "realistic" | "moderate" | "stretch" | "unrealistic";

export interface LifeGoal {
  id: string;
  title: string;
  category: LifeGoalCategory;
  targetAmount: number;
  currentSaved: number;
  targetDate: string; // 'YYYY-MM'
  monthlyContribution?: number;
  notes?: string;
  isCompleted?: boolean;
  createdAt: string;
}

export interface LifeGoalCalculation {
  goal: LifeGoal;
  remainingAmount: number;
  progressPercent: number;
  monthsRemaining: number;
  requiredMonthlySavings: number;
  estimatedCompletionDate: string;
  feasibility: GoalFeasibility;
  feasibilityLabel: string;
  feasibilityColor: "healthy" | "warning" | "critical";
  feasibilityAdvice: string;
  impactOfExtraSavings: {
    extraAmount: number;
    monthsSaved: number;
    newCompletionDate: string;
  };
}

export interface LifeGoalRoadmapSummary {
  goals: LifeGoalCalculation[];
  totalTargetAmount: number;
  totalCurrentSaved: number;
  totalMonthlyRequired: number;
  overallProgressPercent: number;
  realisticCount: number;
  moderateCount: number;
  stretchCount: number;
  unrealisticCount: number;
  activeCount: number;
  completedCount: number;
  monthlySavingsCapacity: number; // monthly safe to spend pool
  capacityUtilizationPercent: number;
}


