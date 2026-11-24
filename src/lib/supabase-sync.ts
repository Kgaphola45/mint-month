import { getSupabaseClient } from "./supabase/client";
import { Expense, Budget, DebtInstalment, PaymentMethod, User } from "@/types";

// Helper to check if a string is a valid UUID
export function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    str
  );
}

// Deterministic UUIDv4-formatted ID from any legacy string ID (e.g. "exp-1", "rec-...")
export function toDeterministicUUID(input: string): string {
  if (isUUID(input)) return input;
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  let h3 = 0x9e3779b9 ^ input.length;
  let h4 = 0x85ebca6b ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 2246822519);
    h4 = Math.imul(h4 ^ ch, 3266489917);
  }
  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, "0");
  const raw = `${hex(h1)}${hex(h2)}${hex(h3)}${hex(h4)}`;
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-4${raw.slice(13, 16)}-a${raw.slice(17, 20)}-${raw.slice(20, 32)}`;
}

async function resolveAuthenticatedUserId(fallbackUserId?: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user?.id) {
      return session.user.id;
    }
  } catch {
    // ignore
  }
  return fallbackUserId && isUUID(fallbackUserId) ? fallbackUserId : null;
}

// ==========================================
// 1. SUPABASE AUTH INTEGRATION
// ==========================================

export async function supabaseSignIn(email: string, password: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Supabase is not configured." };

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { success: false, error: error?.message || "Failed to sign in." };
  }

  const meta = data.user.user_metadata || {};
  const user: User = {
    id: data.user.id,
    name: meta.name || data.user.email?.split("@")[0] || "User",
    email: data.user.email || email,
    avatarColor: meta.avatarColor || "#0D0D0C",
    monthlySalary: Number(meta.monthlySalary) || 25000,
    paydayDay: Number(meta.paydayDay) || 25,
    createdAt: data.user.created_at,
  };

  return { success: true, user, session: data.session };
}

export async function supabaseSignUp(
  name: string,
  email: string,
  password: string,
  monthlySalary?: number
) {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Supabase is not configured." };

  const avatarPalette = ["#0D0D0C", "#96CE96", "#F99654", "#ECD6E2", "#F6DE68"];
  const avatarColor =
    avatarPalette[Math.floor(Math.random() * avatarPalette.length)];

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name.trim(),
        monthlySalary: monthlySalary && monthlySalary > 0 ? monthlySalary : 25000,
        avatarColor,
        paydayDay: 25,
      },
    },
  });

  if (error || !data.user) {
    return { success: false, error: error?.message || "Failed to register." };
  }

  const user: User = {
    id: data.user.id,
    name: name.trim(),
    email: data.user.email || email,
    avatarColor,
    monthlySalary: monthlySalary && monthlySalary > 0 ? monthlySalary : 25000,
    paydayDay: 25,
    createdAt: data.user.created_at,
  };

  return { success: true, user, session: data.session };
}

export async function supabaseSignOut() {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getSupabaseCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const meta = session.user.user_metadata || {};
  return {
    id: session.user.id,
    name: meta.name || session.user.email?.split("@")[0] || "User",
    email: session.user.email || "",
    avatarColor: meta.avatarColor || "#0D0D0C",
    monthlySalary: Number(meta.monthlySalary) || 25000,
    paydayDay: Number(meta.paydayDay) || 25,
    createdAt: session.user.created_at,
  };
}

// ==========================================
// 2. TRANSACTIONS CRUD (Supabase: transactions)
// ==========================================

export async function fetchSupabaseTransactions(userId: string): Promise<Expense[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const effectiveUserId = await resolveAuthenticatedUserId(userId);
  if (!effectiveUserId) return [];

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", effectiveUserId)
    .order("date", { ascending: false });

  if (error || !data) {
    console.error("Error fetching transactions from Supabase:", error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    amount: Number(row.amount),
    categoryId: row.category,
    note: row.note || "",
    paymentMethod: (row.payment_method as PaymentMethod) || "Card",
    date: row.date,
    isRecurring: Boolean(row.is_recurring),
    createdAt: row.created_at,
  }));
}

export async function insertSupabaseTransaction(
  expense: Omit<Expense, "id"> & { id?: string },
  userId: string
): Promise<Expense | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const effectiveUserId = await resolveAuthenticatedUserId(userId);
  if (!effectiveUserId) return null;

  const payload: any = {
    id: expense.id ? toDeterministicUUID(expense.id) : undefined,
    user_id: effectiveUserId,
    amount: expense.amount,
    category: expense.categoryId,
    note: expense.note || "",
    payment_method: expense.paymentMethod || "Card",
    date: expense.date,
    is_recurring: Boolean(expense.isRecurring),
  };

  const { data, error } = await supabase
    .from("transactions")
    .upsert(payload)
    .select()
    .single();

  if (error || !data) {
    console.error("Error inserting transaction into Supabase:", error);
    return null;
  }

  return {
    id: data.id,
    amount: Number(data.amount),
    categoryId: data.category,
    note: data.note || "",
    paymentMethod: (data.payment_method as PaymentMethod) || "Card",
    date: data.date,
    isRecurring: Boolean(data.is_recurring),
    createdAt: data.created_at,
  };
}

export async function updateSupabaseTransaction(
  id: string,
  updates: Partial<Expense>,
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const effectiveUserId = await resolveAuthenticatedUserId(userId);
  if (!effectiveUserId) return false;

  const payload: any = {};
  if (updates.amount !== undefined) payload.amount = updates.amount;
  if (updates.categoryId !== undefined) payload.category = updates.categoryId;
  if (updates.note !== undefined) payload.note = updates.note;
  if (updates.paymentMethod !== undefined)
    payload.payment_method = updates.paymentMethod;
  if (updates.date !== undefined) payload.date = updates.date;
  if (updates.isRecurring !== undefined)
    payload.is_recurring = updates.isRecurring;

  const targetId = toDeterministicUUID(id);
  const { error } = await supabase
    .from("transactions")
    .update(payload)
    .eq("id", targetId)
    .eq("user_id", effectiveUserId);

  return !error;
}

export async function deleteSupabaseTransaction(
  id: string,
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const effectiveUserId = await resolveAuthenticatedUserId(userId);
  if (!effectiveUserId) return false;

  const targetId = toDeterministicUUID(id);
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", targetId)
    .eq("user_id", effectiveUserId);

  return !error;
}

// ==========================================
// 3. BUDGETS CRUD (Supabase: budgets)
// ==========================================

export async function fetchSupabaseBudgets(userId: string): Promise<Budget[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const effectiveUserId = await resolveAuthenticatedUserId(userId);
  if (!effectiveUserId) return [];

  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", effectiveUserId);

  if (error || !data) {
    console.error("Error fetching budgets from Supabase:", error);
    return [];
  }

  return data.map((row) => {
    const rawCats = (row.categories as Record<string, any>) || {};
    const meta = rawCats._meta || {};
    const cleanCats: Record<string, number> = {};
    for (const [k, v] of Object.entries(rawCats)) {
      if (k !== "_meta" && typeof v === "number") {
        cleanCats[k] = v;
      }
    }
    return {
      month: row.month,
      total: Number(row.total) || 0,
      categories: cleanCats,
      sortedCategories: Array.isArray(meta.sortedCategories) ? meta.sortedCategories : [],
      recurringCategories: Array.isArray(meta.recurringCategories) ? meta.recurringCategories : [],
      isTotalSorted: Boolean(meta.isTotalSorted),
    };
  });
}

export async function upsertSupabaseBudget(
  budget: Budget,
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const effectiveUserId = await resolveAuthenticatedUserId(userId);
  if (!effectiveUserId) return false;

  const categoriesWithMeta = {
    ...budget.categories,
    _meta: {
      sortedCategories: budget.sortedCategories || [],
      recurringCategories: budget.recurringCategories || [],
      isTotalSorted: Boolean(budget.isTotalSorted),
    },
  };

  const { data: existing } = await supabase
    .from("budgets")
    .select("id")
    .eq("user_id", effectiveUserId)
    .eq("month", budget.month)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("budgets")
      .update({
        total: budget.total,
        categories: categoriesWithMeta,
      })
      .eq("id", existing.id);
    return !error;
  } else {
    const { error } = await supabase.from("budgets").insert({
      user_id: effectiveUserId,
      month: budget.month,
      total: budget.total,
      categories: categoriesWithMeta,
    });
    return !error;
  }
}

// ==========================================
// 4. DEBIT ORDERS (Supabase: debit_orders)
// ==========================================

export interface SupabaseDebitOrder {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  due_day: number | null;
  is_cleared: boolean;
  month: string;
}

export async function fetchSupabaseDebitOrders(
  userId: string,
  month: string
): Promise<SupabaseDebitOrder[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const effectiveUserId = await resolveAuthenticatedUserId(userId);
  if (!effectiveUserId) return [];

  const { data, error } = await supabase
    .from("debit_orders")
    .select("*")
    .eq("user_id", effectiveUserId)
    .eq("month", month);

  if (error || !data) {
    console.error("Error fetching debit orders from Supabase:", error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    amount: Number(row.amount),
    due_day: row.due_day,
    is_cleared: Boolean(row.is_cleared),
    month: row.month,
  }));
}

export async function upsertSupabaseDebitOrder(
  debit: {
    id?: string;
    name: string;
    amount: number;
    due_day?: number;
    is_cleared?: boolean;
    month: string;
  },
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const effectiveUserId = await resolveAuthenticatedUserId(userId);
  if (!effectiveUserId) return false;

  const payload: any = {
    id: debit.id ? toDeterministicUUID(`${debit.month}:${debit.id}`) : undefined,
    user_id: effectiveUserId,
    name: debit.name,
    amount: debit.amount,
    due_day: debit.due_day || 1,
    is_cleared: Boolean(debit.is_cleared),
    month: debit.month,
  };

  const { error } = await supabase.from("debit_orders").upsert(payload);
  return !error;
}

export async function toggleSupabaseDebitOrderCleared(
  id: string,
  isCleared: boolean,
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const effectiveUserId = await resolveAuthenticatedUserId(userId);
  if (!effectiveUserId) return false;

  const { error } = await supabase
    .from("debit_orders")
    .update({ is_cleared: isCleared })
    .eq("id", toDeterministicUUID(id))
    .eq("user_id", effectiveUserId);

  return !error;
}

// ==========================================
// 5. DEBT CONTRACTS (Supabase: debt_contracts)
// ==========================================

export async function fetchSupabaseDebtContracts(
  userId: string
): Promise<DebtInstalment[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const effectiveUserId = await resolveAuthenticatedUserId(userId);
  if (!effectiveUserId) return [];

  const { data, error } = await supabase
    .from("debt_contracts")
    .select("*")
    .eq("user_id", effectiveUserId);

  if (error || !data) {
    console.error("Error fetching debt contracts from Supabase:", error);
    return [];
  }

  return data.map((row) => {
    const monthly = Number(row.monthly_instalment) || 0;
    const total = Number(row.total_amount) || 0;
    const remaining = Number(row.remaining_balance) || 0;
    const monthsLeft = Number(row.months_left) || 0;
    const paid = Math.max(0, total - remaining);
    const paidInstalments =
      monthly > 0 ? Math.round(paid / monthly) : 0;
    const totalInstalments =
      monthly > 0 ? Math.round(total / monthly) : monthsLeft;

    return {
      id: row.id,
      name: row.name,
      totalInstalments: Math.max(1, totalInstalments),
      paidInstalments,
      monthlyAmount: monthly,
      totalAmount: total,
      isPaidOff: remaining <= 0,
      categoryId: "cat-debt",
    };
  });
}

export async function upsertSupabaseDebtContract(
  debt: DebtInstalment,
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const effectiveUserId = await resolveAuthenticatedUserId(userId);
  if (!effectiveUserId) return false;

  const remaining = Math.max(
    0,
    (debt.totalAmount || 0) - debt.paidInstalments * debt.monthlyAmount
  );
  const monthsLeft = Math.max(0, debt.totalInstalments - debt.paidInstalments);

  const payload: any = {
    id: debt.id ? toDeterministicUUID(debt.id) : undefined,
    user_id: effectiveUserId,
    name: debt.name,
    total_amount: debt.totalAmount || debt.monthlyAmount * debt.totalInstalments,
    monthly_instalment: debt.monthlyAmount,
    remaining_balance: remaining,
    months_left: monthsLeft,
  };

  const { error } = await supabase.from("debt_contracts").upsert(payload);
  return !error;
}

export async function deleteSupabaseDebtContract(
  id: string,
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const effectiveUserId = await resolveAuthenticatedUserId(userId);
  if (!effectiveUserId) return false;

  const { error } = await supabase
    .from("debt_contracts")
    .delete()
    .eq("id", toDeterministicUUID(id))
    .eq("user_id", effectiveUserId);

  return !error;
}

// ==========================================
// 6. BULK LOCAL-TO-CLOUD DATA PUSH
// ==========================================

export async function pushLocalDataToSupabase(
  data: {
    expenses: Expense[];
    budgets: Budget[];
    debts: DebtInstalment[];
  },
  userId: string
): Promise<{ success: boolean; pushedCount: number; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase)
    return { success: false, pushedCount: 0, error: "Supabase not configured" };

  const effectiveUserId = await resolveAuthenticatedUserId(userId);
  if (!effectiveUserId) {
    return {
      success: false,
      pushedCount: 0,
      error: "No active Supabase Auth session found. Please sign out and sign in again to connect your cloud session.",
    };
  }

  try {
    let count = 0;
    const errors: string[] = [];

    // 1. Transactions
    if (data.expenses && data.expenses.length > 0) {
      const txRows = data.expenses.map((e) => ({
        id: toDeterministicUUID(e.id),
        user_id: effectiveUserId,
        amount: e.amount,
        category: e.categoryId,
        note: e.note || "",
        payment_method: e.paymentMethod || "Card",
        date: e.date,
        is_recurring: Boolean(e.isRecurring),
      }));
      const { error: txErr } = await supabase.from("transactions").upsert(txRows as any);
      if (!txErr) {
        count += txRows.length;
      } else {
        errors.push(`transactions: ${txErr.message}`);
      }
    }

    // 2. Budgets (use upsertSupabaseBudget per month to avoid missing primary key conflict)
    if (data.budgets && data.budgets.length > 0) {
      for (const b of data.budgets) {
        const ok = await upsertSupabaseBudget(b, effectiveUserId);
        if (ok) count += 1;
      }
    }

    // 3. Debts
    if (data.debts && data.debts.length > 0) {
      const debtRows = data.debts.map((d) => ({
        id: toDeterministicUUID(d.id),
        user_id: effectiveUserId,
        name: d.name,
        total_amount: d.totalAmount || d.monthlyAmount * d.totalInstalments,
        monthly_instalment: d.monthlyAmount,
        remaining_balance: Math.max(0, (d.totalAmount || 0) - d.paidInstalments * d.monthlyAmount),
        months_left: Math.max(0, d.totalInstalments - d.paidInstalments),
      }));
      const { error: debtErr } = await supabase.from("debt_contracts").upsert(debtRows as any);
      if (!debtErr) {
        count += debtRows.length;
      } else {
        errors.push(`debt_contracts: ${debtErr.message}`);
      }
    }

    if (errors.length > 0 && count === 0) {
      return { success: false, pushedCount: 0, error: errors.join("; ") };
    }

    return { success: true, pushedCount: count };
  } catch (err: any) {
    return { success: false, pushedCount: 0, error: err?.message || "Failed to push" };
  }
}
