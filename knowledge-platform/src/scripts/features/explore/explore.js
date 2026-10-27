/* ==========================================================================
   Explore — all content with filters
   ========================================================================== */

import { content } from "../../services/content.js";
import { createEl } from "../../utils/dom.js";
import { renderCardGrid } from "../../components/card-grid.js";

export async function renderExplore() {
  const urlParams = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const category = urlParams.get("cat") || "all";

  const page = createEl("section", { className: "page explore-page" }, [
    createEl("div", { className: "container" }, [
      createEl("div", { className: "section-header", style: "margin-bottom:var(--space-5)" }, [
        createEl("h2", {}, "Eksplorasi Konten"),
      ]),
      createEl("div", { className: "filter-bar", style: "display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-6)" }, [
        createFilterButton("all", "Semua", category === "all"),
        createFilterButton("technology", "Teknologi", category === "technology"),
        createFilterButton("science", "Sains", category === "science"),
        createFilterButton("chess", "Catur", category === "chess"),
        createFilterButton("anime", "Anime", category === "anime"),
      ]),
      createEl("div", { className: "grid-articles", id: "explore-grid" }),
    ]),
  ]);

  const grid = page.querySelector("#explore-grid");
  const articles = content.getArticles({ category, limit: Infinity });
  const cards = articles.map((a) => articleCard(a));
  renderCardGrid(grid, cards);
  if (!cards.length) grid.appendChild(createEl("p", { className: "empty-state" }, "Belum ada artikel dalam kategori ini."));

  return page;
}

function createFilterButton(key, label, active) {
  return createEl("button", {
    className: `btn ${active ? "btn-primary" : "btn-outline"}`,
    onClick: () => {
      window.navigateApp(`/explore?cat=${encodeURIComponent(key)}`);
    },
  }, label);
}

function articleCard(a) {
  const catConf = { technology: "tech", chess: "chess", anime: "anime" }[a.category] || "tech";
  return createEl("article", { className: "card" }, [
    createEl("div", { className: "card-body" }, [
      createEl("div", { className: `badge badge-${catConf}` }, a.category.charAt(0).toUpperCase() + a.category.slice(1)),
      createEl("h3", { style: "margin:var(--space-2) 0" }, a.title),
      createEl("p", { style: "color:var(--color-text-secondary);font-size:var(--text-sm);line-height:var(--leading-relaxed)" }, a.summary),
      createEl("a", { className: "btn-link", href: `#/article/${a.id}` }, "Baca selengkapnya →"),
    ]),
  ]);
}