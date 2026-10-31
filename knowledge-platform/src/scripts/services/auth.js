/* ==========================================================================
   Auth wrapper — Supabase Auth (optional; public content works without login)
   ========================================================================== */

import { getSupabase } from "./supabase.js";
import { queueAccountSync } from "./cloud-sync.js";

let currentUser = null;
const listeners = new Set();

export function getUser() {
  return currentUser;
}

export function onAuthChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify() {
  listeners.forEach((cb) => cb(currentUser));
}

export async function initAuth() {
  const sb = getSupabase();
  if (!sb) return null;

  // Restore existing session
  const { data, error } = await sb.auth.getSession();
  if (error) throw error;
  currentUser = data.session?.user ?? null;
  notify();
  if (currentUser) queueAccountSync(currentUser);

  // Listen for auth changes
  sb.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user ?? null;
    notify();
    if (currentUser) queueAccountSync(currentUser);
    const btn = document.getElementById("auth-btn");
    if (btn) btn.textContent = currentUser ? "Profil" : "Masuk";
  });

  return currentUser;
}

export async function signInWithPassword(email, password) {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase tidak dikonfigurasi.");
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  currentUser = data.session?.user ?? null;
  notify();
  if (currentUser) queueAccountSync(currentUser);
  return data;
}

export async function signUp(email, password) {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase tidak dikonfigurasi.");
  const baseUrl = import.meta.env.BASE_URL || "/";
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost";
  const emailRedirectTo = new URL(baseUrl, origin).href;
  const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo } });
  if (error) throw error;
  currentUser = data.session?.user ?? null;
  notify();
  if (currentUser) queueAccountSync(currentUser);
  return data;
}

export async function signOut() {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.auth.signOut();
  if (error) throw error;
  currentUser = null;
  notify();
}

export function isAuthenticated() {
  return !!currentUser;
}