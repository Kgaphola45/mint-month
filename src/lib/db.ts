import { openDB, DBSchema, IDBPDatabase } from "idb";
import { Expense } from "@/types";

/**
 * Supabase Index for query acceleration:
 *
 * -- Run in Supabase SQL Editor:
 * CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
 * CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month);
 */

interface MintMonthDB extends DBSchema {
  transactions: {
    key: string;
    value: Expense;
    indexes: {
      "by-date": string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<MintMonthDB>> | null = null;

export function getIDB(): Promise<IDBPDatabase<MintMonthDB>> | null {
  if (typeof window === "undefined") return null;

  if (!dbPromise) {
    dbPromise = openDB<MintMonthDB>("mint-month", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("transactions")) {
          const store = db.createObjectStore("transactions", { keyPath: "id" });
          store.createIndex("by-date", "date");
        }
      },
    });
  }
  return dbPromise;
}

export async function getCachedTransactions(): Promise<Expense[]> {
  try {
    const db = getIDB();
    if (!db) return [];
    const client = await db;
    return await client.getAll("transactions");
  } catch (err) {
    console.warn("IndexedDB read failed:", err);
    return [];
  }
}

export async function saveCachedTransactions(txs: Expense[]): Promise<void> {
  try {
    const db = getIDB();
    if (!db) return;
    const client = await db;
    const tx = client.transaction("transactions", "readwrite");
    await tx.store.clear();
    for (const item of txs) {
      await tx.store.put(item);
    }
    await tx.done;
  } catch (err) {
    console.warn("IndexedDB batch save failed:", err);
  }
}

export async function putCachedTransaction(expense: Expense): Promise<void> {
  try {
    const db = getIDB();
    if (!db) return;
    const client = await db;
    await client.put("transactions", expense);
  } catch (err) {
    console.warn("IndexedDB put failed:", err);
  }
}

export async function deleteCachedTransaction(id: string): Promise<void> {
  try {
    const db = getIDB();
    if (!db) return;
    const client = await db;
    await client.delete("transactions", id);
  } catch (err) {
    console.warn("IndexedDB delete failed:", err);
  }
}

export async function clearCachedTransactions(): Promise<void> {
  try {
    const db = getIDB();
    if (!db) return;
    const client = await db;
    await client.clear("transactions");
  } catch (err) {
    console.warn("IndexedDB clear failed:", err);
  }
}

