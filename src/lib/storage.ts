/**
 * Storage Abstraction Layer
 * MVP uses LocalStorage with a clean interface.
 * When migrating to Supabase / Backend, replace or augment this adapter.
 *
 * Supabase SQL Schema equivalent:
 *
 * CREATE TABLE categories (
 *   id TEXT PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   color TEXT NOT NULL,
 *   icon TEXT NOT NULL,
 *   is_custom BOOLEAN DEFAULT false
 * );
 *
 * CREATE TABLE expenses (
 *   id TEXT PRIMARY KEY,
 *   amount NUMERIC NOT NULL,
 *   category_id TEXT REFERENCES categories(id),
 *   note TEXT,
 *   date DATE NOT NULL,
 *   payment_method TEXT NOT NULL,
 *   is_recurring BOOLEAN DEFAULT false,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * CREATE TABLE budgets (
 *   id TEXT PRIMARY KEY,
 *   month TEXT NOT NULL UNIQUE, -- 'YYYY-MM'
 *   total NUMERIC NOT NULL,
 *   categories JSONB DEFAULT '{}'::jsonb
 * );
 */

import { Expense, Category, Budget } from "@/types";
import { DEFAULT_CATEGORIES } from "./constants";
import { generateSeedData } from "./dummy-data";

const STORAGE_KEYS = {
  EXPENSES: "mint_month_expenses_v2",
  CATEGORIES: "mint_month_categories_v2",
  BUDGETS: "mint_month_budgets_v2",
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
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(seed.expenses));
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(seed.budgets));
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
    localStorage.removeItem(STORAGE_KEYS.CURRENCY);
    this.ensureInitialized();
  }
}

export const storage = new LocalStorageAdapter();

