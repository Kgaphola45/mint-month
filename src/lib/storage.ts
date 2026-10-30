import { Expense, Category, Budget } from "@/types";
import { DEFAULT_CATEGORIES } from "./constants";
import { generateSeedData } from "./dummy-data";

const STORAGE_KEYS = {
  EXPENSES: "mint_month_expenses_v2",
  CATEGORIES: "mint_month_categories_v2",
  BUDGETS: "mint_month_budgets_v2",
  RECURRING_BUDGETS: "mint_month_recurring_budgets_v2",
  CLEARED_RECURRING: "mint_month_cleared_recurring_v2",
  CURRENCY: "mint_month_currency_v2",
  INITIALIZED: "mint_month_initialized_v2",
};

export interface StorageAdapter {
  getExpenses(): Expense[];
  saveExpenses(expenses: Expense[]): void;
  getCategories(): Category[];
  saveCategories(categories: Category[]): void;
  getBudgets(): Budget[];
  saveBudgets(budgets: Budget[]): void;
  getRecurringBudgets(): Record<string, number>;
  saveRecurringBudgets(recurring: Record<string, number>): void;
  getClearedRecurring(): Record<string, boolean>;
  saveClearedRecurring(cleared: Record<string, boolean>): void;
  getCurrency(): string;
  saveCurrency(currency: string): void;
  resetAll(): void;
}

export class LocalStorageAdapter implements StorageAdapter {
  private isClient(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  constructor() {
    this.ensureInitialized();
  }

  public ensureInitialized(): void {
    if (!this.isClient()) return;

    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!initialized) {
      const seed = generateSeedData();
      const defaultRecurring: Record<string, number> = {
        "cat-subscriptions": 250,
        "cat-debt": 3500,
        "cat-airtime-data": 1500,
        "cat-groceries": 3800,
        "cat-transport": 2000,
        "cat-personal-care": 2000,
        "cat-clothing": 800,
      };

      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(seed.expenses));
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(seed.budgets));
      localStorage.setItem(STORAGE_KEYS.RECURRING_BUDGETS, JSON.stringify(defaultRecurring));
      localStorage.setItem(STORAGE_KEYS.CLEARED_RECURRING, JSON.stringify({}));
      localStorage.setItem(STORAGE_KEYS.CURRENCY, "ZAR");
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true");
    }
  }

  getExpenses(): Expense[] {
    if (!this.isClient()) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveExpenses(expenses: Expense[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }

  getCategories(): Category[] {
    if (!this.isClient()) return DEFAULT_CATEGORIES;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  }

  saveCategories(categories: Category[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  getBudgets(): Budget[] {
    if (!this.isClient()) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveBudgets(budgets: Budget[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }

  getRecurringBudgets(): Record<string, number> {
    if (!this.isClient()) return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RECURRING_BUDGETS);
      if (raw) return JSON.parse(raw);
      return {
        "cat-subscriptions": 250,
        "cat-debt": 3500,
        "cat-airtime-data": 1500,
        "cat-groceries": 3800,
        "cat-transport": 2000,
        "cat-personal-care": 2000,
        "cat-clothing": 800,
      };
    } catch {
      return {};
    }
  }

  saveRecurringBudgets(recurring: Record<string, number>): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.RECURRING_BUDGETS, JSON.stringify(recurring));
  }

  getClearedRecurring(): Record<string, boolean> {
    if (!this.isClient()) return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CLEARED_RECURRING);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  saveClearedRecurring(cleared: Record<string, boolean>): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.CLEARED_RECURRING, JSON.stringify(cleared));
  }

  getCurrency(): string {
    if (!this.isClient()) return "ZAR";
    return localStorage.getItem(STORAGE_KEYS.CURRENCY) || "ZAR";
  }

  saveCurrency(currency: string): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
  }

  resetAll(): void {
    if (!this.isClient()) return;
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.RECURRING_BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.CLEARED_RECURRING);
    localStorage.removeItem(STORAGE_KEYS.CURRENCY);
    this.ensureInitialized();
  }
}

export const storage = new LocalStorageAdapter();
