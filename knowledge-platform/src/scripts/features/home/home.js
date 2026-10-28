/* ==========================================================================
   Homepage — discovery feed (For You / Latest / Popular × categories)
   ========================================================================== */

import { content } from "../../services/content.js";
import { renderCardGrid } from "../../components/card-grid.js";
import { createEl, safeExternalUrl } from "../../utils/dom.js";
import { calendarDay, getPlayerProgress, hasViewedNews, recordNewsView } from "../../services/player-progress.js";
import { getContinuePlaying, getDailyStatus } from "../../services/game-progress.js";
import { discoverArticles } from "../../services/discovery.js";

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

  const progress = getPlayerProgress();
  const allArticles = content.getArticles({ limit: 100 }) || [];
  const recentArticles = progress.recentContent
    .map((entry) => allArticles.find((article) => article.id === entry.id))
    .filter(Boolean)
    .slice(0, 3);
  const hasHistory = recentArticles.length > 0 || Object.keys(progress.categoryAffinity).length > 0;

  const continuationIds = recentArticles.map((article) => article.id);
  const forYou = discoverArticles(allArticles, { limit: 4, excludeIds: continuationIds });
  const discovery = discoverArticles(allArticles, {
    limit: 4,
    mode: "explore",
    excludeIds: [...continuationIds, ...forYou.map((item) => item.article.id)],
  });
  const feedSection = discoverySection({
    id: "home-feed",
    kicker: hasHistory ? "UNTUK KAMU" : "PILIHAN EDITOR",
    title: hasHistory ? "Temukan hal berikutnya" : "Mulai dari sini",
    items: forYou,
  });

  layout.appendChild(hero);
  layout.appendChild(gameLoopCard());
  layout.appendChild(createEl("nav", { className: "discovery-paths", "aria-label": "Mulai menjelajah" }, [
    createEl("a", { href: "#/explore", className: "discovery-path" }, [createEl("strong", {}, "01 · Baca"), createEl("span", {}, "Jelajahi ide dan artikel →")]),
    createEl("a", { href: "#/news", className: "discovery-path" }, [createEl("strong", {}, "02 · Ikuti"), createEl("span", {}, "Lihat berita teknologi →")]),
    createEl("a", { href: "#/games", className: "discovery-path" }, [createEl("strong", {}, "03 · Bermain"), createEl("span", {}, "Asah pikiran dengan teka-teki →")]),
  ]));
  if (recentArticles.length) layout.appendChild(continueSection(recentArticles));
  layout.appendChild(feedSection);

  const feedContainer = page.querySelector("#home-feed");
  renderCardGrid(feedContainer, forYou.map((item) => articleCard(item.article, item.reason)));
  if (discovery.length) layout.appendChild(discoverySection({
    id: "home-discover",
    kicker: "TEMUKAN SESUATU BARU",
    title: "Keluar dari kebiasaanmu",
    items: discovery,
  }));

  const spotlight = createEl("section", { className: "home-spotlight", "aria-label": "Berita dan permainan" }, [
    createEl("div", { className: "spotlight-news" }, [
      createEl("span", { className: "section-kicker" }, "JENDELA INFORMASI"),
      createEl("h2", {}, "Kabar terbaru, untuk rasa ingin tahu."),
      createEl("p", {}, "Ikuti perkembangan teknologi dari sumber berita eksternal."),
      createEl("div", { id: "home-news", className: "home-news-list", "aria-live": "polite" }, "Memuat berita…"),
      createEl("a", { href: "#/news", className: "spotlight-link" }, "Semua berita →"),
    ]),
    createEl("div", { className: "spotlight-games" }, [
      createEl("span", { className: "section-kicker" }, "JEDA SEJENAK"),
      createEl("h2", {}, "Bermain sambil berpikir."),
      createEl("p", {}, "Pilih tantangan kecil untuk hari ini."),
      progressSummary(progress),
      createEl("a", { href: "#/games/sudoku", className: "game-preview" }, [createEl("strong", {}, "▦  Sudoku"), createEl("span", {}, "Logika angka →")]),
      createEl("a", { href: "#/games/crossword", className: "game-preview" }, [createEl("strong", {}, "✎  Teka-teki silang"), createEl("span", {}, "Main kata →")]),
      createEl("a", { href: "#/games/chess", className: "game-preview" }, [createEl("strong", {}, "♞  Puzzle catur"), createEl("span", {}, "Latih taktik →")]),
    ]),
  ]);
  layout.appendChild(spotlight);
  const newsPreview = spotlight.querySelector("#home-news");
  content.getNews({ limit: 10 }).then(({ results, error }) => {
    newsPreview.replaceChildren();
    if (!results?.length) {
      newsPreview.textContent = error ? "Berita belum tersedia saat ini." : "Belum ada berita untuk ditampilkan.";
      return;
    }
    results.slice(0, 3).forEach((item) => {
      const href = safeExternalUrl(item.url);
      const headline = createEl(href ? "a" : "div", {
        ...(href ? { href } : {}),
        className: "home-news-item",
        ...(href ? { onClick: () => recordNewsView({ ...item, url: href }) } : {}),
      }, [
        createEl("span", {}, `${item.source || "Berita"}${hasViewedNews(href) ? " · Dibaca" : ""}`), createEl("strong", {}, item.title),
      ]);
      if (href) { headline.target = "_blank"; headline.rel = "noopener noreferrer"; }
      newsPreview.appendChild(headline);
    });
  }).catch(() => { newsPreview.textContent = "Berita belum tersedia saat ini."; });

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

