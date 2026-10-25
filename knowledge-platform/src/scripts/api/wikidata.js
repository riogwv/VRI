/* ==========================================================================
   Wikidata REST API client — read-only, CC0 structured data, no key.
   Source: https://www.wikidata.org/w/rest.php/wikibase/v1
   ========================================================================== */

import { fetchJson } from "../services/api.js";
import { cacheGet, cacheSet } from "../services/cache.js";
import { CONFIG } from "../config.js";

const BASE = CONFIG.api.wikidataBase;

const wikidata = {
  async searchEntities(q, { limit = 10, language = "en" } = {}) {
    const cacheKey = `wd:search:${q}:${limit}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    try {
      const data = await fetchJson(
        `${BASE}/search/entities?${buildQ({ q, language, limit })}`
      );
      const results = (data.search || []).map(normalizeEntity);
      cacheSet(cacheKey, results, CONFIG.cache.ttlWikidata);
      return results;
    } catch (err) {
      console.warn("[Wikidata] search failed:", err.message);
      return [];
    }
  },

  async getEntity(id) {
    const cacheKey = `wd:entity:${id}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    try {
      const data = await fetchJson(`${BASE}/entities/${id}`);
      const result = normalizeEntity(data.entities?.[id] || data);
      cacheSet(cacheKey, result, CONFIG.cache.ttlWikidata);
      return result;
    } catch (err) {
      console.warn("[Wikidata] entity failed:", err.message);
      return null;
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

function normalizeEntity(item) {
  const labels = item.labels || {};
  const label = labels.en?.value || labels.id?.value || Object.values(labels)[0]?.value || item.id;
  const desc = (item.descriptions || {}).en?.value || (item.descriptions || {}).id?.value || "";
  return {
    id: `wd:${item.id}`,
    source: "wikidata",
    title: label,
    summary: desc,
    idRaw: item.id,
  };
}

export { wikidata };