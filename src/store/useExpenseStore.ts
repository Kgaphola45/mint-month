import { create } from "zustand";
import { format, subMonths, addMonths, parse } from "date-fns";
import { Expense, Category, Budget, MonthSummary } from "@/types";
import { storage } from "@/lib/storage";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { getCurrentMonthStr, getMonthStats } from "@/lib/utils";

interface ExpenseStore {
  selectedMonth: string; // 'YYYY-MM'
  currency: string;
  expenses: Expense[];
  categories: Category[];
  budgets: Budget[];
  recurringBudgets: Record<string, number>; // Category limits that automatically repeat every month
  isLoaded: boolean;

  // Modals & transient UI
  quickAddOpen: boolean;
  budgetModalOpen: boolean;
  editingExpense: Expense | null;

  // Actions
  initStore: () => void;
  setSelectedMonth: (month: string) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  setCurrency: (code: string) => void;
  setQuickAddOpen: (open: boolean) => void;
  setBudgetModalOpen: (open: boolean) => void;
  setEditingExpense: (expense: Expense | null) => void;

  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  setBudget: (budget: Budget) => void;
  updateTotalBudget: (month: string, total: number) => void;
  updateCategoryBudget: (month: string, categoryId: string, amount: number) => void;
  toggleCategorySorted: (month: string, categoryId: string) => void;
  toggleTotalSorted: (month: string) => void;
  isCategorySorted: (month: string, categoryId: string) => boolean;

  // Options to make budget items appear in every month's budget
  toggleCategoryRecurring: (month: string, categoryId: string, amount?: number) => void;
  applyCurrentMonthBudgetsToAllMonths: (sourceMonth: string) => void;
  isCategoryRecurring: (month: string, categoryId: string) => boolean;

  resetToDefaults: () => void;
  exportDataJSON: () => string;
  exportDataCSV: () => string;
  importDataJSON: (jsonStr: string) => boolean;

  // Computed helper selectors
  getExpensesForMonth: (month?: string) => Expense[];
  getMonthSummary: (month?: string) => MonthSummary;
  getCategorySpending: (month?: string) => Array<{
    category: Category;
    spent: number;
    budget: number;
    percentage: number;
    transactionCount: number;
    isSorted: boolean;
    isRecurring: boolean;
  }>;
  getDailySpending: (month?: string) => Array<{
    day: number;
    date: string;
    spent: number;
    count: number;
  }>;
  getHistoricalTrends: (numMonths?: number) => Array<{
    month: string;
    label: string;
    spent: number;
    budget: number;
  }>;
  getCategoryById: (id: string) => Category;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  selectedMonth: getCurrentMonthStr(),
  currency: "ZAR",
  expenses: [],
  categories: DEFAULT_CATEGORIES,
  budgets: [],
  recurringBudgets: {},
  isLoaded: false,

  quickAddOpen: false,
  budgetModalOpen: false,
  editingExpense: null,

  initStore: () => {
    storage.ensureInitialized();
    const expenses = storage.getExpenses();
    const categories = storage.getCategories();
    const budgets = storage.getBudgets();
    const recurringBudgets = storage.getRecurringBudgets();
    const currency = storage.getCurrency() || "ZAR";

    // Auto-propagate recurring expenses to selected or future months if needed
    const currentMonth = getCurrentMonthStr();
    let updatedExpenses = [...expenses];
    const recurringExpenses = expenses.filter((e) => e.isRecurring);

    for (const rec of recurringExpenses) {
      const recMonth = rec.date.slice(0, 7);
      if (recMonth < currentMonth) {
        const dayOfMonth = rec.date.slice(8, 10);
        const projectedDate = `${currentMonth}-${dayOfMonth}`;
        const alreadyExists = updatedExpenses.some(
          (e) =>
            e.date.startsWith(currentMonth) &&
            e.categoryId === rec.categoryId &&
            e.note === rec.note &&
            e.amount === rec.amount
        );

        if (!alreadyExists) {
          updatedExpenses.push({
            id: `rec-${rec.id}-${currentMonth}`,
            amount: rec.amount,
            categoryId: rec.categoryId,
            note: `${rec.note} (Recurring)`,
            date: projectedDate,
            paymentMethod: rec.paymentMethod,
            isRecurring: true,
          });
        }
      }
    }

    if (updatedExpenses.length !== expenses.length) {
      storage.saveExpenses(updatedExpenses);
    }

    set({
      expenses: updatedExpenses,
      categories,
      budgets,
      recurringBudgets,
      currency,
      isLoaded: true,
    });
  },

