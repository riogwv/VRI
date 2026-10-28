/* ==========================================================================
   Search results — local search across seed content
   ========================================================================== */

import { content } from "../../services/content.js";
import { createEl } from "../../utils/dom.js";
import { setSearchQuery } from "../../ui/global-search.js";

export async function renderSearch() {
  const urlParams = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const q = urlParams.get("q") || "";

  setSearchQuery(q);

  const page = createEl("section", { className: "page search-page" }, [
    createEl("div", { className: "container" }, [
      createEl("div", { className: "section-header", style: "margin-bottom:var(--space-6)" }, [
        createEl("h1", {}, "Hasil Pencarian"),
        createEl("span", { style: "font-size:var(--text-sm);color:var(--color-text-muted);margin-left:auto" }, q ? `"${q}"` : ""),
      ]),
      createEl("div", { className: "search-results", id: "search-results" }),
    ]),
  ]);

  const resultsEl = page.querySelector("#search-results");
  if (!q) {
    resultsEl.appendChild(createEl("div", { className: "empty-state" }, [
      createEl("h3", {}, "Masukkan kata kunci pencarian"),
      createEl("p", {}, "Cari artikel, fakta, trivia, dan lebih banyak."),
    ]));
    return page;
  }

  const results = content.search(q);
  if (results.length === 0) {
    resultsEl.appendChild(createEl("div", { className: "empty-state" }, [
      createEl("h3", {}, "Tidak ditemukan hasil untuk \"" + q + "\""),
      createEl("p", {}, "Coba kata kunci lain atau jelajahi kategori utama."),
      createEl("a", { className: "btn-primary", href: "#/explore", style: "margin-top:var(--space-3)" }, "Lihat Semua Konten"),
    ]));
    return page;
  }

  results.forEach((r) => {
    resultsEl.appendChild(searchResultItem(r));
  });

  return page;
}

function searchResultItem(r) {
  const item = r.item;
  const catConf = { technology: "tech", chess: "chess", anime: "anime", games: "games" }[item.category] || "tech";
  const badge = item.category ? createEl("span", { className: `badge badge-${catConf}` }, item.category.charAt(0).toUpperCase() + item.category.slice(1)) : null;

  return createEl("article", { className: "card", style: "padding:var(--space-4)" }, [
    createEl("div", { className: "card-body", style: "padding:0" }, [
      createEl("div", { style: "display:flex;justify-content:space-between;align-items:flex-start;gap:var(--space-2);margin-bottom:var(--space-2)" }, [
        createEl("h3", { style: "margin:0;font-size:var(--text-lg)" }, item.title || item.statement || item.question),
        badge,
      ]),
      createEl("div", { style: "color:var(--color-text-muted);font-size:var(--text-sm);margin-bottom:var(--space-3);line-height:var(--leading-relaxed)" },
        item.summary || item.explanation || ""),
      createEl("div", { style: "display:flex;gap:var(--space-2)" }, [
        createEl("span", { style: "font-size:var(--text-xs);color:var(--color-text-muted)" }, r.type === "article" ? "Artikel" : r.type === "fun-fact" ? "Fun Fact" : "Trivia"),
        r.type === "article" ? createEl("a", { className: "btn-link", href: `#/article/${item.id}` }, "Lihat →") : null,
      ]),
    ]),
  ]);
}