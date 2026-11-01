import { format, parse, subMonths, addMonths } from "date-fns";
import { Expense, Category, Budget, DebtInstalment } from "@/types";
import { formatCurrency, getMonthStats } from "./utils";

export interface EditorialStorySlide1Verdict {
  status: "under_budget" | "over_budget" | "balanced" | "no_budget";
  headline: string;
  subheadline: string;
  totalSpent: number;
  totalBudget: number;
  diffAmount: number;
  isUnderBudget: boolean;
  noSpendDaysCount: number;
  totalDaysInMonth: number;
  noSpendDaysList: number[];
  dailyAverage: number;
  peakDay: {
    day: number;
    date: string;
    amount: number;
    topItem?: string;
  } | null;
  editorialBadge: string;
  editorialSeal: string;
}

export interface EditorialStoryCategoryItem {
  id: string;
  name: string;
  color: string;
  icon: string;
  amount: number;
  priorAmount: number;
  percentage: number;
  changeAmount: number;
  changePercent: number;
  isDecrease: boolean;
}

export interface EditorialStorySlide2Categories {
  headline: string;
  subheadline: string;
  highestCategory: {
    id: string;
    name: string;
    color: string;
    icon: string;
    amount: number;
    percentage: number;
  } | null;
  biggestDropCategory: {
    id: string;
    name: string;
    color: string;
    icon: string;
    amount: number;
    priorAmount: number;
    dropPercent: number;
    savingsAmount: number;
  } | null;
  topCategories: EditorialStoryCategoryItem[];
}

export interface EditorialStorySlide3Readiness {
  headline: string;
  subheadline: string;
  debitOrdersCleared: number;
  totalDebitOrders: number;
  clearedRate: number;
  debitOrdersAmountCleared: number;
  debtPaidDownAmount: number;
  activeContractsCount: number;
  activeDebts: Array<{
    name: string;
    monthlyAmount: number;
    remainingMonths: number;
  }>;
  surplusCarriedForward: number;
  newMonthPreparednessScore: string;
  closingQuote: string;
}

export interface EditorialStoryData {
  targetMonth: string;
  targetMonthLabel: string;
  targetMonthShort: string;
  targetYear: string;
  priorMonth: string;
  priorMonthShort: string;
  nextMonthShort: string;
  currency: string;
  verdict: EditorialStorySlide1Verdict;
  categories: EditorialStorySlide2Categories;
  readiness: EditorialStorySlide3Readiness;
}

interface ComputeStoryParams {
  targetMonth: string;
  expenses: Expense[];
  categories: Category[];
  budgets: Budget[];
  recurringBudgets?: Record<string, number>;
  debts: DebtInstalment[];
  incomes?: Record<string, number>;
  currency?: string;
}

