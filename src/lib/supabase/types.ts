export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          category: string;
          note: string | null;
          payment_method: string | null;
          date: string;
          is_recurring: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          category: string;
          note?: string | null;
          payment_method?: string | null;
          date?: string;
          is_recurring?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          category?: string;
          note?: string | null;
          payment_method?: string | null;
          date?: string;
          is_recurring?: boolean;
          created_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          month: string;
          total: number | null;
          categories: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          month: string;
          total?: number | null;
          categories?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          month?: string;
          total?: number | null;
          categories?: Json | null;
          created_at?: string;
        };
      };
      debit_orders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount: number;
          due_day: number | null;
          is_cleared: boolean;
          month: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          amount: number;
          due_day?: number | null;
          is_cleared?: boolean;
          month: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          amount?: number;
          due_day?: number | null;
          is_cleared?: boolean;
          month?: string;
        };
      };
      debt_contracts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          total_amount: number | null;
          monthly_instalment: number | null;
          remaining_balance: number | null;
          months_left: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          total_amount?: number | null;
          monthly_instalment?: number | null;
          remaining_balance?: number | null;
          months_left?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          total_amount?: number | null;
          monthly_instalment?: number | null;
          remaining_balance?: number | null;
          months_left?: number | null;
        };
      };
      password_resets: {
        Row: {
          id: string;
          email: string;
          otp_hash: string;
          expires_at: string;
          used: boolean;
        };
        Insert: {
          id?: string;
          email: string;
          otp_hash: string;
          expires_at: string;
          used?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          otp_hash?: string;
          expires_at?: string;
          used?: boolean;
        };
      };
    };
  };
}
