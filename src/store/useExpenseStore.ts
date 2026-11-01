import { create } from "zustand";
import { format, subMonths, addMonths, parse } from "date-fns";
import {
  Expense,
  Category,
  Budget,
  MonthSummary,
  RecurringTimelineItem,
  RecurringTimelineSummary,
  DebtInstalment,
  DebtSummary,
  SafeToSpendSummary,
  User,
  RegisterInput,
  LoginInput,
} from "@/types";
import { storage } from "@/lib/storage";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { getCurrentMonthStr, getMonthStats, getTodayDateStr } from "@/lib/utils";

interface ExpenseStore {
  selectedMonth: string; // 'YYYY-MM'
  currency: string;
  expenses: Expense[];
  categories: Category[];
  budgets: Budget[];
  recurringBudgets: Record<string, number>; // Category limits that automatically repeat every month
  clearedRecurring: Record<string, boolean>; // 'YYYY-MM:expenseId' -> boolean
  debts: DebtInstalment[]; // Debt & contract instalment plans
  incomes: Record<string, number>; // Month -> Income (or 'default' -> default income)
  paydayDay: number; // 1-31, default 25
  isLoaded: boolean;

  // User Accounts & Authentication
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
  authModalOpen: boolean;
  authModalMode: "login" | "register";

  // Modals & transient UI
  quickAddOpen: boolean;
  budgetModalOpen: boolean;
  debtModalOpen: boolean;
  paydayModalOpen: boolean;
  simulatorModalOpen: boolean;
  editingExpense: Expense | null;
  editingDebt: DebtInstalment | null;