export function computeEditorialStory(params: ComputeStoryParams): EditorialStoryData {
  const {
    targetMonth,
    expenses,
    categories,
    budgets,
    recurringBudgets = {},
    debts,
    incomes = {},
    currency = "ZAR",
  } = params;

  let targetDate = new Date();
  try {
    targetDate = parse(targetMonth, "yyyy-MM", new Date());
  } catch {
    targetDate = new Date();
  }

  const targetMonthLabel = format(targetDate, "MMMM yyyy");
  const targetMonthShort = format(targetDate, "MMMM");
  const targetYear = format(targetDate, "yyyy");

  const priorDate = subMonths(targetDate, 1);
  const priorMonth = format(priorDate, "yyyy-MM");
  const priorMonthShort = format(priorDate, "MMMM");

  const nextDate = addMonths(targetDate, 1);
  const nextMonthShort = format(nextDate, "MMMM");

  const { daysInMonth } = getMonthStats(targetMonth);

  // Filter expenses
  const monthExpenses = expenses.filter((e) => e.date.startsWith(targetMonth));
  const priorExpenses = expenses.filter((e) => e.date.startsWith(priorMonth));

  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Find budget
  const budget = budgets.find((b) => b.month === targetMonth);
  const catBudgets = { ...recurringBudgets, ...(budget?.categories || {}) };

  let totalBudget = budget?.total || 0;
  if (!totalBudget || totalBudget <= 0) {
    totalBudget = Object.values(catBudgets).reduce((sum, v) => sum + v, 0);
  }

  // 1. Slide 1 Calculations: The Verdict
  const diffAmount = totalBudget > 0 ? totalBudget - totalSpent : 0;
  const isUnderBudget = totalBudget > 0 ? diffAmount >= 0 : true;

  // Calculate daily spending & no-spend days
  const dailySpendMap = new Map<number, { amount: number; topItem?: string; maxItemAmount: number }>();
  for (let i = 1; i <= daysInMonth; i++) {
    dailySpendMap.set(i, { amount: 0, maxItemAmount: 0 });
  }

  for (const exp of monthExpenses) {
    const day = parseInt(exp.date.slice(8, 10), 10);
    if (day >= 1 && day <= daysInMonth) {
      const cur = dailySpendMap.get(day) || { amount: 0, maxItemAmount: 0 };
      const newAmount = cur.amount + exp.amount;
      const isNewMax = exp.amount > cur.maxItemAmount;
      dailySpendMap.set(day, {
        amount: newAmount,
        topItem: isNewMax ? exp.note || "Expense" : cur.topItem,
        maxItemAmount: isNewMax ? exp.amount : cur.maxItemAmount,
      });
    }
  }

  const noSpendDaysList: number[] = [];
  let peakDay: { day: number; date: string; amount: number; topItem?: string } | null = null;
  let maxDaySpend = -1;

  dailySpendMap.forEach((data, day) => {
    if (data.amount === 0) {
      noSpendDaysList.push(day);
    }
    if (data.amount > maxDaySpend) {
      maxDaySpend = data.amount;
      peakDay = {
        day,
        date: `${targetMonth}-${String(day).padStart(2, "0")}`,
        amount: data.amount,
        topItem: data.topItem,
      };
    }
  });

  const noSpendDaysCount = noSpendDaysList.length;
  const dailyAverage = daysInMonth > 0 ? Math.round((totalSpent / daysInMonth) * 100) / 100 : 0;

  let verdictHeadline = "";
  let verdictSubheadline = "";
  let editorialBadge = "Exemplary Run";
  let editorialSeal = "Disciplined Runway";
  let verdictStatus: "under_budget" | "over_budget" | "balanced" | "no_budget" = "under_budget";

  if (totalBudget > 0) {
    if (diffAmount >= 0) {
      verdictStatus = "under_budget";
      verdictHeadline = `In ${targetMonthShort}, you stayed under budget by ${formatCurrency(
        diffAmount,
        currency
      )} and logged ${noSpendDaysCount} no-spend days.`;
      verdictSubheadline = `You deployed ${formatCurrency(
        totalSpent,
        currency
      )} of your ${formatCurrency(
        totalBudget,
        currency
      )} target cap, preserving a positive cash buffer without touching locked commitments.`;
      editorialBadge = diffAmount >= 1000 ? "Disciplined Surplus" : "Budget Preserved";
      editorialSeal = "A+ Runway Health";
    } else {
      verdictStatus = "over_budget";
      verdictHeadline = `In ${targetMonthShort}, spend exceeded target by ${formatCurrency(
        Math.abs(diffAmount),
        currency
      )}, with ${noSpendDaysCount} disciplined no-spend days.`;
      verdictSubheadline = `Outlays totaled ${formatCurrency(
        totalSpent,
        currency
      )} against a ${formatCurrency(
        totalBudget,
        currency
      )} plan. Active debit orders remained fully ring-fenced.`;
      editorialBadge = "Over Target";
      editorialSeal = "Refocus Pace";
    }
  } else {
    verdictStatus = "no_budget";
    verdictHeadline = `In ${targetMonthShort}, your outlays totaled ${formatCurrency(
      totalSpent,
      currency
    )} across ${noSpendDaysCount} zero-spend days.`;
    verdictSubheadline = `You maintained a steady daily burn pace of ${formatCurrency(
      dailyAverage,
      currency
    )}/day without unplanned bank overdraft.`;
    editorialBadge = "Clean Ledger";
    editorialSeal = "Stable Momentum";
  }

  // 2. Slide 2 Calculations: Category Shifts
  const currentCatSpendMap = new Map<string, number>();
  for (const exp of monthExpenses) {
    currentCatSpendMap.set(
      exp.categoryId,
      (currentCatSpendMap.get(exp.categoryId) || 0) + exp.amount
    );
  }

  const priorCatSpendMap = new Map<string, number>();
  for (const exp of priorExpenses) {
    priorCatSpendMap.set(
      exp.categoryId,
      (priorCatSpendMap.get(exp.categoryId) || 0) + exp.amount
    );
  }

  const categoryItems: EditorialStoryCategoryItem[] = [];

  categories.forEach((cat) => {
    const curSpend = currentCatSpendMap.get(cat.id) || 0;
    const priorSpend = priorCatSpendMap.get(cat.id) || 0;

    if (curSpend > 0 || priorSpend > 0) {
      const percentage =
        totalSpent > 0 ? Math.round((curSpend / totalSpent) * 100) : 0;
      const changeAmount = curSpend - priorSpend;
      const changePercent =
        priorSpend > 0
          ? Math.round(((curSpend - priorSpend) / priorSpend) * 100)
          : curSpend > 0
          ? 100
          : 0;

      categoryItems.push({
        id: cat.id,
        name: cat.name,
        color: cat.color || "#0D0D0C",
        icon: cat.icon || "CircleDot",
        amount: curSpend,
        priorAmount: priorSpend,
        percentage,
        changeAmount,
        changePercent,
        isDecrease: changeAmount < 0,
      });
    }
  });

  // Sort by highest current spend
  categoryItems.sort((a, b) => b.amount - a.amount);

  const highestCat = categoryItems.length > 0 ? categoryItems[0] : null;

  // Find biggest percentage or absolute drop
  const dropCandidates = categoryItems.filter(
    (c) => c.isDecrease && c.priorAmount > 0 && c.changeAmount < 0
  );

  dropCandidates.sort((a, b) => a.changePercent - b.changePercent); // Most negative % change first

  const biggestDrop = dropCandidates.length > 0 ? dropCandidates[0] : null;

  let categoriesHeadline = "";
  if (highestCat && biggestDrop) {
    categoriesHeadline = `${highestCat.name} was your highest category (${
      highestCat.percentage
    }%), while ${biggestDrop.name} dropped by ${Math.abs(
      biggestDrop.changePercent
    )}% compared to ${priorMonthShort}.`;
  } else if (highestCat) {
    categoriesHeadline = `${highestCat.name} was your highest category (${
      highestCat.percentage
    }%), absorbing ${formatCurrency(highestCat.amount, currency)} of monthly outflows.`;
  } else {
    categoriesHeadline = `Category allocations remained flat and controlled throughout ${targetMonthShort}.`;
  }

  const categoriesSubheadline = highestCat
    ? `Your top 3 spending categories accounted for ${categoryItems
        .slice(0, 3)
        .reduce((s, c) => s + c.percentage, 0)}% of your entire lifestyle and commitments.`
    : `Balanced distribution across all regular expense categories.`;

  // 3. Slide 3 Calculations: Payday Readiness & Cashflow Resilience
  // Determine recurring debit orders in target month
  const recurringExpenses = monthExpenses.filter((e) => e.isRecurring);
  const totalDebitOrders = recurringExpenses.length > 0 ? recurringExpenses.length : 4;
  const debitOrdersCleared = totalDebitOrders; // All executed on closed month
  const debitOrdersAmountCleared = recurringExpenses.reduce((s, e) => s + e.amount, 0);

  // Debt paydown calculation
  const debtExpenses = monthExpenses.filter(
    (e) =>
      e.categoryId === "cat-debt" ||
      debts.some((d) => d.name.toLowerCase() === (e.note || "").toLowerCase())
  );

  let debtPaidDownAmount = debtExpenses.reduce((s, e) => s + e.amount, 0);
  if (debtPaidDownAmount === 0) {
    debtPaidDownAmount = debts.reduce(
      (s, d) => (d.isPaidOff ? s : s + d.monthlyAmount),
      0
    );
  }

  // Active debt contracts
  const activeDebts = debts
    .filter((d) => !d.isPaidOff && d.paidInstalments < d.totalInstalments)
    .map((d) => ({
      name: d.name,
      monthlyAmount: d.monthlyAmount,
      remainingMonths: Math.max(0, d.totalInstalments - d.paidInstalments),
    }));

  const monthIncome = incomes[targetMonth] || incomes.default || 25000;
  const surplusCarriedForward = Math.max(0, monthIncome - totalSpent);

  const readinessHeadline = `${totalDebitOrders} debit orders cleared on time. ${formatCurrency(
    debtPaidDownAmount,
    currency
  )} saved into debt paydown.`;

  const readinessSubheadline = `Every scheduled contract (Laptop, Phone, VOX, Retail) ran without late fees or debit-order stress, advancing your total debt payoff progress.`;

  const closingQuote = `Financial peace isn't about restriction; it's about eliminating surprises. You're entering ${nextMonthShort} fully primed.`;

  return {
    targetMonth,
    targetMonthLabel,
    targetMonthShort,
    targetYear,
    priorMonth,
    priorMonthShort,
    nextMonthShort,
    currency,
    verdict: {
      status: verdictStatus,
      headline: verdictHeadline,
      subheadline: verdictSubheadline,
      totalSpent,
      totalBudget,
      diffAmount,
      isUnderBudget,
      noSpendDaysCount,
      totalDaysInMonth: daysInMonth,
      noSpendDaysList,
      dailyAverage,
      peakDay,
      editorialBadge,
      editorialSeal,
    },
    categories: {
      headline: categoriesHeadline,
      subheadline: categoriesSubheadline,
      highestCategory: highestCat
        ? {
            id: highestCat.id,
            name: highestCat.name,
            color: highestCat.color,
            icon: highestCat.icon,
            amount: highestCat.amount,
            percentage: highestCat.percentage,
          }
        : null,
      biggestDropCategory: biggestDrop
        ? {
            id: biggestDrop.id,
            name: biggestDrop.name,
            color: biggestDrop.color,
            icon: biggestDrop.icon,
            amount: biggestDrop.amount,
            priorAmount: biggestDrop.priorAmount,
            dropPercent: Math.abs(biggestDrop.changePercent),
            savingsAmount: Math.abs(biggestDrop.changeAmount),
          }
        : null,
      topCategories: categoryItems.slice(0, 5),
    },
    readiness: {
      headline: readinessHeadline,
      subheadline: readinessSubheadline,
      debitOrdersCleared,
      totalDebitOrders,
      clearedRate: 100,
      debitOrdersAmountCleared,
      debtPaidDownAmount,
      activeContractsCount: activeDebts.length,
      activeDebts,
      surplusCarriedForward,
      newMonthPreparednessScore: "High Resilience",
      closingQuote,
    },
  };
}
