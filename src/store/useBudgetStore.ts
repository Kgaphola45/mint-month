import { useExpenseStore } from "./useExpenseStore";
import { Budget, DebtInstalment, SafeToSpendSummary, MonthSummary } from "@/types";

export interface BudgetStoreSlice {
  budgets: Budget[];
  recurringBudgets: Record<string, number>;
  clearedRecurring: Record<string, boolean>;
  debts: DebtInstalment[];
  incomes: Record<string, number>;
  paydayDay: number;
  editingDebt: DebtInstalment | null;
  setBudget: (budget: Budget) => void;
  updateTotalBudget: (month: string, total: number) => void;
  updateCategoryBudget: (month: string, categoryId: string, amount: number) => void;
  toggleCategorySorted: (month: string, categoryId: string) => void;
  toggleCategoryRecurring: (month: string, categoryId: string, amount?: number) => void;
  addDebt: (debt: Omit<DebtInstalment, "id">) => void;
  updateDebt: (id: string, updates: Partial<DebtInstalment>) => void;
  deleteDebt: (id: string) => void;
  setMonthIncome: (month: string, amount: number) => void;
  setDefaultIncome: (amount: number) => void;
  setPaydayDay: (day: number) => void;
  getMonthSummary: (month?: string) => MonthSummary;
  getSafeToSpend: (month?: string) => SafeToSpendSummary;
}

export const useBudgetStore = <T>(
  selector: (state: BudgetStoreSlice) => T
): T => {
  return useExpenseStore((state) => {
    const slice: BudgetStoreSlice = {
      budgets: state.budgets,
      recurringBudgets: state.recurringBudgets,
      clearedRecurring: state.clearedRecurring,
      debts: state.debts,
      incomes: state.incomes,
      paydayDay: state.paydayDay,
      editingDebt: state.editingDebt,
      setBudget: state.setBudget,
      updateTotalBudget: state.updateTotalBudget,
      updateCategoryBudget: state.updateCategoryBudget,
      toggleCategorySorted: state.toggleCategorySorted,
      toggleCategoryRecurring: state.toggleCategoryRecurring,
      addDebt: state.addDebt,
      updateDebt: state.updateDebt,
      deleteDebt: state.deleteDebt,
      setMonthIncome: state.setMonthIncome,
      setDefaultIncome: state.setDefaultIncome,
      setPaydayDay: state.setPaydayDay,
      getMonthSummary: state.getMonthSummary,
      getSafeToSpend: state.getSafeToSpend,
    };
    return selector(slice);
  });
};
