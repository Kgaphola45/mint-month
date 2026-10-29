import { CurrencyConfig } from "@/types";

export const CURRENCIES: Record<string, CurrencyConfig> = {
  ZAR: {
    code: "ZAR",
    symbol: "R",
    name: "South African Rand",
    locale: "en-ZA",
  },
};

export const DEFAULT_CURRENCY = "ZAR";
