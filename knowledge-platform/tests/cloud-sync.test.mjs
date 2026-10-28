import { beforeEach, expect, test, vi } from "vitest";
const mocks = vi.hoisted(() => ({ sb: null }));
vi.mock("../src/scripts/services/supabase.js", () => ({ getSupabase: () => mocks.sb }));
vi.mock("../src/scripts/services/bookmarks.js", () => ({ getBookmarks: () => [], setBookmarks: vi.fn() }));
vi.mock("../src/scripts/services/player-progress.js", () => ({ getPlayerProgress: () => ({}), replacePlayerProgress: vi.fn() }));
vi.mock("../src/scripts/services/game-progress.js", () => ({ getGameProgress: () => ({}), replaceGameProgress: vi.fn() }));
import { mergeBookmarks, mergeGameProgress, mergeProgress, syncAccount } from "../src/scripts/services/cloud-sync.js";

beforeEach(() => { mocks.sb = null; });
test("merges saved IDs once and keeps a bounded local-first list", () => {
  expect(mergeBookmarks([{ id: "local" }, { id: "same" }], [{ id: "same" }, { id: "cloud" }]).map((item) => item.id)).toEqual(["same", "cloud", "local"]);
});
test("progress merge is idempotent, preserves the safer high-water counts and better Sudoku best", () => {
  const local = { games: { chess: { played: 4, completed: 2 }, sudoku: { played: 1, completed: 1 } }, streak: { current: 2, longest: 3, lastActiveDay: "2026-10-28" } };
  const cloud = { games: { chess: { played: 4, completed: 2 }, crossword: { played: 2, completed: 1 } }, streak: { current: 1, longest: 4, lastActiveDay: "2026-10-27" } };
  const once = mergeProgress(local, cloud);
  expect(mergeProgress(once, cloud)).toEqual(once);
  expect(once.games.chess.completed).toBe(2);
  expect(mergeGameProgress({ daily: { "chess:2026-10-28": { status: "completed" } }, sudokuBest: { easy: 50 } }, { daily: { "sudoku:2026-10-28": { status: "completed" } }, sudokuBest: { easy: 40 } }).sudokuBest.easy).toBe(40);
});
test("network or missing Supabase leaves local data untouched", async () => {
  await expect(syncAccount({ id: "u" })).resolves.toBe(false);
});
test("does not turn duplicate progress snapshots into extra completions", () => {
  const snapshot = { games: { chess: { played: 3, completed: 2 } }, streak: { current: 1, longest: 1, lastActiveDay: "2026-10-28" } };
  expect(mergeProgress(snapshot, snapshot).games.chess).toMatchObject({ played: 3, completed: 2 });
  expect(mergeGameProgress({ daily: { "chess:2026-10-28": { status: "completed" } } }, { daily: { "chess:2026-10-28": { status: "completed" } } }).daily).toHaveProperty("chess:2026-10-28");
});
