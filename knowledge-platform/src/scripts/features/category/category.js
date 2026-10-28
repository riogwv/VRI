/* ==========================================================================
   Category page — articles within a category
   ========================================================================== */

import { content } from "../../services/content.js";
import { createEl } from "../../utils/dom.js";
import { renderCardGrid } from "../../components/card-grid.js";

const CATEGORY_LABELS = {
  technology: "Teknologi",
  chess: "Catur",
  anime: "Anime",
};
const CATEGORY_COLORS = {
  technology: "tech",
  chess: "chess",
  anime: "anime",
};

export async function renderCategory(params) {
  const key = params[0] || params.key || "technology";
  const label = CATEGORY_LABELS[key] || key;
  const color = CATEGORY_COLORS[key] || "tech";

  const page = createEl("section", { className: "page category-page" }, [
    createEl("div", { className: "container" }, [
      createEl("div", { className: "section-header", style: "margin-bottom:var(--space-6)" }, [
        createEl("h1", {}, label),
        createEl("p", { style: "color:var(--color-text-muted)" }, "Konten terpilih dalam kategori " + label + "."),
      ]),
      createEl("div", { className: "grid-articles", id: "category-grid" }),
    ]),
  ]);

  const grid = page.querySelector("#category-grid");
  const articles = content.getArticles({ category: key, limit: 24 });
  const cards = articles.map((a) => articleCard(a, color));
  renderCardGrid(grid, cards);

  if (articles.length === 0) {
    grid.innerHTML = "";
    grid.appendChild(createEl("div", { className: "empty-state" }, [
      createEl("h3", {}, "Belum ada konten di kategori ini"),
      createEl("p", {}, "Konten baru akan segera ditambahkan."),
    ]));
  }

  return page;
}

function articleCard(a, color) {
  return createEl("article", { className: "card" }, [
    createEl("div", { className: "card-body" }, [
      createEl("div", { className: `badge badge-${color}` }, a.category.charAt(0).toUpperCase() + a.category.slice(1)),
      createEl("h3", { style: "margin:var(--space-2) 0" }, a.title),
      createEl("p", { style: "color:var(--color-text-secondary);font-size:var(--text-sm);line-height:var(--leading-relaxed)" }, a.summary),
      createEl("div", { style: "margin-top:var(--space-4);display:flex;justify-content:space-between;align-items:center" }, [
        createEl("span", { style: "font-size:var(--text-xs);color:var(--color-text-muted)" }, a.readTime + " baca"),
        createEl("a", { className: "btn-link", href: `#/article/${a.id}` }, "Baca →"),
      ]),
    ]),
  ]);
}