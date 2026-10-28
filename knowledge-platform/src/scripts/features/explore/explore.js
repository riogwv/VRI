/* ==========================================================================
   Explore — all content with filters
   ========================================================================== */

import { content } from "../../services/content.js";
import { createEl } from "../../utils/dom.js";
import { renderCardGrid } from "../../components/card-grid.js";
import { discoverArticles } from "../../services/discovery.js";

export async function renderExplore() {
  const urlParams = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const category = urlParams.get("cat") || "all";
  const mode = ["recommended", "recent", "explore"].includes(urlParams.get("mode")) ? urlParams.get("mode") : "recommended";

  const page = createEl("section", { className: "page explore-page" }, [
    createEl("div", { className: "container" }, [
      createEl("div", { className: "section-header", style: "margin-bottom:var(--space-5)" }, [
        createEl("h1", {}, "Eksplorasi Konten"),
      ]),
      createEl("div", { className: "filter-bar", style: "display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-3)" }, [
        createFilterButton("all", "Semua", category === "all", mode),
        createFilterButton("technology", "Teknologi", category === "technology", mode),
        createFilterButton("science", "Sains", category === "science", mode),
        createFilterButton("chess", "Catur", category === "chess", mode),
        createFilterButton("anime", "Anime", category === "anime", mode),
      ]),
      createEl("div", { className: "filter-bar", "aria-label": "Urutkan konten", style: "display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-6)" }, [
        createModeButton("recommended", "Direkomendasikan", mode, category),
        createModeButton("recent", "Terbaru", mode, category),
        createModeButton("explore", "Jelajahi", mode, category),
      ]),
      createEl("div", { className: "grid-articles", id: "explore-grid" }),
    ]),
  ]);

  const grid = page.querySelector("#explore-grid");
  const articles = content.getArticles({ category, limit: Infinity });
  const ranked = discoverArticles(articles, { limit: articles.length, mode });
  const cards = ranked.map((item) => articleCard(item.article, item.reason));
  renderCardGrid(grid, cards);
  if (!cards.length) grid.appendChild(createEl("p", { className: "empty-state" }, "Belum ada artikel dalam kategori ini."));

  return page;
}

function createFilterButton(key, label, active, mode) {
  return createEl("button", {
    className: `btn ${active ? "btn-primary" : "btn-outline"}`,
    onClick: () => {
      window.navigateApp(`/explore?cat=${encodeURIComponent(key)}&mode=${encodeURIComponent(mode)}`);
    },
  }, label);
}

function createModeButton(key, label, active, category) {
  return createEl("button", {
    className: `btn ${active === key ? "btn-primary" : "btn-outline"}`,
    onClick: () => window.navigateApp(`/explore?cat=${encodeURIComponent(category)}&mode=${encodeURIComponent(key)}`),
  }, label);
}

function articleCard(a, reason) {
  const catConf = { technology: "tech", chess: "chess", anime: "anime" }[a.category] || "tech";
  return createEl("article", { className: "card" }, [
    createEl("div", { className: "card-body" }, [
      createEl("div", { className: `badge badge-${catConf}` }, a.category.charAt(0).toUpperCase() + a.category.slice(1)),
      createEl("h3", { style: "margin:var(--space-2) 0" }, a.title),
      createEl("p", { style: "color:var(--color-text-secondary);font-size:var(--text-sm);line-height:var(--leading-relaxed)" }, a.summary),
      createEl("div", { style: "margin-top:var(--space-4);display:flex;justify-content:space-between;gap:var(--space-2);align-items:center" }, [
        createEl("span", { style: "font-size:var(--text-xs);color:var(--color-text-muted)" }, reason),
        createEl("a", { className: "btn-link", href: `#/article/${a.id}` }, "Baca selengkapnya →"),
      ]),
    ]),
  ]);
}