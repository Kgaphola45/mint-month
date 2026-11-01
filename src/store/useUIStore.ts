import { useExpenseStore } from "./useExpenseStore";
import { User, LoginInput, RegisterInput } from "@/types";

export interface UIStoreSlice {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  currency: string;
  setCurrency: (code: string) => void;
  isLoaded: boolean;
  quickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  budgetModalOpen: boolean;
  setBudgetModalOpen: (open: boolean) => void;
  debtModalOpen: boolean;
  setDebtModalOpen: (open: boolean) => void;
  paydayModalOpen: boolean;
  setPaydayModalOpen: (open: boolean) => void;
  simulatorModalOpen: boolean;
  setSimulatorModalOpen: (open: boolean) => void;
  storyModalOpen: boolean;
  setStoryModalOpen: (open: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  digestModalOpen: boolean;
  setDigestModalOpen: (open: boolean) => void;
  authModalOpen: boolean;
  authModalMode: "login" | "register";
  setAuthModalOpen: (open: boolean, mode?: "login" | "register") => void;
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  register: (input: RegisterInput) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  logout: () => void;
  deleteAccount: (userId?: string) => Promise<{ success: boolean; error?: string }>;
}

export const useUIStore = <T>(selector: (state: UIStoreSlice) => T): T => {
  return useExpenseStore((state) => {
    const slice: UIStoreSlice = {
      selectedMonth: state.selectedMonth,
      setSelectedMonth: state.setSelectedMonth,
      goToPreviousMonth: state.goToPreviousMonth,
      goToNextMonth: state.goToNextMonth,
      currency: state.currency,
      setCurrency: state.setCurrency,
      isLoaded: state.isLoaded,
      quickAddOpen: state.quickAddOpen,
      setQuickAddOpen: state.setQuickAddOpen,
      budgetModalOpen: state.budgetModalOpen,
      setBudgetModalOpen: state.setBudgetModalOpen,
      debtModalOpen: state.debtModalOpen,
      setDebtModalOpen: state.setDebtModalOpen,
      paydayModalOpen: state.paydayModalOpen,
      setPaydayModalOpen: state.setPaydayModalOpen,
      simulatorModalOpen: state.simulatorModalOpen,
      setSimulatorModalOpen: state.setSimulatorModalOpen,
      storyModalOpen: state.storyModalOpen,
      setStoryModalOpen: state.setStoryModalOpen,
      commandPaletteOpen: state.commandPaletteOpen,
      setCommandPaletteOpen: state.setCommandPaletteOpen,
      digestModalOpen: state.digestModalOpen,
      setDigestModalOpen: state.setDigestModalOpen,
      authModalOpen: state.authModalOpen,
      authModalMode: state.authModalMode,
      setAuthModalOpen: state.setAuthModalOpen,
      currentUser: state.currentUser,
      isAuthenticated: state.isAuthenticated,
      login: state.login,
      register: state.register,
      logout: state.logout,
      deleteAccount: state.deleteAccount,
    };
    return selector(slice);
  });
};