  setSelectedMonth: (month: string) => {
    set({ selectedMonth: month });
  },

  goToPreviousMonth: () => {
    const current = parse(get().selectedMonth, "yyyy-MM", new Date());
    const prev = subMonths(current, 1);
    set({ selectedMonth: format(prev, "yyyy-MM") });
  },

  goToNextMonth: () => {
    const current = parse(get().selectedMonth, "yyyy-MM", new Date());
    const next = addMonths(current, 1);
    set({ selectedMonth: format(next, "yyyy-MM") });
  },

  setCurrency: (code: string) => {
    storage.saveCurrency(code);
    set({ currency: code });
  },

  setQuickAddOpen: (open: boolean) => set({ quickAddOpen: open }),
  setBudgetModalOpen: (open: boolean) => set({ budgetModalOpen: open }),
  setEditingExpense: (expense: Expense | null) => set({ editingExpense: expense }),

  addExpense: (expenseData) => {
    const id = `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newExpense: Expense = {
      ...expenseData,
      id,
      createdAt: new Date().toISOString(),
    };

    const updated = [newExpense, ...get().expenses];
    storage.saveExpenses(updated);
    set({ expenses: updated });
  },

  updateExpense: (id: string, updates: Partial<Expense>) => {
    const updated = get().expenses.map((exp) =>
      exp.id === id ? { ...exp, ...updates } : exp
    );
    storage.saveExpenses(updated);
    set({ expenses: updated });
  },

  deleteExpense: (id: string) => {
    const updated = get().expenses.filter((exp) => exp.id !== id);
    storage.saveExpenses(updated);
    set({ expenses: updated });
  },

  addCategory: (categoryData) => {
    const id = `cat-${Date.now()}`;
    const newCategory: Category = {
      ...categoryData,
      id,
      isCustom: true,
    };
    const updated = [...get().categories, newCategory];
    storage.saveCategories(updated);
    set({ categories: updated });
  },

  updateCategory: (id: string, updates: Partial<Category>) => {
    const updated = get().categories.map((cat) =>
      cat.id === id ? { ...cat, ...updates } : cat
    );
    storage.saveCategories(updated);
    set({ categories: updated });
  },

  deleteCategory: (id: string) => {
    const updated = get().categories.filter((cat) => cat.id !== id);
    storage.saveCategories(updated);
    set({ categories: updated });
  },

  setBudget: (budget: Budget) => {
    const existing = get().budgets.filter((b) => b.month !== budget.month);
    const updated = [...existing, budget];

    // If budget has recurring categories, also update master recurringBudgets
    const recurring = { ...get().recurringBudgets };
    for (const catId of budget.recurringCategories || []) {
      if (budget.categories[catId] && budget.categories[catId] > 0) {
        recurring[catId] = budget.categories[catId];
      }
    }

    storage.saveRecurringBudgets(recurring);
    storage.saveBudgets(updated);
    set({ budgets: updated, recurringBudgets: recurring });
  },

  updateTotalBudget: (month: string, total: number) => {
    const currentBudgets = get().budgets;
    const existing = currentBudgets.find((b) => b.month === month);
    let updated: Budget[];

    if (existing) {
      updated = currentBudgets.map((b) =>
        b.month === month ? { ...b, total } : b
      );
    } else {
      updated = [...currentBudgets, { month, total, categories: {}, sortedCategories: [], recurringCategories: [] }];
    }

    storage.saveBudgets(updated);
    set({ budgets: updated });
  },

  updateCategoryBudget: (month: string, categoryId: string, amount: number) => {
    const currentBudgets = get().budgets;
    const existing = currentBudgets.find((b) => b.month === month);
    let updated: Budget[];

    if (existing) {
      updated = currentBudgets.map((b) => {
        if (b.month === month) {
          const newCats = { ...b.categories };
          if (amount <= 0) {
            delete newCats[categoryId];
          } else {
            newCats[categoryId] = amount;
          }
          return { ...b, categories: newCats };
        }
        return b;
      });
    } else {
      updated = [
        ...currentBudgets,
        {
          month,
          total: amount,
          categories: { [categoryId]: amount },
          sortedCategories: [],
          recurringCategories: [],
        },
      ];
    }

    // Also update recurring budget if this category is marked recurring
    if (get().recurringBudgets[categoryId]) {
      const rec = { ...get().recurringBudgets };
      if (amount <= 0) {
        delete rec[categoryId];
      } else {
        rec[categoryId] = amount;
      }
      storage.saveRecurringBudgets(rec);
      set({ recurringBudgets: rec });
    }

    storage.saveBudgets(updated);
    set({ budgets: updated });
  },

  toggleCategorySorted: (month: string, categoryId: string) => {
    const currentBudgets = get().budgets;
    const existing = currentBudgets.find((b) => b.month === month);
    let updated: Budget[];

    if (existing) {
      const currentSorted = existing.sortedCategories || [];
      const isAlreadySorted = currentSorted.includes(categoryId);
      const newSorted = isAlreadySorted
        ? currentSorted.filter((id) => id !== categoryId)
        : [...currentSorted, categoryId];

      updated = currentBudgets.map((b) =>
        b.month === month ? { ...b, sortedCategories: newSorted } : b
      );
    } else {
      updated = [
        ...currentBudgets,
        {
          month,
          total: 0,
          categories: {},
          sortedCategories: [categoryId],
          recurringCategories: [],
        },
      ];
    }

    storage.saveBudgets(updated);
    set({ budgets: updated });
  },

  toggleTotalSorted: (month: string) => {
    const currentBudgets = get().budgets;
    const existing = currentBudgets.find((b) => b.month === month);
    let updated: Budget[];

    if (existing) {
      updated = currentBudgets.map((b) =>
        b.month === month ? { ...b, isTotalSorted: !b.isTotalSorted } : b
      );
    } else {
      updated = [
        ...currentBudgets,
        {
          month,
          total: 0,
          categories: {},
          sortedCategories: [],
          recurringCategories: [],
          isTotalSorted: true,
        },
      ];
    }

    storage.saveBudgets(updated);
    set({ budgets: updated });
  },

  isCategorySorted: (month: string, categoryId: string) => {
    const budget = get().budgets.find((b) => b.month === month);
    return Boolean(budget?.sortedCategories?.includes(categoryId));
  },

  // Toggle whether an item / category budget appears in every month's budget
  toggleCategoryRecurring: (month: string, categoryId: string, amount?: number) => {
    const currentBudgets = get().budgets;
    const existing = currentBudgets.find((b) => b.month === month);
    const recurringBudgets = { ...get().recurringBudgets };

    const targetAmount =
      amount || existing?.categories[categoryId] || recurringBudgets[categoryId] || 0;

    let updatedBudgets: Budget[];

    if (existing) {
      const curRecurring = existing.recurringCategories || [];
      const isCurrentlyRecurring = curRecurring.includes(categoryId) || Boolean(recurringBudgets[categoryId]);

      let newRecurringList: string[];
      if (isCurrentlyRecurring) {
        newRecurringList = curRecurring.filter((id) => id !== categoryId);
        delete recurringBudgets[categoryId];
      } else {
        newRecurringList = [...curRecurring, categoryId];
        if (targetAmount > 0) {
          recurringBudgets[categoryId] = targetAmount;
        }
      }

      updatedBudgets = currentBudgets.map((b) =>
        b.month === month
          ? {
              ...b,
              recurringCategories: newRecurringList,
              categories: {
                ...b.categories,
                ...(targetAmount > 0 && !isCurrentlyRecurring ? { [categoryId]: targetAmount } : {}),
              },
            }
          : b
      );
    } else {
      recurringBudgets[categoryId] = targetAmount;
      updatedBudgets = [
        ...currentBudgets,
        {
          month,
          total: targetAmount,
          categories: targetAmount > 0 ? { [categoryId]: targetAmount } : {},
          sortedCategories: [],
          recurringCategories: [categoryId],
        },
      ];
    }

    storage.saveRecurringBudgets(recurringBudgets);
    storage.saveBudgets(updatedBudgets);
    set({ budgets: updatedBudgets, recurringBudgets });
  },

  applyCurrentMonthBudgetsToAllMonths: (sourceMonth: string) => {
    const budget = get().budgets.find((b) => b.month === sourceMonth);
    if (!budget) return;

    const recurringBudgets: Record<string, number> = { ...budget.categories };
    const recurringCategories = Object.keys(budget.categories).filter((k) => budget.categories[k] > 0);

    const updatedBudgets = get().budgets.map((b) => {
      if (b.month === sourceMonth) {
        return { ...b, recurringCategories };
      }
      return b;
    });

    storage.saveRecurringBudgets(recurringBudgets);
    storage.saveBudgets(updatedBudgets);
    set({ budgets: updatedBudgets, recurringBudgets });
  },

  isCategoryRecurring: (month: string, categoryId: string) => {
    const recurringBudgets = get().recurringBudgets;
    if (recurringBudgets[categoryId] && recurringBudgets[categoryId] > 0) return true;
    const budget = get().budgets.find((b) => b.month === month);
    return Boolean(budget?.recurringCategories?.includes(categoryId));
  },

  resetToDefaults: () => {
    storage.resetAll();
    get().initStore();
  },

  exportDataJSON: () => {
    const data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      currency: get().currency,
      categories: get().categories,
      expenses: get().expenses,
      budgets: get().budgets,
      recurringBudgets: get().recurringBudgets,
    };
    return JSON.stringify(data, null, 2);
  },

  exportDataCSV: () => {
    const expenses = get().expenses;
    const categories = get().categories;
    const catMap = new Map(categories.map((c) => [c.id, c.name]));

    const headers = ["ID", "Date", "Category", "Amount", "Note", "Payment Method", "Is Recurring"];
    const rows = expenses.map((e) => [
      e.id,
      e.date,
      `"${(catMap.get(e.categoryId) || "Other").replace(/"/g, '""')}"`,
      e.amount,
      `"${(e.note || "").replace(/"/g, '""')}"`,
      e.paymentMethod,
      e.isRecurring ? "Yes" : "No",
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  },

  importDataJSON: (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.expenses)) {
        storage.saveExpenses(data.expenses);
      }
      if (Array.isArray(data.categories)) {
        storage.saveCategories(data.categories);
      }
      if (Array.isArray(data.budgets)) {
        storage.saveBudgets(data.budgets);
      }
      if (data.recurringBudgets) {
        storage.saveRecurringBudgets(data.recurringBudgets);
      }
      if (data.currency) {
        storage.saveCurrency(data.currency);
      }
      get().initStore();
      return true;
    } catch {
      return false;
    }
  },

  getExpensesForMonth: (month?: string) => {
    const targetMonth = month || get().selectedMonth;
    return get()
      .expenses.filter((e) => e.date.startsWith(targetMonth))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  },

  getCategoryById: (id: string) => {
    return (
      get().categories.find((c) => c.id === id) || {
        id: "cat-other",
        name: "Other",
        color: "#64748b",
        icon: "MoreHorizontal",
      }
    );
  },

  getMonthSummary: (month?: string) => {
    const targetMonth = month || get().selectedMonth;
    const monthExpenses = get().expenses.filter((e) => e.date.startsWith(targetMonth));
    const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    const budget = get().budgets.find((b) => b.month === targetMonth);
    const catBudgets = { ...(get().recurringBudgets || {}), ...(budget?.categories || {}) };

    let totalBudget = budget?.total || 0;
    if (!totalBudget || totalBudget <= 0) {
      totalBudget = Object.values(catBudgets).reduce((sum, v) => sum + v, 0);
    }

    const { daysInMonth, daysPassed } = getMonthStats(targetMonth);
    const dailyAverage = daysPassed > 0 ? totalSpent / daysPassed : 0;
    const remaining = totalBudget > 0 ? totalBudget - totalSpent : 0;
    const percentageUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    const sortedCategories = budget?.sortedCategories || [];
    const budgetCategoryKeys = Object.keys(catBudgets).filter((k) => catBudgets[k] > 0);
    const totalCategoriesWithBudget = budgetCategoryKeys.length;
    const sortedCount = budgetCategoryKeys.filter((k) => sortedCategories.includes(k)).length;

    const recurringCategories = budget?.recurringCategories || Object.keys(get().recurringBudgets || {});
    const recurringCount = budgetCategoryKeys.filter(
      (k) => recurringCategories.includes(k) || Boolean(get().recurringBudgets?.[k])
    ).length;

    return {
      month: targetMonth,
      totalSpent,
      totalBudget,
      remaining,
      dailyAverage,
      daysPassed,
      daysInMonth,
      percentageUsed,
      sortedCount,
      totalCategoriesWithBudget,
      recurringCount,
    };
  },

  getCategorySpending: (month?: string) => {
    const targetMonth = month || get().selectedMonth;
    const monthExpenses = get().expenses.filter((e) => e.date.startsWith(targetMonth));
    const budget = get().budgets.find((b) => b.month === targetMonth);
    const catBudgets = { ...(get().recurringBudgets || {}), ...(budget?.categories || {}) };
    const sortedCategories = budget?.sortedCategories || [];
    const recurringCategories = budget?.recurringCategories || Object.keys(get().recurringBudgets || {});

    const spendingMap = new Map<string, { spent: number; count: number }>();

    for (const exp of monthExpenses) {
      const current = spendingMap.get(exp.categoryId) || { spent: 0, count: 0 };
      spendingMap.set(exp.categoryId, {
        spent: current.spent + exp.amount,
        count: current.count + 1,
      });
    }

    return get().categories.map((category) => {
      const stats = spendingMap.get(category.id) || { spent: 0, count: 0 };
      const catBudget = catBudgets[category.id] || 0;
      const percentage = catBudget > 0 ? Math.round((stats.spent / catBudget) * 100) : 0;
      const isSorted = sortedCategories.includes(category.id);
      const isRecurring =
        recurringCategories.includes(category.id) || Boolean(get().recurringBudgets?.[category.id]);

      return {
        category,
        spent: stats.spent,
        budget: catBudget,
        percentage,
        transactionCount: stats.count,
        isSorted,
        isRecurring,
      };
    });
  },

  getDailySpending: (month?: string) => {
    const targetMonth = month || get().selectedMonth;
    const { daysInMonth } = getMonthStats(targetMonth);
    const monthExpenses = get().expenses.filter((e) => e.date.startsWith(targetMonth));

    const dailyMap = new Map<number, { spent: number; count: number }>();
    for (let i = 1; i <= daysInMonth; i++) {
      dailyMap.set(i, { spent: 0, count: 0 });
    }

    for (const exp of monthExpenses) {
      const dayNum = parseInt(exp.date.slice(8, 10), 10);
      if (dayNum >= 1 && dayNum <= daysInMonth) {
        const current = dailyMap.get(dayNum) || { spent: 0, count: 0 };
        dailyMap.set(dayNum, {
          spent: current.spent + exp.amount,
          count: current.count + 1,
        });
      }
    }

    return Array.from(dailyMap.entries()).map(([day, data]) => ({
      day,
      date: `${targetMonth}-${String(day).padStart(2, "0")}`,
      spent: data.spent,
      count: data.count,
    }));
  },

  getHistoricalTrends: (numMonths = 6) => {
    const current = parse(get().selectedMonth, "yyyy-MM", new Date());
    const trends: Array<{ month: string; label: string; spent: number; budget: number }> = [];

    for (let i = numMonths - 1; i >= 0; i--) {
      const mDate = subMonths(current, i);
      const mStr = format(mDate, "yyyy-MM");
      const label = format(mDate, "MMM yy");

      const monthExpenses = get().expenses.filter((e) => e.date.startsWith(mStr));
      const spent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

      const budget = get().budgets.find((b) => b.month === mStr);
      let totalBudget = budget?.total || 0;
      if (budget && (!totalBudget || totalBudget <= 0) && budget.categories) {
        totalBudget = Object.values(budget.categories).reduce((sum, v) => sum + v, 0);
      }

      trends.push({
        month: mStr,
        label,
        spent,
        budget: totalBudget,
      });
    }

    return trends;
  },
}));
