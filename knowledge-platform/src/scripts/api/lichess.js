/* ==========================================================================
   Lichess API client — anonymous OK, CORS *, one request at a time,
   wait 1 min on 429. Source: https://lichess.org/api
   ========================================================================== */

import { fetchJson } from "../services/api.js";
import { CONFIG } from "../config.js";

const BASE = CONFIG.api.lichessBase;
let inFlight = null;

const lichess = {
  async getPuzzle({ difficulty = "normal" } = {}) {
    // One request at a time guard
    if (inFlight) return inFlight;
    inFlight = (async () => {
      try {
        const url = `${BASE}/puzzle/next?${buildQ({ difficulty, color: "" })}`;
        const data = await fetchJson(url);
        return normalizePuzzle(data);
      } catch (err) {
        console.warn("[Lichess] puzzle failed:", err.message);
        return null;
      } finally {
        inFlight = null;
      }
    })();
    return inFlight;
  },
};

function buildQ(params) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  return sp.toString();
}

function normalizePuzzle(item) {
  return {
    id: `lichess:${item.id || Math.random().toString(36).slice(2)}`,
    source: "lichess",
    fen: item.fen,
    moves: item.moves,
    rating: item.rating,
    themes: item.themes || [],
    url: `https://lichess.org/training/${item.id}`,
  };
}

export { lichess };
