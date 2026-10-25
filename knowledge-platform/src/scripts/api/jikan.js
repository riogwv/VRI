/* ==========================================================================
   Jikan API client (anime/manga) — public, no key. Rate-limited shared instance.
   Source: https://api.jikan.moe/v4  (attribution to MyAnimeList)
   ========================================================================== */

import { fetchJson } from "../services/api.js";
import { cacheGet, cacheSet } from "../services/cache.js";
import { CONFIG } from "../config.js";

const BASE = CONFIG.api.jikanBase;

const jikan = {
  async searchAnime(q, { limit = 10 } = {}) {
    const cacheKey = `jikan:anime:${q}:${limit}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    try {
      const data = await fetchJson(`${BASE}/anime?${buildQ({ q, limit })}`);
      const results = (data.data || []).map(normalizeAnime);
      cacheSet(cacheKey, results, CONFIG.cache.ttlJikan);
      return results;
    } catch (err) {
      console.warn("[Jikan] anime search failed:", err.message);
      return [];
    }
  },

  async getAnime(id) {
    const cacheKey = `jikan:anime:${id}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    try {
      const data = await fetchJson(`${BASE}/anime/${id}`);
      const result = normalizeAnime(data.data);
      cacheSet(cacheKey, result, CONFIG.cache.ttlJikan);
      return result;
    } catch (err) {
      console.warn("[Jikan] anime detail failed:", err.message);
      return null;
    }
  },

  async getTop({ type = "anime", limit = 12 } = {}) {
    const cacheKey = `jikan:top:${type}:${limit}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    try {
      const data = await fetchJson(`${BASE}/top/${type}?${buildQ({ limit })}`);
      const results = (data.data || []).map(normalizeAnime);
      cacheSet(cacheKey, results, CONFIG.cache.ttlJikan);
      return results;
    } catch (err) {
      console.warn("[Jikan] top anime failed:", err.message);
      return [];
    }
  },
};

function buildQ(params) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  return sp.toString();
}

function normalizeAnime(item) {
  return {
    id: `jikan:${item.mal_id}`,
    source: "jikan",
    title: item.title || "Tanpa judul",
    summary: item.synopsis || "",
    image: item.images?.jpg?.image_url || null,
    score: item.score,
    type: item.type,
    episodes: item.episodes,
    status: item.status,
    aired: item.aired?.string,
    genre: (item.genres || []).map((g) => g.name),
    url: item.url,
  };
}

export { jikan };