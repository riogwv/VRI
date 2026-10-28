const STORAGE_KEY = "kh_player_progress_v1";
const VERSION = 1;
const HISTORY_LIMIT = 12;
const GAMES = ["chess", "sudoku", "crossword"];

function defaults() {
  return {
    version: VERSION,
    recentContent: [],
    recentNews: [],
    categoryAffinity: {},
    streak: { current: 0, longest: 0, lastActiveDay: null },
    games: Object.fromEntries(GAMES.map((game) => [game, { played: 0, completed: 0, lastCompletionSession: null }])),
  };
}

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults();
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || value.version !== VERSION) return defaults();
    const state = defaults();
    state.recentContent = sanitizeRecent(value.recentContent, "id");
    state.recentNews = sanitizeRecent(value.recentNews, "url");
    state.categoryAffinity = sanitizeAffinity(value.categoryAffinity);
    state.streak = sanitizeStreak(value.streak);
    GAMES.forEach((game) => {
      const source = value.games?.[game];
      state.games[game] = {
        played: safeCount(source?.played),
        completed: safeCount(source?.completed),
        lastCompletionSession: typeof source?.lastCompletionSession === "string" ? source.lastCompletionSession : null,
      };
    });
    return state;
  } catch {
    return defaults();
  }
}

function write(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Local features remain optional. */ }
  return state;
}

function sanitizeRecent(value, key) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.filter((item) => {
    if (!item || typeof item !== "object" || typeof item[key] !== "string" || seen.has(item[key])) return false;
    seen.add(item[key]);
    return true;
  }).slice(0, HISTORY_LIMIT);
}

function sanitizeAffinity(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value)
    .filter(([key, count]) => typeof key === "string" && safeCount(count) > 0)
    .map(([key, count]) => [key, Math.min(safeCount(count), 20)]));
}

function validDay(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, date] = value.split("-").map(Number);
  const candidate = new Date(year, month - 1, date);
  return candidate.getFullYear() === year && candidate.getMonth() === month - 1 && candidate.getDate() === date;
}

function sanitizeStreak(value) {
  return {
    current: safeCount(value?.current),
    longest: safeCount(value?.longest),
    lastActiveDay: validDay(value?.lastActiveDay) ? value.lastActiveDay : null,
  };
}

function safeCount(value) {
  return Number.isInteger(value) && value > 0 ? value : 0;
}

export function calendarDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function previousDay(day) {
  const [year, month, date] = day.split("-").map(Number);
  return calendarDay(new Date(year, month - 1, date - 1));
}

function recordDay(state, day) {
  const streak = state.streak;
  if (streak.lastActiveDay === day) return;
  streak.current = streak.lastActiveDay === previousDay(day) ? streak.current + 1 : 1;
  streak.longest = Math.max(streak.longest, streak.current);
  streak.lastActiveDay = day;
}

function increaseAffinity(state, category, amount) {
  if (!category || typeof category !== "string") return;
  state.categoryAffinity[category] = Math.min((state.categoryAffinity[category] || 0) + amount, 20);
}

export function getPlayerProgress() {
  return read();
}

export function recordContentView(article, date = new Date()) {
  if (!article?.id || !article?.title) return read();
  const state = read();
  state.recentContent = [{ id: article.id, title: article.title, category: article.category, viewedAt: calendarDay(date) }, ...state.recentContent.filter((item) => item.id !== article.id)].slice(0, HISTORY_LIMIT);
  increaseAffinity(state, article.category, 1);
  return write(state);
}

export function recordSavedContent(article) {
  const state = read();
  increaseAffinity(state, article?.category, 2);
  return write(state);
}

export function recordNewsView(item, date = new Date()) {
  if (!item?.url || !item?.title) return read();
  const state = read();
  state.recentNews = [{ url: item.url, title: item.title, source: item.source || "Berita", viewedAt: calendarDay(date) }, ...state.recentNews.filter((entry) => entry.url !== item.url)].slice(0, HISTORY_LIMIT);
  return write(state);
}

export function recordGameStart(game, date = new Date()) {
  if (!GAMES.includes(game)) return null;
  const state = read();
  recordDay(state, calendarDay(date));
  state.games[game].played++;
  write(state);
  return `${game}:${state.games[game].played}:${state.streak.lastActiveDay}`;
}

export function recordGameCompletion(game, session, date = new Date()) {
  if (!GAMES.includes(game) || !session) return false;
  const state = read();
  const gameState = state.games[game];
  if (gameState.lastCompletionSession === session) return false;
  recordDay(state, calendarDay(date));
  gameState.completed++;
  gameState.lastCompletionSession = session;
  write(state);
  return true;
}

export function hasViewedNews(url) {
  return typeof url === "string" && read().recentNews.some((item) => item.url === url);
}

export function clearPlayerProgress() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* Local features remain optional. */ }
  return defaults();
}
