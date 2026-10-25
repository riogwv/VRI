/* ==========================================================================
   Supabase client — singleton, env-driven
   ========================================================================== */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

let client = null;

export function getSupabase() {
  if (client) return client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn(
      "[Supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set. Auth and social features will be disabled."
    );
    return null;
  }

  client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return client;
}

export function supabaseReady() {
  return getSupabase() !== null;
}