  // Actions
  initStore: () => void;
  setSelectedMonth: (month: string) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  setCurrency: (code: string) => void;
  setQuickAddOpen: (open: boolean) => void;
  setBudgetModalOpen: (open: boolean) => void;
  setDebtModalOpen: (open: boolean) => void;
  setPaydayModalOpen: (open: boolean) => void;
  setSimulatorModalOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean, mode?: "login" | "register") => void;
  login: (input: LoginInput) => { success: boolean; error?: string };
  register: (input: RegisterInput) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  deleteAccount: (userId?: string) => Promise<{ success: boolean; error?: string }>;
  setEditingExpense: (expense: Expense | null) => void;
  setEditingDebt: (debt: DebtInstalment | null) => void;
  setMonthIncome: (month: string, amount: number) => void;
  setDefaultIncome: (amount: number) => void;
  setPaydayDay: (day: number) => void;

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

  // Recurring bills timeline cleared actions
  toggleRecurringCleared: (month: string, expenseId: string) => void;
  isRecurringCleared: (month: string, expenseId: string, defaultCleared: boolean) => boolean;

  // Debt & instalment actions
  addDebt: (debt: Omit<DebtInstalment, "id">) => void;
  updateDebt: (id: string, updates: Partial<DebtInstalment>) => void;
  deleteDebt: (id: string) => void;
  incrementDebtInstalment: (id: string) => void;
  decrementDebtInstalment: (id: string) => void;
  getDebtSummary: () => DebtSummary;

  resetToDefaults: () => void;
  exportDataJSON: () => string;
  exportDataCSV: () => string;
  importDataJSON: (jsonStr: string) => boolean;

  // Computed helper selectors
  getRecurringTimeline: (month?: string) => {
    items: RecurringTimelineItem[];
    summary: RecurringTimelineSummary;
  };
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
  getSafeToSpend: (month?: string) => SafeToSpendSummary;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  selectedMonth: getCurrentMonthStr(),
  currency: "ZAR",
  expenses: [],
  categories: DEFAULT_CATEGORIES,
  budgets: [],
  recurringBudgets: {},
  clearedRecurring: {},
  debts: [],
  incomes: { default: 25000 },
  paydayDay: 25,
  isLoaded: false,

  currentUser: null,
  isAuthenticated: false,
  users: [],
  authModalOpen: false,
  authModalMode: "login",

  quickAddOpen: false,
  budgetModalOpen: false,
  debtModalOpen: false,
  paydayModalOpen: false,
  simulatorModalOpen: false,
  editingExpense: null,
  editingDebt: null,

  initStore: () => {
    storage.ensureInitialized();
    const currentUser = storage.getCurrentUser();
    const users = storage.getUsers();
    const expenses = storage.getExpenses();
    const categories = storage.getCategories();
    const budgets = storage.getBudgets();
    const recurringBudgets = storage.getRecurringBudgets();
    const clearedRecurring = storage.getClearedRecurring();
    const debts = storage.getDebts();
    const incomes = storage.getIncomes();
    const paydayDay = storage.getPaydayDay();
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
      currentUser,
      isAuthenticated: Boolean(currentUser),
      users,
      expenses: updatedExpenses,
      categories,
      budgets,
      recurringBudgets,
      clearedRecurring,
      debts,
      incomes,
      paydayDay,
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
  setDebtModalOpen: (open: boolean) => set({ debtModalOpen: open }),
  setPaydayModalOpen: (open: boolean) => set({ paydayModalOpen: open }),
  setSimulatorModalOpen: (open: boolean) => set({ simulatorModalOpen: open }),
  setAuthModalOpen: (open: boolean, mode: "login" | "register" = "login") =>
    set({ authModalOpen: open, authModalMode: mode }),

  login: (input) => {
    const res = storage.authenticateUser(input.email, input.password);
    if (res.success && res.user) {
      set({
        currentUser: res.user,
        isAuthenticated: true,
        authModalOpen: false,
      });
      get().initStore();
      return { success: true };
    }
    return { success: false, error: res.error || "Authentication failed" };
  },

  register: (input) => {
    const res = storage.registerUser(
      input.name,
      input.email,
      input.password,
      input.monthlySalary
    );
    if (res.success && res.user) {
      set({
        currentUser: res.user,
        isAuthenticated: true,
        users: storage.getUsers(),
        authModalOpen: false,
      });
      get().initStore();
      return { success: true };
    }
    return { success: false, error: res.error || "Registration failed" };
  },

  logout: () => {
    storage.logoutUser();
    set({
      currentUser: null,
      isAuthenticated: false,
    });
    get().initStore();
  },

  switchUser: (userId: string) => {
    const users = storage.getUsers();
    const target = users.find((u) => u.id === userId);
    if (target) {
      storage.setCurrentUser(target);
      set({
        currentUser: target,
        isAuthenticated: true,
      });
      get().initStore();
    }
  },

  deleteAccount: async (userId?: string) => {
    const current = get().currentUser;
    const targetId = userId || current?.id;
    if (!targetId) {
      return { success: false, error: "No account selected for deletion." };
    }

    const users = storage.getUsers();
    const targetUser =
      users.find((u) => u.id === targetId) || (current?.id === targetId ? current : null);

    // 1. Purge from server DB if user had an email
    if (targetUser?.email) {
      try {
        await fetch("/api/auth/delete-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: targetUser.email }),
        });
      } catch {
        // Proceed even if server route or network fails
      }
    }

    // 2. Purge client-side records
    const deleted = storage.deleteUserAccount(targetId);
    if (!deleted) {
      return { success: false, error: "Failed to remove user account from local storage." };
    }

    const remainingUsers = storage.getUsers();

    // 3. Reset store if active user was purged
    if (current?.id === targetId) {
      set({
        currentUser: null,
        isAuthenticated: false,
        users: remainingUsers,
        expenses: [],
        categories: DEFAULT_CATEGORIES,
        budgets: [],
        recurringBudgets: {},
        clearedRecurring: {},
        debts: [],
      });
      get().initStore();
    } else {
      set({ users: remainingUsers });
    }

    return { success: true };
  },

  setEditingExpense: (expense: Expense | null) => set({ editingExpense: expense }),
  setEditingDebt: (debt: DebtInstalment | null) => set({ editingDebt: debt }),

  setMonthIncome: (month: string, amount: number) => {
    const updated = { ...get().incomes, [month]: amount };
    storage.saveIncomes(updated);
    set({ incomes: updated });
  },

  setDefaultIncome: (amount: number) => {
    const updated = { ...get().incomes, default: amount };
    storage.saveIncomes(updated);
    set({ incomes: updated });
  },

  setPaydayDay: (day: number) => {
    const clamped = Math.max(1, Math.min(31, day));
    storage.savePaydayDay(clamped);
    set({ paydayDay: clamped });
  },

  addDebt: (debtData) => {
    const id = `debt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const totalAmount =
      debtData.totalAmount || debtData.totalInstalments * debtData.monthlyAmount;
    const isPaidOff = debtData.paidInstalments >= debtData.totalInstalments;

    const newDebt: DebtInstalment = {
      ...debtData,
      id,
      totalAmount,
      isPaidOff,
    };

    const updated = [...get().debts, newDebt];
    storage.saveDebts(updated);
    set({ debts: updated });
  },

  updateDebt: (id, updates) => {
    const updated = get().debts.map((d) => {
      if (d.id !== id) return d;
      const merged = { ...d, ...updates };
      if (merged.paidInstalments >= merged.totalInstalments) {
        merged.isPaidOff = true;
      } else if (
        updates.paidInstalments !== undefined &&
        merged.paidInstalments < merged.totalInstalments
      ) {
        merged.isPaidOff = false;
      }
      return merged;
    });
    storage.saveDebts(updated);
    set({ debts: updated });
  },

  deleteDebt: (id) => {
    const updated = get().debts.filter((d) => d.id !== id);
    storage.saveDebts(updated);
    set({ debts: updated });
  },

  incrementDebtInstalment: (id) => {
    const updated = get().debts.map((d) => {
      if (d.id !== id) return d;
      const paid = Math.min(d.totalInstalments, (d.paidInstalments || 0) + 1);
      return {
        ...d,
        paidInstalments: paid,
        isPaidOff: paid >= d.totalInstalments,
      };
    });
    storage.saveDebts(updated);
    set({ debts: updated });
  },

  decrementDebtInstalment: (id) => {
    const updated = get().debts.map((d) => {
      if (d.id !== id) return d;
      const paid = Math.max(0, (d.paidInstalments || 0) - 1);
      return {
        ...d,
        paidInstalments: paid,
        isPaidOff: paid >= d.totalInstalments,
      };
    });
    storage.saveDebts(updated);
    set({ debts: updated });
  },

  getDebtSummary: () => {
    const debts = get().debts;
    let totalContractValue = 0;
    let totalPaid = 0;
    let totalRemaining = 0;
    let totalMonthly = 0;
    let activeCount = 0;
    let paidOffCount = 0;

    let minRemainingMonths = Infinity;
    let nextPayoffName: string | undefined;

    for (const d of debts) {
      const isPaid = d.isPaidOff || d.paidInstalments >= d.totalInstalments;
      const contractVal =
        d.totalAmount || d.totalInstalments * d.monthlyAmount;
      const paidVal = d.paidInstalments * d.monthlyAmount;
      const remVal = Math.max(
        0,
        (d.totalInstalments - d.paidInstalments) * d.monthlyAmount
      );
      const remMonths = Math.max(0, d.totalInstalments - d.paidInstalments);

      totalContractValue += contractVal;
      totalPaid += paidVal;
      totalRemaining += remVal;

      if (isPaid) {
        paidOffCount++;
      } else {
        activeCount++;
        totalMonthly += d.monthlyAmount;
        if (remMonths > 0 && remMonths < minRemainingMonths) {
          minRemainingMonths = remMonths;
          nextPayoffName = d.name;
        }
      }
    }

    const overallProgress =
      totalContractValue > 0
        ? Math.round((totalPaid / totalContractValue) * 100)
        : 100;

    return {
      totalMonthly,
      totalRemaining,
      totalPaid,
      totalContractValue,
      overallProgress,
      activeCount,
      paidOffCount,
      nextPayoffName:
        minRemainingMonths < Infinity ? nextPayoffName : undefined,
      nextPayoffMonths:
        minRemainingMonths < Infinity ? minRemainingMonths : undefined,
    };
  },

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

  toggleRecurringCleared: (month: string, expenseId: string) => {
    const key = `${month}:${expenseId}`;
    const cleared = { ...get().clearedRecurring };
    const current = cleared[key];

    if (typeof current === "boolean") {
      cleared[key] = !current;
    } else {
      const timeline = get().getRecurringTimeline(month);
      const item = timeline.items.find((i) => i.expenseId === expenseId);
      cleared[key] = !(item?.isCleared ?? false);
    }

    storage.saveClearedRecurring(cleared);
    set({ clearedRecurring: cleared });
  },

  isRecurringCleared: (month: string, expenseId: string, defaultCleared: boolean) => {
    const key = `${month}:${expenseId}`;
    const cleared = get().clearedRecurring;
    if (typeof cleared[key] === "boolean") {
      return cleared[key];
    }
    return defaultCleared;
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
      debts: get().debts,
      incomes: get().incomes,
      paydayDay: get().paydayDay,
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
      if (Array.isArray(data.debts)) {
        storage.saveDebts(data.debts);
      }
      if (data.incomes && typeof data.incomes === "object") {
        storage.saveIncomes(data.incomes);
      }
      if (typeof data.paydayDay === "number") {
        storage.savePaydayDay(data.paydayDay);
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

  getRecurringTimeline: (month?: string) => {
    const targetMonth = month || get().selectedMonth;
    const allExpenses = get().expenses;
    const categories = get().categories;
    const catMap = new Map(categories.map((c) => [c.id, c]));

    // Find all recurring expenses in target month
    let recurringInMonth = allExpenses.filter(
      (e) => e.date.startsWith(targetMonth) && e.isRecurring
    );

    // If target month has no recurring expenses yet, project from existing recurring expenses
    if (recurringInMonth.length === 0) {
      const uniqueTemplates = new Map<string, Expense>();
      allExpenses
        .filter((e) => e.isRecurring)
        .forEach((e) => {
          const key = `${e.categoryId}-${e.note}`;
          if (!uniqueTemplates.has(key)) {
            uniqueTemplates.set(key, e);
          }
        });

      recurringInMonth = Array.from(uniqueTemplates.values()).map((t) => {
        const day = t.date.slice(8, 10);
        return {
          ...t,
          id: `proj-${t.id}-${targetMonth}`,
          date: `${targetMonth}-${day}`,
        };
      });
    }

    const todayStr = getTodayDateStr();
    const todayMonth = todayStr.slice(0, 7);
    const todayDay = parseInt(todayStr.slice(8, 10), 10);

    const items: RecurringTimelineItem[] = recurringInMonth
      .map((exp) => {
        const cat = catMap.get(exp.categoryId) || {
          id: exp.categoryId,
          name: "Uncategorized",
          color: "#0D0D0C",
          icon: "CircleDot",
        };

        const day = parseInt(exp.date.slice(8, 10), 10) || 1;

        let defaultCleared = false;
        let daysUntil = 0;

        if (targetMonth < todayMonth) {
          defaultCleared = true;
          daysUntil = -1;
        } else if (targetMonth > todayMonth) {
          defaultCleared = false;
          daysUntil = 10;
        } else {
          daysUntil = day - todayDay;
          defaultCleared = day <= todayDay;
        }

        const isCleared = get().isRecurringCleared(
          targetMonth,
          exp.id,
          defaultCleared
        );

        let status: "cleared" | "today" | "upcoming" = "upcoming";
        if (isCleared) {
          status = "cleared";
        } else if (daysUntil === 0) {
          status = "today";
        } else {
          status = "upcoming";
        }

        return {
          id: exp.id,
          expenseId: exp.id,
          note: exp.note || cat.name,
          amount: exp.amount,
          categoryId: exp.categoryId,
          category: cat,
          paymentMethod: exp.paymentMethod,
          date: exp.date,
          day,
          isCleared,
          status,
          daysUntil,
        };
      })
      .sort((a, b) => a.day - b.day);

    const totalCommitted = items.reduce((sum, item) => sum + item.amount, 0);
    const clearedAmount = items
      .filter((item) => item.isCleared)
      .reduce((sum, item) => sum + item.amount, 0);
    const pendingAmount = items
      .filter((item) => !item.isCleared)
      .reduce((sum, item) => sum + item.amount, 0);

    const totalCount = items.length;
    const clearedCount = items.filter((item) => item.isCleared).length;
    const pendingCount = items.filter((item) => !item.isCleared).length;
    const percentageCleared =
      totalCommitted > 0 ? Math.round((clearedAmount / totalCommitted) * 100) : 0;

    return {
      items,
      summary: {
        totalCommitted,
        clearedAmount,
        pendingAmount,
        totalCount,
        clearedCount,
        pendingCount,
        percentageCleared,
      },
    };
  },

  getSafeToSpend: (month?: string) => {
    const targetMonth = month || get().selectedMonth;
    const incomes = get().incomes;
    const monthlyIncome = incomes[targetMonth] || incomes.default || 25000;
    const paydayDay = get().paydayDay || 25;

    // 1. Fixed commitments (debit orders, contracts, recurring subscriptions)
    const timeline = get().getRecurringTimeline(targetMonth);
    const fixedCommitments = timeline.summary.totalCommitted;
    const pendingCommitments = timeline.summary.pendingAmount;
    const clearedCommitments = timeline.summary.clearedAmount;
    const fixedCommitmentsCount = timeline.summary.totalCount;

    // 2. Spending so far in the month
    const monthExpenses = get().expenses.filter((e) => e.date.startsWith(targetMonth));
    const nonRecurringExpenses = monthExpenses.filter((e) => !e.isRecurring);
    const nonRecurringSpent = nonRecurringExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // 3. Living category budgets
    const budget = get().budgets.find((b) => b.month === targetMonth);
    const catBudgets = { ...(get().recurringBudgets || {}), ...(budget?.categories || {}) };
    let budgetedLiving = 0;
    for (const [catId, limit] of Object.entries(catBudgets)) {
      if (limit > 0 && catId !== "cat-debt" && catId !== "cat-subscriptions") {
        budgetedLiving += limit;
      }
    }

    // 4. Safe-to-Spend Pools
    const safeToSpendPool = Math.max(0, monthlyIncome - fixedCommitments);
    const safeToSpendRemaining = safeToSpendPool - nonRecurringSpent;

    // 5. Days calculations
    const { daysInMonth, daysPassed } = getMonthStats(targetMonth);
    const todayStr = getTodayDateStr();
    const currentMonth = getCurrentMonthStr();
    const todayDay = parseInt(todayStr.slice(8, 10), 10) || 1;

    let daysRemaining = 1;
    let daysUntilPayday = 0;

    if (targetMonth === currentMonth) {
      daysRemaining = Math.max(1, daysInMonth - todayDay + 1);
      if (todayDay <= paydayDay) {
        daysUntilPayday = paydayDay - todayDay;
      } else {
        daysUntilPayday = daysInMonth - todayDay + paydayDay;
      }
    } else if (targetMonth < currentMonth) {
      daysRemaining = 0;
      daysUntilPayday = 0;
    } else {
      daysRemaining = daysInMonth;
      daysUntilPayday = paydayDay;
    }

    // 6. Daily Free Allowance
    const dailyAllowance =
      daysRemaining > 0
        ? Math.round((safeToSpendRemaining / daysRemaining) * 100) / 100
        : safeToSpendRemaining;

    // 7. Status
    let status: "comfortable" | "balanced" | "tight" | "overspent" = "comfortable";
    if (safeToSpendRemaining < 0) {
      status = "overspent";
    } else if (dailyAllowance < 75) {
      status = "tight";
    } else if (dailyAllowance < 200) {
      status = "balanced";
    } else {
      status = "comfortable";
    }

    return {
      month: targetMonth,
      monthlyIncome,
      fixedCommitments,
      pendingCommitments,
      clearedCommitments,
      budgetedLiving,
      nonRecurringSpent,
      totalSpent,
      safeToSpendPool,
      safeToSpendRemaining,
      dailyAllowance,
      daysRemaining,
      daysPassed,
      daysInMonth,
      paydayDay,
      daysUntilPayday,
      status,
      fixedCommitmentsCount,
    };
  },
}));