function gameLoopCard() {
  const day = calendarDay();
  const sessions = getContinuePlaying();
  const challenges = [
    { game: "sudoku", title: "Sudoku", route: "#/games/sudoku" },
    { game: "crossword", title: "Teka-teki silang", route: "#/games/crossword" },
    { game: "chess", title: "Puzzle catur", route: "#/games/chess" },
  ];
  return createEl("section", { className: "player-summary home-game-loop", "aria-label": "Tantangan dan permainan" }, [
    createEl("div", {}, [
      createEl("span", { className: "section-kicker" }, "TANTANGAN HARI INI"),
      createEl("strong", {}, sessions.length ? "Lanjutkan permainanmu atau pilih tantangan hari ini." : "Satu tantangan kecil untuk hari ini."),
    ]),
    ...challenges.map((challenge) => {
      const status = getDailyStatus(challenge.game, day);
      const label = status === "completed" ? "Selesai ✓" : status === "in-progress" ? "Lanjutkan" : "Mulai";
      return createEl("a", { className: "btn btn-outline btn-sm", href: `${challenge.route}?daily=${day}` }, `${challenge.title}: ${label}`);
    }),
    ...(sessions.length ? [createEl("a", { className: "btn btn-primary btn-sm", href: "#/games" }, "Lanjutkan bermain →")] : []),
  ]);
}

function articleCard(a, reason) {
  const catConf = { technology: "tech", chess: "chess", anime: "anime" }[a.category] || "tech";
  return createEl("article", { className: "card home-article" }, [
    createEl("div", { className: "card-body" }, [
      createEl("div", { className: `badge badge-${catConf}` }, a.category.charAt(0).toUpperCase() + a.category.slice(1)),
      createEl("h3", { style: "margin:var(--space-2) 0" }, a.title),
      createEl("p", { style: "color:var(--color-text-secondary);font-size:var(--text-sm);line-height:var(--leading-relaxed)" }, a.summary),
      createEl("div", { className: "card-meta", style: "margin-top:var(--space-4);display:flex;justify-content:space-between;align-items:center;gap:var(--space-2)" }, [
        createEl("span", { style: "font-size:var(--text-xs);color:var(--color-text-muted)" }, reason || a.readTime + " baca"),
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
function discoverySection({ id, kicker, title, items }) {
  return createEl("section", { className: "home-section" }, [
    createEl("div", { className: "section-header" }, [
      createEl("div", {}, [createEl("span", { className: "section-kicker" }, kicker), createEl("h2", {}, title)]),
      createEl("a", { className: "view-all", href: "#/explore" }, "Lihat semua →"),
    ]),
    createEl("div", { className: "grid-feed", id }, items.map((item) => articleCard(item.article, item.reason))),
  ]);
}

function continueSection(articles) {
  return createEl("section", { className: "continue-section home-section", "aria-label": "Lanjutkan membaca" }, [
    createEl("div", { className: "section-header" }, [
      createEl("div", {}, [createEl("span", { className: "section-kicker" }, "LANJUTKAN MENJELAJAH"), createEl("h2", {}, "Kembali ke yang kamu baca")]),
      createEl("a", { className: "view-all", href: "#/explore" }, "Temukan lebih banyak →"),
    ]),
    createEl("div", { className: "grid-feed" }, articles.map((article) => articleCard(article))),
  ]);
}

function progressSummary(progress) {
  const completed = Object.values(progress.games).reduce((total, game) => total + game.completed, 0);
  if (!progress.streak.current && !completed) return null;
  return createEl("div", { className: "player-summary", "aria-label": "Ringkasan aktivitas permainan" }, [
    createEl("strong", {}, "Aktivitasmu"),
    createEl("span", {}, `🔥 ${progress.streak.current} hari`),
    createEl("span", {}, `🏆 terbaik ${progress.streak.longest}`),
    createEl("span", {}, `🎮 ${completed} selesai`),
  ]);
}
