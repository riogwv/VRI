import { calendarDay, getPlayerProgress, recordGameCompletion, recordGameStart } from "./player-progress.js";

const STORAGE_KEY = "kh_game_progress_v1";
const VERSION = 1;
const GAMES = ["chess", "sudoku", "crossword"];
const DIFFICULTIES = ["easy", "medium", "hard"];

function defaults() {
  return {
    version: VERSION,
    daily: {},
    sessions: {},
    sudokuBest: Object.fromEntries(DIFFICULTIES.map((difficulty) => [difficulty, null])),
  };
}

function read() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!value || value.version !== VERSION || typeof value !== "object") return defaults();
    const state = defaults();
    state.daily = sanitizeDaily(value.daily);
    state.sessions = sanitizeSessions(value.sessions);
    DIFFICULTIES.forEach((difficulty) => {
      const best = value.sudokuBest?.[difficulty];
      state.sudokuBest[difficulty] = Number.isInteger(best) && best >= 0 ? best : null;
    });
    return state;
  } catch {
    return defaults();
  }
}

function write(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Local game progress remains optional. */ }
  return state;
}

function sanitizeDaily(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value)
    .filter(([key, item]) => /^[a-z]+:\d{4}-\d{2}-\d{2}$/.test(key) && GAMES.includes(item?.game) && ["in-progress", "completed"].includes(item.status))
    .slice(-31)
    .map(([key, item]) => [key, { game: item.game, status: item.status, challengeId: typeof item.challengeId === "string" ? item.challengeId : "" }]));
}

function validGrid(grid) {
  return Array.isArray(grid) && grid.length === 9 && grid.every((row) => Array.isArray(row) && row.length === 9 && row.every((value) => Number.isInteger(value) && value >= 0 && value <= 9));
}

function sanitizeSessions(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const sessions = {};
  const sudoku = value.sudoku;
  if (sudoku && validGrid(sudoku.puzzle) && validGrid(sudoku.solution) && validGrid(sudoku.grid) && DIFFICULTIES.includes(sudoku.difficulty) && typeof sudoku.activityId === "string") {
    sessions.sudoku = { ...sudoku, candidates: sudoku.candidates && typeof sudoku.candidates === "object" ? sudoku.candidates : {}, mistakes: safeCount(sudoku.mistakes), hintsUsed: safeCount(sudoku.hintsUsed), seconds: safeCount(sudoku.seconds), dailyDate: validDay(sudoku.dailyDate) ? sudoku.dailyDate : null, savedAt: safeCount(sudoku.savedAt) };
  }
  const chess = value.chess;
  if (chess && chess.puzzle?.fen && Array.isArray(chess.puzzle.moves) && typeof chess.activityId === "string" && typeof chess.fen === "string") {
    sessions.chess = { puzzle: chess.puzzle, fen: chess.fen, step: safeCount(chess.step), activityId: chess.activityId, dailyDate: validDay(chess.dailyDate) ? chess.dailyDate : null };
  }
  const crossword = value.crossword;
  if (crossword && typeof crossword.puzzleId === "string" && crossword.answers && typeof crossword.answers === "object" && typeof crossword.activityId === "string") {
    const answers = Object.fromEntries(Object.entries(crossword.answers).filter(([key, letter]) => /^\d+,\d+$/.test(key) && (letter === "" || /^[A-Z]$/.test(letter))).slice(0, 100));
    sessions.crossword = { puzzleId: crossword.puzzleId, answers, activityId: crossword.activityId, dailyDate: validDay(crossword.dailyDate) ? crossword.dailyDate : null };
  }
  return sessions;
}

function validDay(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, date] = value.split("-").map(Number);
  const candidate = new Date(year, month - 1, date);
  return candidate.getFullYear() === year && candidate.getMonth() === month - 1 && candidate.getDate() === date;
}
function safeCount(value) { return Number.isInteger(value) && value >= 0 ? value : 0; }
function dailyKey(game, day) { return `${game}:${day}`; }

export function dailyChallenge(game, variants, day = calendarDay()) {
  if (!GAMES.includes(game) || !Array.isArray(variants) || variants.length === 0 || !validDay(day)) return null;
  let hash = 0;
  for (const char of `${game}:${day}`) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const index = hash % variants.length;
  const value = variants[index];
  return { game, day, index, id: String(value?.id || index), value };
}

export function beginGame(game, date = new Date()) {
  return GAMES.includes(game) ? recordGameStart(game, date) : null;
}

export function getGameSession(game) { return GAMES.includes(game) ? read().sessions[game] || null : null; }

export function saveGameSession(game, session) {
  if (!GAMES.includes(game) || !session) return null;
  const state = read();
  state.sessions[game] = session;
  if (validDay(session.dailyDate)) {
    state.daily[dailyKey(game, session.dailyDate)] = { game, status: "in-progress", challengeId: String(session.challengeId || "") };
  }
  state.daily = sanitizeDaily(state.daily);
  return write(state).sessions[game];
}

export function clearGameSession(game, day = null) {
  const state = read();
  delete state.sessions[game];
  if (validDay(day) && state.daily[dailyKey(game, day)]?.status === "in-progress") delete state.daily[dailyKey(game, day)];
  return write(state);
}

export function getDailyStatus(game, day = calendarDay()) {
  return read().daily[dailyKey(game, day)]?.status || "not-started";
}

export function completeGame(game, { activityId, dailyDate = null, difficulty = null, seconds = null, date = new Date() } = {}) {
  if (!GAMES.includes(game) || !activityId) return { recorded: false, newBest: false };
  const recorded = recordGameCompletion(game, activityId, date);
  if (!recorded) return { recorded: false, newBest: false };
  const state = read();
  delete state.sessions[game];
  if (validDay(dailyDate)) state.daily[dailyKey(game, dailyDate)] = { game, status: "completed", challengeId: "" };
  state.daily = sanitizeDaily(state.daily);
  let newBest = false;
  if (game === "sudoku" && DIFFICULTIES.includes(difficulty) && Number.isInteger(seconds) && seconds >= 0) {
    const previous = state.sudokuBest[difficulty];
    if (previous == null || seconds < previous) {
      state.sudokuBest[difficulty] = seconds;
      newBest = true;
    }
  }
  write(state);
  import("./cloud-sync.js").then(({ queueAccountSync }) => queueAccountSync()).catch(() => {});
  return { recorded: true, newBest, dailyCompleted: validDay(dailyDate) };
}

export function replaceGameProgress(value) {
  const state = read();
  const next = { ...state, daily: sanitizeDaily(value?.daily), sudokuBest: { ...state.sudokuBest, ...(value?.sudokuBest || {}) } };
  return write(next);
}

export function getGameProgress() {
  const state = read();
  const player = getPlayerProgress();
  const completed = Object.values(player.games).reduce((sum, game) => sum + game.completed, 0);
  const played = Object.values(player.games).reduce((sum, game) => sum + game.played, 0);
  return { ...state, player, completed, played, completionRate: played ? Math.round((completed / played) * 100) : 0 };
}

export function getContinuePlaying() {
  return Object.entries(read().sessions).map(([game, session]) => ({ game, ...session }));
}

export function clearGameProgress() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* Storage is optional. */ }
  return defaults();
}

export function seededRandom(seed) {
  let value = 2166136261;
  for (const char of String(seed)) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return () => {
    value += 0x6D2B79F5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}
