import { Expense, Budget } from "@/types";

export function generateSeedData(): {
  expenses: Expense[];
  budgets: Budget[];
} {
  return {
    expenses: [],
    budgets: [],
  };
}
