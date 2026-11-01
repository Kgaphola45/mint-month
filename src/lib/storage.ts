import { Expense, Category, Budget, DebtInstalment, User } from "@/types";
import { DEFAULT_CATEGORIES } from "./constants";
import { generateSeedData } from "./dummy-data";

const STORAGE_KEYS = {
  EXPENSES: "mint_month_expenses_v2",
  CATEGORIES: "mint_month_categories_v2",
  BUDGETS: "mint_month_budgets_v2",
  RECURRING_BUDGETS: "mint_month_recurring_budgets_v2",
  CLEARED_RECURRING: "mint_month_cleared_recurring_v2",
  DEBTS: "mint_month_debts_v2",
  INCOMES: "mint_month_incomes_v2",
  PAYDAY: "mint_month_payday_v2",
  CURRENCY: "mint_month_currency_v2",
  USERS: "mint_month_users_v2",
  CURRENT_USER: "mint_month_current_user_v2",
  INITIALIZED: "mint_month_initialized_v2",
};

export const DEFAULT_DEBTS: DebtInstalment[] = [];

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
  getDebts(): DebtInstalment[];
  saveDebts(debts: DebtInstalment[]): void;
  getCurrency(): string;
  saveCurrency(currency: string): void;
  resetAll(): void;
}

export class LocalStorageAdapter implements StorageAdapter {
  private isClient(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private getKey(baseKey: string): string {
    if (!this.isClient()) return baseKey;
    try {
      const rawUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!rawUser) return baseKey;
      const user = JSON.parse(rawUser);
      if (!user || !user.id) {
        return baseKey;
      }
      return `${baseKey}_${user.id}`;
    } catch {
      return baseKey;
    }
  }

  constructor() {
    this.ensureInitialized();
  }

