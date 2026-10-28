import { getSupabase } from "./supabase.js";
import { getBookmarks, setBookmarks } from "./bookmarks.js";
import { getPlayerProgress, replacePlayerProgress } from "./player-progress.js";
import { clearGameProgress, getGameProgress, replaceGameProgress } from "./game-progress.js";

const ACCOUNT_KEY = "kh_sync_account_v1";
const GAMES = ["chess", "sudoku", "crossword"];
let queued = false;

function marker() { try { return localStorage.getItem(ACCOUNT_KEY); } catch { return null; } }
function mark(userId) { try { localStorage.setItem(ACCOUNT_KEY, userId); } catch { /* Storage is optional. */ } }
function count(value) { return Number.isInteger(value) && value >= 0 ? value : 0; }
function day(value) { return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null; }

export function mergeBookmarks(local, cloud) {
  const unique = new Map();
  [...(Array.isArray(cloud) ? cloud : []), ...(Array.isArray(local) ? local : [])].forEach((item) => {
    if (item?.id && !unique.has(item.id)) unique.set(item.id, item);
  });
  return [...unique.values()].slice(0, 100);
}

export function mergeProgress(local = {}, cloud = {}) {
  const games = {};
  GAMES.forEach((game) => {
    const a = local.games?.[game] || {}, b = cloud.games?.[game] || {};
    games[game] = {
      played: Math.max(count(a.played), count(b.played)),
      completed: Math.max(count(a.completed), count(b.completed)),
      lastCompletionSession: a.lastCompletionSession || b.lastCompletionSession || null,
    };
  });
  const localDay = day(local.streak?.lastActiveDay), cloudDay = day(cloud.streak?.lastActiveDay);
  const current = localDay && (!cloudDay || localDay >= cloudDay) ? count(local.streak?.current) : count(cloud.streak?.current);
  return {
    ...local,
    games,
    streak: { current, longest: Math.max(count(local.streak?.longest), count(cloud.streak?.longest)), lastActiveDay: localDay && (!cloudDay || localDay >= cloudDay) ? localDay : cloudDay },
    recentContent: mergeHistory(local.recentContent, cloud.recentContent, "id"),
    recentNews: mergeHistory(local.recentNews, cloud.recentNews, "url"),
    categoryAffinity: mergeAffinity(local.categoryAffinity, cloud.categoryAffinity),
  };
}

function mergeHistory(a, b, key) {
  const seen = new Set();
  return [...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])].filter((item) => item?.[key] && !seen.has(item[key]) && seen.add(item[key])).slice(0, 12);
}
function mergeAffinity(a = {}, b = {}) {
  return Object.fromEntries(new Set([...Object.keys(a), ...Object.keys(b)]).values().map((key) => [key, Math.min(20, Math.max(count(a[key]), count(b[key])))]).filter(([, value]) => value));
}

export function mergeGameProgress(local = {}, cloud = {}) {
  const daily = { ...(cloud.daily || {}), ...(local.daily || {}) };
  Object.keys(daily).forEach((key) => { if (daily[key]?.status !== "completed" && cloud.daily?.[key]?.status === "completed") daily[key] = cloud.daily[key]; });
  const sudokuBest = {};
  ["easy", "medium", "hard"].forEach((difficulty) => {
    const values = [local.sudokuBest?.[difficulty], cloud.sudokuBest?.[difficulty]].filter((value) => Number.isInteger(value) && value >= 0);
    sudokuBest[difficulty] = values.length ? Math.min(...values) : null;
  });
  return { ...local, daily: Object.fromEntries(Object.entries(daily).slice(-31)), sudokuBest };
}

function cloudBookmark(row) {
  return { id: row.content_id, title: row.title || row.content_id, category: row.category || "", summary: "", url: `#/article/${row.content_id}` };
}
function bookmarkRow(userId, item) { return { user_id: userId, content_type: "article", content_id: item.id, title: item.title || item.id, category: item.category || null, source: "VRI" }; }

export async function syncAccount(user) {
  const sb = getSupabase();
  if (!sb?.from || !user?.id) return false;
  const [marksResult, progressResult] = await Promise.all([
    sb.from("bookmarks").select("content_id,title,category").eq("user_id", user.id).eq("content_type", "article"),
    sb.from("player_progress").select("state").eq("user_id", user.id).maybeSingle(),
  ]);
  if (marksResult.error || progressResult.error) return false;
  const foreignAccount = !!marker() && marker() !== user.id;
  const localMarks = foreignAccount ? [] : getBookmarks();
  const localProgress = foreignAccount ? {} : getPlayerProgress();
  const localGame = foreignAccount ? {} : getGameProgress();
  const marks = mergeBookmarks(localMarks, (marksResult.data || []).map(cloudBookmark));
  const progress = mergeProgress(localProgress, progressResult.data?.state?.player || {});
  const game = mergeGameProgress(localGame, progressResult.data?.state?.game || {});
  const writes = [
    sb.from("profiles").upsert({ id: user.id }, { onConflict: "id", ignoreDuplicates: true }),
    sb.from("player_progress").upsert({ user_id: user.id, state: { player: progress, game }, updated_at: new Date().toISOString() }, { onConflict: "user_id" }),
    ...marks.map((item) => sb.from("bookmarks").upsert(bookmarkRow(user.id, item), { onConflict: "user_id,content_type,content_id", ignoreDuplicates: true })),
  ];
  const writesResult = await Promise.all(writes);
  if (writesResult.some((result) => result.error)) return false;
  if (foreignAccount) clearGameProgress();
  setBookmarks(marks);
  replacePlayerProgress(progress);
  replaceGameProgress(game);
  mark(user.id);
  return true;
}

export async function syncBookmark(item) {
  const sb = getSupabase();
  if (!sb?.from || !sb.auth) return false;
  const { data, error } = await sb.auth.getUser();
  if (error || !data.user) return false;
  const request = item
    ? sb.from("bookmarks").upsert(bookmarkRow(data.user.id, item), { onConflict: "user_id,content_type,content_id" })
    : null;
  if (!request) return false;
  const result = await request;
  return !result.error;
}

export async function removeCloudBookmark(id) {
  const sb = getSupabase();
  if (!sb?.from || !sb.auth) return false;
  const { data, error } = await sb.auth.getUser();
  if (error || !data.user) return false;
  const result = await sb.from("bookmarks").delete().eq("user_id", data.user.id).eq("content_type", "article").eq("content_id", id);
  return !result.error;
}

export function queueAccountSync(user = null) {
  if (queued) return;
  queued = true;
  queueMicrotask(async () => {
    queued = false;
    if (user) { await syncAccount(user); return; }
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb.auth.getUser();
    if (data?.user) await syncAccount(data.user);
  });
}

export async function getProfile(user) {
  const sb = getSupabase();
  if (!sb?.from || !user?.id) return null;
  const { data, error } = await sb.from("profiles").select("username,full_name,bio,avatar_url,created_at").eq("id", user.id).maybeSingle();
  return error ? null : data;
}

export async function saveProfile(user, fields) {
  const sb = getSupabase();
  if (!sb?.from || !user?.id) throw new Error("Sinkronisasi akun tidak tersedia.");
  const payload = { id: user.id, full_name: fields.full_name?.trim() || null, username: fields.username?.trim() || null, bio: fields.bio?.trim() || null, avatar_url: fields.avatar_url?.trim() || null, updated_at: new Date().toISOString() };
  const { error } = await sb.from("profiles").upsert(payload, { onConflict: "id" });
  if (error) throw error;
}
