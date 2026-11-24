import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./types";

const DEFAULT_SUPABASE_URL = "https://qzxkoefqnjxghsmpyqil.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_GfPNQwI-AJxTt6RNEkTkPA_MTS4dcPo";

function resolveSupabaseUrl(): string {
  const envUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  if (
    envUrl &&
    !envUrl.includes("your-project") &&
    !envUrl.includes("[YOUR_PROJECT_REF]")
  ) {
    return envUrl;
  }
  return DEFAULT_SUPABASE_URL;
}

function resolveSupabaseAnonKey(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  ];
  for (const key of candidates) {
    const trimmed = (key || "").trim();
    if (trimmed && !trimmed.includes("your_publishable_key")) {
      return trimmed;
    }
  }
  return DEFAULT_SUPABASE_PUBLISHABLE_KEY;
}

const supabaseUrl = resolveSupabaseUrl();
const supabaseAnonKey = resolveSupabaseAnonKey();
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes("your-project") &&
    !supabaseUrl.includes("[YOUR_PROJECT_REF]") &&
    !supabaseAnonKey.includes("your_publishable_key")
  );
};

let clientInstance: SupabaseClient<Database> | null = null;

export const getSupabaseClient = (): SupabaseClient<Database> | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return clientInstance;
};

// Admin client for server-side trusted operations (e.g. password resets, background tasks)
export const getSupabaseAdminClient = (): SupabaseClient<Database> | null => {
  if (
    !supabaseUrl ||
    !supabaseServiceKey ||
    supabaseUrl.includes("your-project") ||
    supabaseServiceKey.includes("your_secret_key")
  ) {
    return null;
  }
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
