/* ==========================================================================
   Homepage — discovery feed (For You / Latest / Popular × categories)
   ========================================================================== */

import { content } from "../../services/content.js";
import { renderCardGrid } from "../../components/card-grid.js";
import { createEl } from "../../utils/dom.js";

export async function renderHome() {
  const page = createEl("section", { className: "page home-page", id: "home" });
  const layout = createEl("div", { className: "container home-layout" });
  page.appendChild(layout);

  // Hero: fun fact of the day
  const funFacts = content.getFunFacts({ limit: 1 });
  const ff = funFacts[0];

  const hero = createEl("section", { className: "home-hero" }, [
    createEl("div", { className: "hero-copy" }, [
      createEl("span", { className: "hero-eyebrow" }, "RUANG UNTUK RASA INGIN TAHU"),
      createEl("h1", { className: "hero-title" }, ["Dunia lebih luas saat kamu ", createEl("span", {}, "penasaran.")]),
      createEl("p", { className: "hero-intro" }, "Temukan cerita, ide, dan permainan yang membuat belajar terasa lebih menyenangkan."),
      createEl("p", { className: "hero-guest" }, "Baca dan bermain tanpa membuat akun."),
      createEl("div", { className: "hero-actions" }, [
        createEl("a", { className: "btn btn-primary", href: "#/explore" }, "Jelajahi artikel →"),
        createEl("a", { className: "hero-secondary", href: "#/games" }, "Main permainan ↗"),
      ]),
    ]),
    createEl("aside", { className: "hero-fact" }, [
      createEl("div", { className: "fact-top" }, [
        createEl("span", { className: "fact-label" }, "FAKTA PILIHAN"),
        createEl("span", { className: "fact-symbol", "aria-hidden": "true" }, "✳"),
      ]),
      createEl("h2", {}, ff ? ff.statement : "Tidak ada fakta tersedia saat ini."),
      ff ? createEl("p", {}, ff.explanation) : null,
      createEl("span", { className: "fact-footer" }, "Sedikit tahu, banyak kemungkinan."),
    ]),
  ]);

  // Feed section
  const feedSection = createEl("section", { className: "feed-section home-section" }, [
    createEl("div", { className: "section-header" }, [
      createEl("div", {}, [createEl("span", { className: "section-kicker" }, "UNTUK KAMU"), createEl("h2", {}, "Mulai dari sini")]),
      createEl("a", { className: "view-all", href: "#/explore" }, "Lihat semua →"),
    ]),
    createEl("div", { className: "grid-feed", id: "home-feed" }),
  ]);

  layout.appendChild(hero);
  layout.appendChild(createEl("nav", { className: "discovery-paths", "aria-label": "Mulai menjelajah" }, [
    createEl("a", { href: "#/explore", className: "discovery-path" }, [createEl("strong", {}, "01 · Baca"), createEl("span", {}, "Jelajahi ide dan artikel →")]),
    createEl("a", { href: "#/news", className: "discovery-path" }, [createEl("strong", {}, "02 · Ikuti"), createEl("span", {}, "Lihat berita teknologi →")]),
    createEl("a", { href: "#/games", className: "discovery-path" }, [createEl("strong", {}, "03 · Bermain"), createEl("span", {}, "Asah pikiran dengan teka-teki →")]),
  ]));
  layout.appendChild(feedSection);

  // Populate feed
  const feedContainer = page.querySelector("#home-feed");
  const articles = content.getArticles({ limit: 8 });
  const feedItems = articles.map((a) => articleCard(a));
  renderCardGrid(feedContainer, feedItems);

  // Category quick links
  const catsSection = createEl("section", { className: "cats-section home-section" }, [
    createEl("div", { className: "section-header" }, [
      createEl("div", {}, [createEl("span", { className: "section-kicker" }, "TEMUKAN MINATMU"), createEl("h2", {}, "Jelajahi kategori")]),
    ]),
    createEl("div", { className: "grid-cats", id: "home-cats" }),
  ]);
  layout.appendChild(catsSection);

  const catContainer = page.querySelector("#home-cats");
  const categories = content.getCategories();
  categories.forEach((c) => {
    catContainer.appendChild(categoryChip(c));
  });

  return page;
}

function articleCard(a) {
  const catConf = { technology: "tech", chess: "chess", anime: "anime" }[a.category] || "tech";
  return createEl("article", { className: "card home-article" }, [
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