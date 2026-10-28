import { beforeEach, expect, test, vi } from "vitest";
import {
  calendarDay,
  clearPlayerProgress,
  getPlayerProgress,
  getRecommendedArticles,
  recordContentView,
  recordGameCompletion,
  recordGameStart,
} from "../src/scripts/services/player-progress.js";

let values;
beforeEach(() => {
  values = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  });
});

const day = (value) => new Date(`${value}T12:00:00`);

test("uses safe defaults for corrupt local data and bounds recent content", () => {
  values.set("kh_player_progress_v1", "{bad");
  expect(getPlayerProgress().streak.current).toBe(0);
  for (let i = 0; i < 14; i++) recordContentView({ id: `article-${i}`, title: "Title", category: "chess" }, day("2026-10-01"));
  const state = getPlayerProgress();
  expect(state.recentContent).toHaveLength(12);
  expect(state.recentContent[0].id).toBe("article-13");
  expect(state.categoryAffinity.chess).toBe(14);
});

test("scores unseen content by local category affinity", () => {
  recordContentView({ id: "chess-old", title: "Chess", category: "chess" }, day("2026-10-01"));
  const articles = [
    { id: "tech", category: "technology" },
    { id: "chess-new", category: "chess" },
    { id: "chess-old", category: "chess" },
  ];
  expect(getRecommendedArticles(articles, 2).map((item) => item.id)).toEqual(["chess-new", "tech"]);
});

test("tracks first, same-day, next-day, missed-day, and duplicate completion activity", () => {
  const first = recordGameStart("chess", day("2026-10-01"));
  expect(getPlayerProgress().streak).toMatchObject({ current: 1, longest: 1, lastActiveDay: "2026-10-01" });
  recordGameStart("sudoku", day("2026-10-01"));
  expect(getPlayerProgress().streak.current).toBe(1);
  recordGameStart("crossword", day("2026-10-02"));
  expect(getPlayerProgress().streak).toMatchObject({ current: 2, longest: 2 });
  recordGameStart("chess", day("2026-10-04"));
  expect(getPlayerProgress().streak).toMatchObject({ current: 1, longest: 2 });
  expect(recordGameCompletion("chess", first, day("2026-10-04"))).toBe(true);
  expect(recordGameCompletion("chess", first, day("2026-10-04"))).toBe(false);
  expect(getPlayerProgress().games.chess.completed).toBe(1);
});

test("clears only local progress", () => {
  recordGameStart("sudoku", day("2026-10-01"));
  clearPlayerProgress();
  expect(getPlayerProgress()).toMatchObject({ version: 1, recentContent: [], recentNews: [] });
  expect(calendarDay(day("2026-10-03"))).toBe("2026-10-03");
});

test("keeps local features optional when browser storage is unavailable", () => {
  vi.stubGlobal("localStorage", {
    getItem: () => { throw new Error("storage blocked"); },
    setItem: () => { throw new Error("storage blocked"); },
    removeItem: () => { throw new Error("storage blocked"); },
  });
  expect(() => recordContentView({ id: "safe", title: "Safe", category: "technology" })).not.toThrow();
  expect(getPlayerProgress().recentContent).toEqual([]);
});
