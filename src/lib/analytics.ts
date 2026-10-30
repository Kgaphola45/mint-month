import { Expense, Category, PaymentMethod } from "@/types";
import { getMonthStats } from "./utils";
import { parse, getDay } from "date-fns";

export interface CumulativePacePoint {
  day: number;
  label: string;
  currentSpent: number | null;
  prevSpent: number;
  budgetPace: number;
}

export interface DayOfWeekData {
  dayIndex: number;
  dayName: string;
  shortName: string;
  spent: number;
  count: number;
  percentage: number;
}

export interface DayOfWeekSummary {
  days: DayOfWeekData[];
  peakDay: string;
  peakAmount: number;
  weekdayTotal: number;
  weekendTotal: number;
  weekdayDailyAvg: number;
  weekendDailyAvg: number;
}

export interface CashflowArchitecture {
  fixedAmount: number;
  fixedPercent: number;
  variableAmount: number;
  variablePercent: number;
  surplusAmount: number;
  surplusPercent: number;
  totalSpent: number;
  monthlyIncome: number;
  healthLabel: string;
  healthColor: string;
}

export interface TopOutflowItem {
  id: string;
  note: string;
  amount: number;
  date: string;
  categoryId: string;
  paymentMethod: PaymentMethod;
  isRecurring: boolean;
  percentageOfTotal: number;
}

export interface PaymentBreakdownItem {
  method: PaymentMethod;
  amount: number;
  count: number;
  percentage: number;
}

/**
 * Computes day-by-day cumulative spending pace (Day 1 to 31)
 * comparing the selected month, previous month, and linear budget pace.
 */
export function computeCumulativePace(
  currentExpenses: Expense[],
  prevExpenses: Expense[],
  currentMonthStr: string,
  prevMonthStr: string,
  totalBudget: number,
  todayStr: string
): CumulativePacePoint[] {
  const { daysInMonth: currentDaysInMonth } = getMonthStats(currentMonthStr);
  const { daysInMonth: prevDaysInMonth } = getMonthStats(prevMonthStr);
  const maxDays = Math.max(currentDaysInMonth, prevDaysInMonth, 28);

  const isCurrentActiveMonth = todayStr.startsWith(currentMonthStr);
  const currentDayNum = isCurrentActiveMonth
    ? parseInt(todayStr.slice(8, 10), 10)
    : currentDaysInMonth;

  // Aggregate daily expenses
  const currentDailyMap = new Map<number, number>();
  const prevDailyMap = new Map<number, number>();

  for (const exp of currentExpenses) {
    const day = parseInt(exp.date.slice(8, 10), 10);
    if (!isNaN(day)) {
      currentDailyMap.set(day, (currentDailyMap.get(day) || 0) + exp.amount);
    }
  }

  for (const exp of prevExpenses) {
    const day = parseInt(exp.date.slice(8, 10), 10);
    if (!isNaN(day)) {
      prevDailyMap.set(day, (prevDailyMap.get(day) || 0) + exp.amount);
    }
  }

  let runningCurrent = 0;
  let runningPrev = 0;
  const points: CumulativePacePoint[] = [];

  for (let day = 1; day <= maxDays; day++) {
    runningPrev += prevDailyMap.get(day) || 0;

    let currentVal: number | null = null;
    if (day <= currentDayNum) {
      runningCurrent += currentDailyMap.get(day) || 0;
      currentVal = runningCurrent;
    }

    const budgetPace =
      totalBudget > 0
        ? Math.round((totalBudget / currentDaysInMonth) * day)
        : 0;

    points.push({
      day,
      label: `Day ${day}`,
      currentSpent: currentVal,
      prevSpent: runningPrev,
      budgetPace,
    });
  }

  return points;
}

/**
 * Computes Day-of-Week spending distribution (Mon - Sun).
 */
