import { useExpenseStore } from "./useExpenseStore";
import { Expense } from "@/types";

export interface TransactionStoreSlice {
  transactions: Expense[];
  expenses: Expense[];
  editingExpense: Expense | null;
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  setEditingExpense: (expense: Expense | null) => void;
}

export const useTransactionStore = <T>(
  selector: (state: TransactionStoreSlice) => T
): T => {
  return useExpenseStore((state) => {
    const slice: TransactionStoreSlice = {
      transactions: state.expenses,
      expenses: state.expenses,
      editingExpense: state.editingExpense,
      addExpense: state.addExpense,
      updateExpense: state.updateExpense,
      deleteExpense: state.deleteExpense,
      setEditingExpense: state.setEditingExpense,
    };
    return selector(slice);
  });
};

