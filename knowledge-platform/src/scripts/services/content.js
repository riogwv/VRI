/* ==========================================================================
   Content service — unified access to seed data + external APIs with fallbacks.
   Labels content honestly (internal seed vs external source).
   ========================================================================== */

import articlesBase from "../../data/seed/articles.json";
import articlesExtra from "../../data/seed/articles-extra.json";
import funFactsBase from "../../data/seed/fun-facts.json";
import funFactsExtra from "../../data/seed/fun-facts-extra.json";
import triviaBase from "../../data/seed/trivia.json";
import triviaExtra from "../../data/seed/trivia-extra.json";

const articlesSeed = [...articlesBase, ...articlesExtra];
const funFactsSeed = [...funFactsBase, ...funFactsExtra];
const triviaSeed = [...triviaBase, ...triviaExtra];
import crosswordSeed from "../../data/seed/crossword.json";
import chessPuzzlesSeed from "../../data/seed/chess-puzzles.json";
import { jikan } from "../api/jikan.js";
import { wikidata } from "../api/wikidata.js";
import { lichess } from "../api/lichess.js";
import { news } from "../api/news.js";
import { CONFIG } from "../config.js";

const articlesById = {};
articlesSeed.forEach((a) => (articlesById[a.id] = a));

const funFactsById = {};
funFactsSeed.forEach((f) => (funFactsById[f.id] = f));

const triviaById = {};
triviaSeed.forEach((t) => (triviaById[t.id] = t));

export const content = {
  /* ---------- Articles ---------- */
  getArticles({ category, limit = 12, offset = 0 } = {}) {
    let list = articlesSeed.filter((a) => a.verified);
    if (category && category !== "all") list = list.filter((a) => a.category === category);
    return list.slice(offset, offset + limit);
  },

  getArticle(id) {
    return articlesById[id] || null;
  },

  getRelated(ids, limit = 4) {
    return ids.map((id) => articlesById[id]).filter(Boolean).slice(0, limit);
  },

  getCategories() {
    const labels = {
      technology: "Teknologi",
      science: "Sains",
      chess: "Catur",
      anime: "Anime",
    };
    const cats = {};
    articlesSeed.forEach((a) => {
      if (!cats[a.category]) cats[a.category] = { key: a.category, count: 0 };
      cats[a.category].count++;
    });
    return Object.values(cats).map((c) => ({
      ...c,
      label: labels[c.key] || c.key,
    }));
  },

  /* ---------- Fun facts ---------- */
  getFunFacts({ category, limit = 6 } = {}) {
    let list = funFactsSeed.filter((f) => f.verified);
    if (category && category !== "all") list = list.filter((f) => f.category === category);
    return list.slice(0, limit);
  },

  getFunFact(id) {
    return funFactsById[id] || null;
  },

  /* ---------- Trivia ---------- */
  getTrivia({ category, limit = 10 } = {}) {
    let list = triviaSeed.filter((t) => t.source === "internal");
    if (category && category !== "all") list = list.filter((t) => t.category === category);
    return shuffle(list).slice(0, limit);
  },

  getTriviaById(id) {
    return triviaById[id] || null;
  },

  /* ---------- External: Anime (Jikan) ---------- */
  async searchAnime(q, limit = 10) {
    try {
      return await jikan.searchAnime(q, { limit });
    } catch (err) {
      console.warn("[content] anime search failed:", err.message);
      return [];
    }
  },

  async getAnime(id) {
    try {
      return await jikan.getAnime(id);
    } catch (err) {
      console.warn("[content] anime detail failed:", err.message);
      return null;
    }
  },

  async getTopAnime(limit = 12) {
    try {
      return await jikan.getTop({ limit });
    } catch (err) {
      console.warn("[content] top anime failed:", err.message);
      return [];
    }
  },

  /* ---------- External: Facts (Wikidata) ---------- */
  async searchWikidata(q, limit = 10) {
    try {
      return await wikidata.searchEntities(q, { limit });
    } catch (err) {
      console.warn("[content] wikidata search failed:", err.message);
      return [];
    }
  },

  /* ---------- External: Chess puzzles (Lichess) ---------- */
  async getChessPuzzle(difficulty = "normal") {
    try {
      return await lichess.getPuzzle({ difficulty });
    } catch (err) {
      console.warn("[content] lichess puzzle failed:", err.message);
      return null;
    }
  },

  getChessPuzzlesSeed() {
    return chessPuzzlesSeed;
  },

  /* ---------- External: News (GNews via edge function) ---------- */
  async getNews({ limit = 10 } = {}) {
    try {
      return await news.fetchTechNews({ limit });
    } catch (err) {
      console.warn("[content] news failed:", err.message);
      return { results: [], source: "gnews", error: err.message, fromCache: false };
    }
  },

  /* ---------- Crossword (seed) ---------- */
  getCrossword() {
    return crosswordSeed;
  },

  /* ---------- Search (local across seed) ---------- */
  search(query, { limit = CONFIG.limits.searchResults } = {}) {
    const q = query.toLowerCase();
    const results = [];

    articlesSeed.forEach((a) => {
      const score = scoreMatch(q, a.title) + scoreMatch(q, a.summary) + scoreMatchTags(q, a.tags);
      if (score > 0) results.push({ type: "article", item: a, score });
    });

    funFactsSeed.forEach((f) => {
      const score = scoreMatch(q, f.statement) + scoreMatch(q, f.explanation);
      if (score > 0) results.push({ type: "fun-fact", item: f, score });
    });

    triviaSeed.forEach((t) => {
      const score = scoreMatch(q, t.question) + scoreMatch(q, t.explanation);
      if (score > 0) results.push({ type: "trivia", item: t, score });
    });

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  },
};

function scoreMatch(q, text) {
  if (!text) return 0;
  const t = String(text).toLowerCase();
  if (t === q) return 10;
  if (t.startsWith(q)) return 5;
  if (t.includes(q)) return 2;
  return 0;
}

function scoreMatchTags(q, tags) {
  if (!tags) return 0;
  return tags.some((tag) => tag.toLowerCase().includes(q)) ? 3 : 0;
}

function shuffle(arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export { articlesSeed, funFactsSeed, triviaSeed };