export function computeDayOfWeekDistribution(
  monthExpenses: Expense[]
): DayOfWeekSummary {
  // date-fns getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
  // We reorder to start with Monday: [1, 2, 3, 4, 5, 6, 0]
  const dayOrder = [
    { index: 1, dayName: "Monday", shortName: "Mon" },
    { index: 2, dayName: "Tuesday", shortName: "Tue" },
    { index: 3, dayName: "Wednesday", shortName: "Wed" },
    { index: 4, dayName: "Thursday", shortName: "Thu" },
    { index: 5, dayName: "Friday", shortName: "Fri" },
    { index: 6, dayName: "Saturday", shortName: "Sat" },
    { index: 0, dayName: "Sunday", shortName: "Sun" },
  ];

  const totalSpend = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const map = new Map<number, { spent: number; count: number }>();

  for (const exp of monthExpenses) {
    try {
      const d = parse(exp.date, "yyyy-MM-dd", new Date());
      const dayIdx = getDay(d);
      const curr = map.get(dayIdx) || { spent: 0, count: 0 };
      map.set(dayIdx, {
        spent: curr.spent + exp.amount,
        count: curr.count + 1,
      });
    } catch {
      // fallback
    }
  }

  let peakDay = "Friday";
  let peakAmount = 0;
  let weekdayTotal = 0;
  let weekendTotal = 0;

  const days: DayOfWeekData[] = dayOrder.map((item) => {
    const data = map.get(item.index) || { spent: 0, count: 0 };
    const pct = totalSpend > 0 ? Math.round((data.spent / totalSpend) * 100) : 0;

    if (data.spent > peakAmount) {
      peakAmount = data.spent;
      peakDay = item.dayName;
    }

    if (item.index === 0 || item.index === 6) {
      weekendTotal += data.spent;
    } else {
      weekdayTotal += data.spent;
    }

    return {
      dayIndex: item.index,
      dayName: item.dayName,
      shortName: item.shortName,
      spent: data.spent,
      count: data.count,
      percentage: pct,
    };
  });

  return {
    days,
    peakDay,
    peakAmount,
    weekdayTotal,
    weekendTotal,
    weekdayDailyAvg: Math.round(weekdayTotal / 5),
    weekendDailyAvg: Math.round(weekendTotal / 2),
  };
}

/**
 * Computes Cashflow Architecture: Fixed vs Variable (Discretionary) vs Surplus.
 */
export function computeCashflowArchitecture(
  monthExpenses: Expense[],
  fixedCommitmentsTotal: number,
  monthlyIncome: number
): CashflowArchitecture {
  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // If there are recurring expenses in the month, sum them; otherwise use fixed commitments
  const actualRecurringSpent = monthExpenses
    .filter((e) => e.isRecurring)
    .reduce((sum, e) => sum + e.amount, 0);

  const fixedAmount = Math.max(actualRecurringSpent, fixedCommitmentsTotal);
  const variableAmount = Math.max(0, totalSpent - actualRecurringSpent);

  const effectiveIncome = monthlyIncome > 0 ? monthlyIncome : totalSpent || 1;
  const surplusAmount = Math.max(0, effectiveIncome - totalSpent);

  const fixedPercent = Math.min(100, Math.round((fixedAmount / effectiveIncome) * 100));
  const variablePercent = Math.min(
    100 - fixedPercent,
    Math.round((variableAmount / effectiveIncome) * 100)
  );
  const surplusPercent = Math.max(0, 100 - fixedPercent - variablePercent);

  let healthLabel = "Balanced Cashflow";
  let healthColor = "#96CE96"; // Sage

  if (fixedPercent > 55) {
    healthLabel = "High Fixed Overhead (>50%)";
    healthColor = "#F99654"; // Peach warning
  } else if (surplusPercent >= 20) {
    healthLabel = "Excellent Savings Buffer (>20%)";
    healthColor = "#96CE96";
  } else if (surplusAmount <= 0) {
    healthLabel = "Zero Cushion Remaining";
    healthColor = "#0D0D0C";
  }

  return {
    fixedAmount,
    fixedPercent,
    variableAmount,
    variablePercent,
    surplusAmount,
    surplusPercent,
    totalSpent,
    monthlyIncome: effectiveIncome,
    healthLabel,
    healthColor,
  };
}

/**
 * Computes the top single outflow expenses for the month.
 */
export function computeTopOutflows(
  monthExpenses: Expense[],
  limit = 5
): TopOutflowItem[] {
  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  return [...monthExpenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
    .map((exp) => ({
      id: exp.id,
      note: exp.note || "Expense",
      amount: exp.amount,
      date: exp.date,
      categoryId: exp.categoryId,
      paymentMethod: exp.paymentMethod,
      isRecurring: Boolean(exp.isRecurring),
      percentageOfTotal:
        totalSpent > 0 ? Math.round((exp.amount / totalSpent) * 100) : 0,
    }));
}

/**
 * Computes breakdown by payment method (Card, Bank, Cash, Instant EFT, etc.).
 */
export function computePaymentMethodBreakdown(
  monthExpenses: Expense[]
): PaymentBreakdownItem[] {
  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const map = new Map<PaymentMethod, { amount: number; count: number }>();

  for (const exp of monthExpenses) {
    const method = exp.paymentMethod || "Card";
    const curr = map.get(method) || { amount: 0, count: 0 };
    map.set(method, {
      amount: curr.amount + exp.amount,
      count: curr.count + 1,
    });
  }

  const standardMethods: PaymentMethod[] = ["Card", "Bank", "Cash", "EFT", "Instant EFT"];
  const results: PaymentBreakdownItem[] = [];

  for (const method of standardMethods) {
    const data = map.get(method);
    if (data && data.amount > 0) {
      results.push({
        method,
        amount: data.amount,
        count: data.count,
        percentage: totalSpent > 0 ? Math.round((data.amount / totalSpent) * 100) : 0,
      });
    }
  }

  // Sort descending by amount
  return results.sort((a, b) => b.amount - a.amount);
}
