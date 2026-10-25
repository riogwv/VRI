/* ==========================================================================
   Homepage — discovery feed (For You / Latest / Popular × categories)
   ========================================================================== */

import { content } from "../../services/content.js";
import { renderCardGrid } from "../../components/card-grid.js";
import { createEl } from "../../utils/dom.js";

export async function renderHome() {
  const page = createEl("section", { className: "page home-page", id: "home" });

  // Hero: fun fact of the day
  const funFacts = content.getFunFacts({ limit: 1 });
  const ff = funFacts[0];

  const hero = createEl("div", { className: "card hero" }, [
    createEl("div", { className: "card-body", style: "padding:var(--space-6)" }, [
      createEl("div", { className: "badge badge-tech", style: "margin-bottom:var(--space-3)" }, "Fun Fact Hari Ini"),
      createEl("h2", {}, ff ? ff.statement : "Tidak ada fun fact tersedia saat ini."),
      ff
        ? createEl("p", { style: "color:var(--color-text-secondary);margin-top:var(--space-2)" }, ff.explanation)
        : null,
    ]),
  ]);

  // Feed section
  const feedSection = createEl("section", { className: "feed-section", style: "margin-top:var(--space-10)" }, [
    createEl("div", { className: "section-header" }, [
      createEl("h2", {}, "Feed Terkini"),
      createEl("a", { className: "view-all", href: "#/explore" }, "Lihat semua →"),
    ]),
    createEl("div", { className: "grid-feed", id: "home-feed" }),
  ]);

  page.appendChild(hero);
  page.appendChild(feedSection);

  // Populate feed
  const feedContainer = page.querySelector("#home-feed");
  const articles = content.getArticles({ limit: 8 });
  const feedItems = articles.map((a) => articleCard(a));
  renderCardGrid(feedContainer, feedItems);

  // Category quick links
  const catsSection = createEl("section", { className: "cats-section", style: "margin-top:var(--space-10)" }, [
    createEl("div", { className: "section-header" }, [
      createEl("h2", {}, "Eksplorasi Kategori"),
    ]),
    createEl("div", { className: "grid-cats", id: "home-cats" }),
  ]);
  page.appendChild(catsSection);

  const catContainer = page.querySelector("#home-cats");
  const categories = content.getCategories();
  categories.forEach((c) => {
    catContainer.appendChild(categoryChip(c));
  });

  return page;
}

function articleCard(a) {
  const catConf = { technology: "tech", chess: "chess", anime: "anime" }[a.category] || "tech";
  return createEl("article", { className: "card" }, [
    createEl("div", { className: "card-body" }, [
      createEl("div", { className: `badge badge-${catConf}` }, a.category.charAt(0).toUpperCase() + a.category.slice(1)),
      createEl("h3", { style: "margin:var(--space-2) 0" }, a.title),
      createEl("p", { style: "color:var(--color-text-secondary);font-size:var(--text-sm);line-height:var(--leading-relaxed)" }, a.summary),
      createEl("div", { className: "card-meta", style: "margin-top:var(--space-4);display:flex;justify-content:space-between;align-items:center;gap:var(--space-2)" }, [
        createEl("span", { style: "font-size:var(--text-xs);color:var(--color-text-muted)" }, a.readTime + " baca"),
        createEl("a", { className: "btn-link", href: `#/article/${a.id}` }, "Baca selengkapnya →"),
      ]),
    ]),
  ]);
}

function categoryChip(c) {
  const colorMap = { technology: "tech", chess: "chess", anime: "anime" };
  const color = colorMap[c.key] || "tech";
  return createEl("a", {
    className: "card cat-chip",
    href: `#/category/${c.key}`,
    style: "text-decoration:none;display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-5);",
  }, [
    createEl("div", { className: `badge badge-${color}`, style: "align-self:start" }, c.label),
    createEl("h3", { style: "margin:0" }, c.label),
    createEl("p", { style: "color:var(--color-text-muted);font-size:var(--text-sm);margin:0" }, c.count + " artikel"),
  ]);
}