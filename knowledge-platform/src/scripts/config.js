/* ==========================================================================
   App configuration — reads env, never exposes secrets
   ========================================================================== */

export const CONFIG = {
  appName: "Knowledge Hub",
  appDescription:
    "Platform pengetahuan interaktif: ensiklopedia, feed sosial, berita teknologi, trivia, dan permainan asah otak.",
  categories: [
    { key: "technology", label: "Teknologi", color: "tech", icon: "💻" },
    { key: "chess", label: "Catur", color: "chess", icon: "♟️" },
    { key: "anime", label: "Anime", color: "anime", icon: "📺" },
  ],
  routes: {
    home: "#/",
    explore: "#/explore",
    category: (k) => `#/category/${k}`,
    article: (id) => `#/article/${id}`,
    games: "#/games",
    sudoku: "#/games/sudoku",
    crossword: "#/games/crossword",
    chess: "#/games/chess",
    saved: "#/saved",
    profile: "#/profile",
    search: (q) => `#/search?q=${encodeURIComponent(q)}`,
  },
  api: {
    jikanBase: import.meta.env.VITE_JIKAN_API_BASE || "https://api.jikan.moe/v4",
    wikidataBase:
      import.meta.env.VITE_WIKIDATA_API_BASE ||
      "https://www.wikidata.org/w/rest.php/wikibase/v1",
    lichessBase:
      import.meta.env.VITE_LICHESS_API_BASE || "https://lichess.org/api",
    edgeFunction:
      import.meta.env.VITE_EDGE_FUNCTION_URL || "",
  },
  cache: {
    ttlNews: 6 * 60 * 60 * 1000, // 6 hours
    ttlJikan: 24 * 60 * 60 * 1000, // 24 hours
    ttlWikidata: 24 * 60 * 60 * 1000, // 24 hours
    ttlLichess: 60 * 60 * 1000, // 1 hour
  },
  limits: {
    feedPerPage: 12,
    searchResults: 20,
    triviaQuestions: 10,
  },
};

export function getEnv(key, fallback = "") {
  return import.meta.env[key] || fallback;
}

export function isDev() {
  return import.meta.env.DEV === true;
}