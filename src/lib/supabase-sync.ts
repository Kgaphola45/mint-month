import { getSupabaseClient, isSupabaseConfigured } from "./supabase/client";
import { Expense, Budget, DebtInstalment, PaymentMethod, User } from "@/types";

// Helper to check if a string is a valid UUID
export function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    str
  );
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

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
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

  const payload: any = {
    user_id: userId,
    amount: expense.amount,
    category: expense.categoryId,
    note: expense.note || "",
    payment_method: expense.paymentMethod || "Card",
    date: expense.date,
    is_recurring: Boolean(expense.isRecurring),
  };

  // If already a valid UUID, preserve it
  if (expense.id && isUUID(expense.id)) {
    payload.id = expense.id;
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert(payload)
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

  const payload: any = {};
  if (updates.amount !== undefined) payload.amount = updates.amount;
  if (updates.categoryId !== undefined) payload.category = updates.categoryId;
  if (updates.note !== undefined) payload.note = updates.note;
  if (updates.paymentMethod !== undefined)
    payload.payment_method = updates.paymentMethod;
  if (updates.date !== undefined) payload.date = updates.date;
  if (updates.isRecurring !== undefined)
    payload.is_recurring = updates.isRecurring;

  const { error } = await supabase
    .from("transactions")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId);

  return !error;
}

export async function deleteSupabaseTransaction(
  id: string,
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  return !error;
}

// ==========================================
// 3. BUDGETS CRUD (Supabase: budgets)
// ==========================================

export async function fetchSupabaseBudgets(userId: string): Promise<Budget[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", userId);

  if (error || !data) {
    console.error("Error fetching budgets from Supabase:", error);
    return [];
  }

  return data.map((row) => ({
    month: row.month,
    total: Number(row.total) || 0,
    categories: (row.categories as Record<string, number>) || {},
  }));
}

export async function upsertSupabaseBudget(
  budget: Budget,
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  // Check if budget exists for month
  const { data: existing } = await supabase
    .from("budgets")
    .select("id")
    .eq("user_id", userId)
    .eq("month", budget.month)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("budgets")
      .update({
        total: budget.total,
        categories: budget.categories as any,
      })
      .eq("id", existing.id);
    return !error;
  } else {
    const { error } = await supabase.from("budgets").insert({
      user_id: userId,
      month: budget.month,
      total: budget.total,
      categories: budget.categories as any,
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

  const { data, error } = await supabase
    .from("debit_orders")
    .select("*")
    .eq("user_id", userId)
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

  const payload: any = {
    user_id: userId,
    name: debit.name,
    amount: debit.amount,
    due_day: debit.due_day || 1,
    is_cleared: Boolean(debit.is_cleared),
    month: debit.month,
  };

  if (debit.id && isUUID(debit.id)) {
    payload.id = debit.id;
  }

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

  const { error } = await supabase
    .from("debit_orders")
    .update({ is_cleared: isCleared })
    .eq("id", id)
    .eq("user_id", userId);

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

  const { data, error } = await supabase
    .from("debt_contracts")
    .select("*")
    .eq("user_id", userId);

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

  const remaining = Math.max(
    0,
    (debt.totalAmount || 0) - debt.paidInstalments * debt.monthlyAmount
  );
  const monthsLeft = Math.max(0, debt.totalInstalments - debt.paidInstalments);

  const payload: any = {
    user_id: userId,
    name: debt.name,
    total_amount: debt.totalAmount || debt.monthlyAmount * debt.totalInstalments,
    monthly_instalment: debt.monthlyAmount,
    remaining_balance: remaining,
    months_left: monthsLeft,
  };

  if (debt.id && isUUID(debt.id)) {
    payload.id = debt.id;
  }

  const { error } = await supabase.from("debt_contracts").upsert(payload);
  return !error;
}

export async function deleteSupabaseDebtContract(
  id: string,
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("debt_contracts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

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

  try {
    let count = 0;
    // 1. Transactions
    if (data.expenses && data.expenses.length > 0) {
      const txRows = data.expenses.map((e) => ({
        id: isUUID(e.id) ? e.id : undefined,
        user_id: userId,
        amount: e.amount,
        category: e.categoryId,
        note: e.note || "",
        payment_method: e.paymentMethod || "Card",
        date: e.date,
        is_recurring: Boolean(e.isRecurring),
      }));
      const { error: txErr } = await supabase.from("transactions").upsert(txRows as any);
      if (!txErr) count += txRows.length;
    }

    // 2. Budgets
    if (data.budgets && data.budgets.length > 0) {
      const budgetRows = data.budgets.map((b) => ({
        user_id: userId,
        month: b.month,
        total: b.total,
        categories: b.categories as any,
      }));
      const { error: bgErr } = await supabase.from("budgets").upsert(budgetRows as any);
      if (!bgErr) count += budgetRows.length;
    }

    // 3. Debts
    if (data.debts && data.debts.length > 0) {
      const debtRows = data.debts.map((d) => ({
        id: isUUID(d.id) ? d.id : undefined,
        user_id: userId,
        name: d.name,
        total_amount: d.totalAmount || d.monthlyAmount * d.totalInstalments,
        monthly_instalment: d.monthlyAmount,
        remaining_balance: Math.max(0, (d.totalAmount || 0) - d.paidInstalments * d.monthlyAmount),
        months_left: Math.max(0, d.totalInstalments - d.paidInstalments),
      }));
      const { error: debtErr } = await supabase.from("debt_contracts").upsert(debtRows as any);
      if (!debtErr) count += debtRows.length;
    }

    return { success: true, pushedCount: count };
  } catch (err: any) {
    return { success: false, pushedCount: 0, error: err?.message || "Failed to push" };
  }
}
