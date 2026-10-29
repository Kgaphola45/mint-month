import { Category, PaymentMethod } from "@/types";

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "cat-subscriptions",
    name: "Subscriptions",
    color: "#8b5cf6", // Purple (Apple Music, iCloud, Takealot)
    icon: "Tv",
  },
  {
    id: "cat-debt",
    name: "Debt & Contracts",
    color: "#ef4444", // Red (Phone contract, Laptop contract, PayJust Now)
    icon: "CreditCard",
  },
  {
    id: "cat-airtime-data",
    name: "Airtime & Data",
    color: "#06b6d4", // Cyan (VOX data, Voice bundles, Airtime)
    icon: "Wifi",
  },
  {
    id: "cat-groceries",
    name: "Groceries",
    color: "#10b981", // Mint / Emerald
    icon: "Apple",
  },
  {
    id: "cat-transport",
    name: "Transport",
    color: "#3b82f6", // Blue
    icon: "Car",
  },
  {
    id: "cat-personal-care",
    name: "Personal Care",
    color: "#ec4899", // Pink (Hair styling, Her expenses)
    icon: "Sparkles",
  },
  {
    id: "cat-clothing",
    name: "Clothing",
    color: "#f59e0b", // Amber (TFG account, retail)
    icon: "Shirt",
  },
  {
    id: "cat-food",
    name: "Food & Dining",
    color: "#f97316", // Orange
    icon: "Utensils",
  },
  {
    id: "cat-other",
    name: "Other",
    color: "#64748b", // Slate
    icon: "MoreHorizontal",
  },
];

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: "Card", label: "Card", icon: "CreditCard" },
  { id: "Bank", label: "EFT / Bank", icon: "Building2" },
  { id: "Instant EFT", label: "PayShap / Instant", icon: "Zap" },
  { id: "Cash", label: "Cash", icon: "Banknote" },
];

export const AVAILABLE_ICONS = [
  "Tv",
  "CreditCard",
  "Wifi",
  "Smartphone",
  "Apple",
  "Car",
  "Sparkles",
  "Scissors",
  "Shirt",
  "ShoppingBag",
  "Receipt",
  "Home",
  "HeartPulse",
  "Film",
  "Coffee",
  "Dumbbell",
  "Plane",
  "Book",
  "Gift",
  "Laptop",
  "Music",
  "Fuel",
  "Utensils",
  "MoreHorizontal",
];

export const AVAILABLE_COLORS = [
  "#8b5cf6", // Purple
  "#ef4444", // Red
  "#06b6d4", // Cyan
  "#10b981", // Emerald / Mint
  "#3b82f6", // Blue
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#f97316", // Orange
  "#14b8a6", // Teal
  "#6366f1", // Indigo
  "#a855f7", // Violet
  "#f43f5e", // Rose
  "#84cc16", // Lime
  "#64748b", // Slate
];
