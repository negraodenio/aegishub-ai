import { createClient } from "@supabase/supabase-js";
import type { Database } from "./generated.types";

const supabaseUrl = process.env["SUPABASE_URL"] || process.env["NEXT_PUBLIC_SUPABASE_URL"] || "";
const supabaseAnonKey = process.env["SUPABASE_ANON_KEY"] || process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] || "";
const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] || "";

// Only throw in production or if it's really missing during a request
if (!supabaseUrl && typeof window === "undefined") {
  console.warn("⚠️ SUPABASE_URL is missing in environment variables.");
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null as any;

export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey)
  : supabase; // Fallback to public client if admin key is missing