  public ensureInitialized(): void {
    if (!this.isClient()) return;

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }

    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!initialized) {
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
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.RECURRING_BUDGETS, JSON.stringify(defaultRecurring));
      localStorage.setItem(STORAGE_KEYS.CLEARED_RECURRING, JSON.stringify({}));
      localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CURRENCY, "ZAR");
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true");
    }
  }

  // --- User Account & Auth Methods ---

  getUsers(): User[] {
    if (!this.isClient()) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveUsers(users: User[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getCurrentUser(): User | null {
    if (!this.isClient()) return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!raw) return null;
      const user = JSON.parse(raw);
      return user && user.id ? user : null;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: User | null): void {
    if (!this.isClient()) return;
    if (user && user.id) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  registerUser(
    name: string,
    email: string,
    password: string,
    monthlySalary?: number
  ): { success: boolean; user?: User; error?: string } {
    if (!this.isClient()) return { success: false, error: "Client-side required" };

    const normalizedEmail = email.trim().toLowerCase();
    const existingUsers = this.getUsers();

    if (existingUsers.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: "An account with this email already exists." };
    }

    const avatarPalette = ["#0D0D0C", "#96CE96", "#F99654", "#ECD6E2", "#F6DE68"];
    const newUser: User = {
      id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: password, // Ready for bcrypt / Supabase Auth
      avatarColor: avatarPalette[Math.floor(Math.random() * avatarPalette.length)],
      monthlySalary: monthlySalary && monthlySalary > 0 ? monthlySalary : 25000,
      paydayDay: 25,
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...existingUsers, newUser];
    this.saveUsers(updatedUsers);
    this.setCurrentUser(newUser);

    // Initialize user's separate fresh workspace
    const userCategoryKey = this.getKey(STORAGE_KEYS.CATEGORIES);
    const userExpensesKey = this.getKey(STORAGE_KEYS.EXPENSES);
    const userBudgetsKey = this.getKey(STORAGE_KEYS.BUDGETS);
    const userDebtsKey = this.getKey(STORAGE_KEYS.DEBTS);
    const userRecurringKey = this.getKey(STORAGE_KEYS.RECURRING_BUDGETS);
    const userIncomesKey = this.getKey(STORAGE_KEYS.INCOMES);

    localStorage.setItem(userCategoryKey, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(userExpensesKey, JSON.stringify([]));
    localStorage.setItem(userBudgetsKey, JSON.stringify([]));
    localStorage.setItem(userDebtsKey, JSON.stringify([]));
    localStorage.setItem(userRecurringKey, JSON.stringify({}));
    localStorage.setItem(
      userIncomesKey,
      JSON.stringify({ default: newUser.monthlySalary || 25000 })
    );

    return { success: true, user: newUser };
  }

  authenticateUser(
    email: string,
    password: string
  ): { success: boolean; user?: User; error?: string } {
    if (!this.isClient()) return { success: false, error: "Client-side required" };

    const normalizedEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return { success: false, error: "No account found with this email address." };
    }

    if (user.passwordHash && user.passwordHash !== password) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    this.setCurrentUser(user);
    return { success: true, user };
  }

  updateUserPassword(email: string, newPassword: string): boolean {
    if (!this.isClient()) return false;
    const normalized = email.trim().toLowerCase();
    const users = this.getUsers();
    let updated = false;
    const newUsers = users.map((u) => {
      if (u.email.toLowerCase() === normalized) {
        updated = true;
        return { ...u, passwordHash: newPassword };
      }
      return u;
    });
    if (updated) {
      this.saveUsers(newUsers);
      const current = this.getCurrentUser();
      if (current && current.email.toLowerCase() === normalized) {
        this.setCurrentUser({ ...current, passwordHash: newPassword });
      }
    }
    return updated;
  }

  logoutUser(): void {
    if (!this.isClient()) return;
    this.setCurrentUser(null);
  }

  deleteUserAccount(userId: string): boolean {
    if (!this.isClient()) return false;

    const users = this.getUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) return false;

    // 1. Remove user from saved users list
    const updatedUsers = users.filter((u) => u.id !== userId);
    this.saveUsers(updatedUsers);

    // 2. Remove all user-scoped records from localStorage
    const userKeys = [
      `${STORAGE_KEYS.EXPENSES}_${userId}`,
      `${STORAGE_KEYS.CATEGORIES}_${userId}`,
      `${STORAGE_KEYS.BUDGETS}_${userId}`,
      `${STORAGE_KEYS.RECURRING_BUDGETS}_${userId}`,
      `${STORAGE_KEYS.CLEARED_RECURRING}_${userId}`,
      `${STORAGE_KEYS.DEBTS}_${userId}`,
      `${STORAGE_KEYS.INCOMES}_${userId}`,
      `${STORAGE_KEYS.PAYDAY}_${userId}`,
    ];

    userKeys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore errors
      }
    });

    // 3. If currently logged in as this user, log out
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.logoutUser();
    }

    return true;
  }

  // --- Data Access Methods with User Scoping ---

  getExpenses(): Expense[] {
    if (!this.isClient()) return [];
    try {
      const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.EXPENSES));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveExpenses(expenses: Expense[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(this.getKey(STORAGE_KEYS.EXPENSES), JSON.stringify(expenses));
  }

  getCategories(): Category[] {
    if (!this.isClient()) return DEFAULT_CATEGORIES;
    try {
      const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.CATEGORIES));
      return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  }

  saveCategories(categories: Category[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(this.getKey(STORAGE_KEYS.CATEGORIES), JSON.stringify(categories));
  }

  getBudgets(): Budget[] {
    if (!this.isClient()) return [];
    try {
      const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.BUDGETS));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveBudgets(budgets: Budget[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(this.getKey(STORAGE_KEYS.BUDGETS), JSON.stringify(budgets));
  }

  getRecurringBudgets(): Record<string, number> {
    if (!this.isClient()) return {};
    try {
      const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.RECURRING_BUDGETS));
      if (raw) return JSON.parse(raw);
      return {};
    } catch {
      return {};
    }
  }

  saveRecurringBudgets(recurring: Record<string, number>): void {
    if (!this.isClient()) return;
    localStorage.setItem(this.getKey(STORAGE_KEYS.RECURRING_BUDGETS), JSON.stringify(recurring));
  }

  getClearedRecurring(): Record<string, boolean> {
    if (!this.isClient()) return {};
    try {
      const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.CLEARED_RECURRING));
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  saveClearedRecurring(cleared: Record<string, boolean>): void {
    if (!this.isClient()) return;
    localStorage.setItem(this.getKey(STORAGE_KEYS.CLEARED_RECURRING), JSON.stringify(cleared));
  }

  getDebts(): DebtInstalment[] {
    try {
      const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.DEBTS));
      if (raw) return JSON.parse(raw);
      return [];
    } catch {
      return [];
    }
  }

  saveDebts(debts: DebtInstalment[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(this.getKey(STORAGE_KEYS.DEBTS), JSON.stringify(debts));
  }

  getIncomes(): Record<string, number> {
    const user = this.getCurrentUser();
    const defaultVal = user?.monthlySalary || 25000;
    if (!this.isClient()) return { default: defaultVal };
    try {
      const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.INCOMES));
      return raw ? JSON.parse(raw) : { default: defaultVal };
    } catch {
      return { default: defaultVal };
    }
  }

  saveIncomes(incomes: Record<string, number>): void {
    if (!this.isClient()) return;
    localStorage.setItem(this.getKey(STORAGE_KEYS.INCOMES), JSON.stringify(incomes));
  }

  getPaydayDay(): number {
    const user = this.getCurrentUser();
    const defaultPayday = user?.paydayDay || 25;
    if (!this.isClient()) return defaultPayday;
    try {
      const raw = localStorage.getItem(this.getKey(STORAGE_KEYS.PAYDAY));
      const parsed = raw ? parseInt(raw, 10) : defaultPayday;
      return parsed >= 1 && parsed <= 31 ? parsed : defaultPayday;
    } catch {
      return defaultPayday;
    }
  }

  savePaydayDay(day: number): void {
    if (!this.isClient()) return;
    localStorage.setItem(this.getKey(STORAGE_KEYS.PAYDAY), day.toString());
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
    localStorage.removeItem(STORAGE_KEYS.DEBTS);
    localStorage.removeItem(STORAGE_KEYS.INCOMES);
    localStorage.removeItem(STORAGE_KEYS.PAYDAY);
    localStorage.removeItem(STORAGE_KEYS.CURRENCY);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.ensureInitialized();
  }
}

export const storage = new LocalStorageAdapter();
