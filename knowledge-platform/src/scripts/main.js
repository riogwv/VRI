/* ==========================================================================
   main.js — app bootstrap
   ========================================================================== */

import { initRouter, addRoute, navigate } from "./router.js";
import { CONFIG } from "./config.js";
import { initAuth } from "./services/auth.js";
import { renderHome } from "./features/home/home.js";
import { renderExplore } from "./features/explore/explore.js";
import { renderCategory } from "./features/category/category.js";
import { renderArticle } from "./features/articles/article.js";
import { renderSearch } from "./features/search/search.js";
import { renderGames } from "./features/games/games.js";
import { renderSudoku } from "./features/sudoku/sudoku.js";
import { renderCrossword } from "./features/crossword/crossword.js";
import { renderChess } from "./features/chess/chess.js";
import { renderSaved } from "./features/saved/saved.js";
import { renderProfile } from "./features/profile/profile.js";
import { initTheme } from "./ui/theme.js";
import { initNav } from "./ui/nav.js";
import { initSearch } from "./ui/global-search.js";
import { showToast } from "./ui/toast.js";

document.documentElement.lang = "id";

async function initApp() {
  initTheme();
  initNav();
  initSearch();

  // Auth (Supabase) — optional, public content works without login
  await initAuth();

  // Routes
  addRoute("/", renderHome);
  addRoute("/explore", renderExplore);
  addRoute(/^\/category\/([a-z0-9-]+)$/, renderCategory);
  addRoute(/^\/article\/([a-z0-9-]+)$/, renderArticle);
  addRoute(/^\/search$/, renderSearch);
  addRoute(/^\/games$/, renderGames);
  addRoute(/^\/games\/sudoku$/, renderSudoku);
  addRoute(/^\/games\/crossword$/, renderCrossword);
  addRoute(/^\/games\/chess$/, renderChess);
  addRoute(/^\/saved$/, renderSaved);
  addRoute(/^\/profile$/, renderProfile);

  initRouter();

  // Expose navigate globally for inline handlers
  window.navigateApp = navigate;

  // Log startup (dev only)
  if (typeof window !== "undefined" && import.meta.env.DEV) {
    console.log("[KnowledgeHub] app initialized", { version: "1.0.0" });
  }
}

initApp().catch((err) => {
  console.error("[KnowledgeHub] bootstrap failed:", err);
  showToast?.("Gagal memuat aplikasi. Coba muat ulang halaman.", "error");
});