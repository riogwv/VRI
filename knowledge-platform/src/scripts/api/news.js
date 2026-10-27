/* ==========================================================================
   News client — GNews via Supabase Edge Function proxy (key never in frontend).
   Falls back to local seed with clear label when API unavailable.
   Free tier: 100 req/day, 10 per req, 12h delay, 30 days history.
   ========================================================================== */

import { fetchJson } from "../services/api.js";
import { cacheGet, cacheSet } from "../services/cache.js";
import { CONFIG } from "../config.js";

const inFlight = new Map();

const news = {
  async fetchTechNews({ limit = 10 } = {}) {
    const cacheKey = `news:tech:${limit}`;
    const cached = cacheGet(cacheKey);
    if (cached) return { results: cached, source: "gnews", fromCache: true };

    if (inFlight.has(cacheKey)) return inFlight.get(cacheKey);
    const request = (async () => {
      const edgeUrl = CONFIG.api.edgeFunction;
      try {
        if (!edgeUrl) throw new Error("URL proxy berita belum dikonfigurasi.");
        const data = await fetchJson(`${edgeUrl}?${buildQ({ category: "technology", max: limit })}`);
        const results = normalizeNews(data.articles || data);
        cacheSet(cacheKey, results, CONFIG.cache.ttlNews);
        return { results, source: "gnews", fromCache: false };
      } catch (err) {
        console.warn("[News] GNews proxy failed:", err.message);
        return { results: [], source: "gnews", error: err.message, fromCache: false };
      }
    })();
    inFlight.set(cacheKey, request);
    try { return await request; } finally { inFlight.delete(cacheKey); }
  },
};

function buildQ(params) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  return sp.toString();
}

function normalizeNews(items) {
  return items.map((item) => ({
    id: item.id || item.url || Math.random().toString(36).slice(2),
    title: item.title || "Tanpa judul",
    summary: item.description || item.summary || "",
    source: item.source?.name || item.source || "Sumber tidak diketahui",
    url: item.url,
    publishedAt: item.publishedAt || item.published_at || item.date,
    image: item.image || item.urlToImage || null,
    category: item.category || "teknologi",
  }));
}

export { news };