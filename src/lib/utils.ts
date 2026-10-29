import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, parse, getDaysInMonth, isThisMonth } from "date-fns";
import { CURRENCIES } from "./currencies";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currencyCode: string = "ZAR",
  compact: boolean = false
): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.ZAR || {
    code: "ZAR",
    symbol: "R",
    name: "South African Rand",
    locale: "en-ZA",
  };

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: compact || Number.isInteger(amount) ? 0 : 2,
      notation: compact ? "compact" : "standard",
    }).format(amount);
  } catch {
    return `${currency.symbol} ${amount.toLocaleString()}`;
  }
}

export function formatMonthYear(monthStr: string): string {
  // monthStr is 'YYYY-MM'
  try {
    const date = parse(monthStr, "yyyy-MM", new Date());
    return format(date, "MMMM yyyy");
  } catch {
    return monthStr;
  }
}

export function formatShortMonthYear(monthStr: string): string {
  try {
    const date = parse(monthStr, "yyyy-MM", new Date());
    return format(date, "MMM yyyy");
  } catch {
    return monthStr;
  }
}

export function formatDisplayDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export function formatDayAndWeekday(dateStr: string): { day: string; weekday: string } {
  try {
    const date = parseISO(dateStr);
    return {
      day: format(date, "d"),
      weekday: format(date, "EEE"),
    };
  } catch {
    return { day: "01", weekday: "Day" };
  }
}

export function getCurrentMonthStr(): string {
  return format(new Date(), "yyyy-MM");
}

export function getTodayDateStr(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function getMonthStats(monthStr: string) {
  try {
    const date = parse(monthStr, "yyyy-MM", new Date());
    const daysInMonth = getDaysInMonth(date);
    const today = new Date();
    const isCurrent = isThisMonth(date);
    const daysPassed = isCurrent ? Math.min(today.getDate(), daysInMonth) : daysInMonth;

    return {
      daysInMonth,
      daysPassed: Math.max(1, daysPassed),
      isCurrent,
    };
  } catch {
    return { daysInMonth: 30, daysPassed: 30, isCurrent: false };
  }
}

export function getBudgetStatus(spent: number, budget: number) {
  if (!budget || budget <= 0) {
    return {
      percentage: 0,
      color: "text-muted-foreground",
      progressColor: "bg-muted",
      status: "neutral" as const,
      isOver: false,
    };
  }

  const percentage = Math.round((spent / budget) * 100);

  if (percentage >= 100) {
    return {
      percentage,
      color: "text-rose-500 dark:text-rose-400",
      progressColor: "bg-rose-500",
      status: "danger" as const,
      isOver: true,
    };
  }

  if (percentage >= 90) {
    return {
      percentage,
      color: "text-rose-500 dark:text-rose-400",
      progressColor: "bg-rose-500",
      status: "danger" as const,
      isOver: false,
    };
  }

  if (percentage >= 75) {
    return {
      percentage,
      color: "text-amber-500 dark:text-amber-400",
      progressColor: "bg-amber-500",
      status: "warning" as const,
      isOver: false,
    };
  }

  return {
    percentage,
    color: "text-emerald-500 dark:text-emerald-400",
    progressColor: "bg-emerald-500",
    status: "good" as const,
    isOver: false,
  };
}

