import { beforeEach, expect, test, vi } from "vitest";
import { beginGame, clearGameProgress, clearGameSession, completeGame, dailyChallenge, getContinuePlaying, getDailyStatus, getGameProgress, getGameSession, saveGameSession } from "../src/scripts/services/game-progress.js";

let values;
beforeEach(() => {
  values = new Map();
  vi.stubGlobal("localStorage", { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) });
});
const grid = () => Array.from({ length: 9 }, () => Array(9).fill(0));

test("uses a deterministic daily challenge and varies when variants permit", () => {
  const choices = [{ id: "a" }, { id: "b" }, { id: "c" }];
  expect(dailyChallenge("chess", choices, "2026-10-01")).toEqual(dailyChallenge("chess", choices, "2026-10-01"));
  expect(dailyChallenge("chess", choices, "2026-02-30")).toBeNull();
  const ids = new Set(["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"].map((day) => dailyChallenge("chess", choices, day).id));
  expect(ids.size).toBeGreaterThan(1);
});

test("persists a resumable Sudoku session and drops corrupt sessions", () => {
  const activityId = beginGame("sudoku", new Date("2026-10-01T12:00:00"));
  saveGameSession("sudoku", { puzzle: grid(), solution: grid(), grid: grid(), difficulty: "easy", candidates: {}, mistakes: 1, hintsUsed: 2, seconds: 30, activityId, dailyDate: "2026-10-01", savedAt: 10 });
  expect(getGameSession("sudoku").seconds).toBe(30);
  expect(getDailyStatus("sudoku", "2026-10-01")).toBe("in-progress");
  clearGameSession("sudoku", "2026-10-01");
  expect(getContinuePlaying()).toEqual([]);
  values.set("kh_game_progress_v1", "{bad");
  expect(getContinuePlaying()).toEqual([]);
});

test("deduplicates completion, clears resume state, and keeps Sudoku best per difficulty", () => {
  const activityId = beginGame("sudoku", new Date("2026-10-01T12:00:00"));
  saveGameSession("sudoku", { puzzle: grid(), solution: grid(), grid: grid(), difficulty: "easy", candidates: {}, mistakes: 0, hintsUsed: 0, seconds: 20, activityId, dailyDate: "2026-10-01", savedAt: 10 });
  expect(completeGame("sudoku", { activityId, dailyDate: "2026-10-01", difficulty: "easy", seconds: 20, date: new Date("2026-10-01T12:00:00") })).toMatchObject({ recorded: true, newBest: true });
  expect(completeGame("sudoku", { activityId, dailyDate: "2026-10-01", difficulty: "easy", seconds: 10, date: new Date("2026-10-01T12:00:00") }).recorded).toBe(false);
  expect(getGameSession("sudoku")).toBeNull();
  expect(getDailyStatus("sudoku", "2026-10-01")).toBe("completed");
  const next = beginGame("sudoku", new Date("2026-10-02T12:00:00"));
  completeGame("sudoku", { activityId: next, difficulty: "easy", seconds: 30, date: new Date("2026-10-02T12:00:00") });
  const medium = beginGame("sudoku", new Date("2026-10-03T12:00:00"));
  completeGame("sudoku", { activityId: medium, difficulty: "medium", seconds: 40, date: new Date("2026-10-03T12:00:00") });
  expect(getGameProgress().sudokuBest).toMatchObject({ easy: 20, medium: 40 });
});


test("bounds daily records, rejects invalid data, and clears all game-only state", () => {
  const activityId = beginGame("crossword", new Date("2026-10-01T08:00:00"));
  saveGameSession("crossword", { puzzleId: "daily", answers: { "0,0": "A" }, activityId, dailyDate: "2026-10-01" });
  expect(getContinuePlaying()).toHaveLength(1);
  values.set("kh_game_progress_v1", JSON.stringify({ version: 0, sessions: { sudoku: { invalid: true } } }));
  expect(getContinuePlaying()).toEqual([]);
  saveGameSession("crossword", { puzzleId: "daily", answers: { "0,0": "A" }, activityId, dailyDate: "2026-10-01" });
  clearGameProgress();
  expect(getContinuePlaying()).toEqual([]);
  expect(getGameProgress().sudokuBest).toEqual({ easy: null, medium: null, hard: null });
});
