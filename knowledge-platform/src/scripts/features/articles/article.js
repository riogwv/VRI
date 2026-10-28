/* ==========================================================================
   Article detail page — structured content, TOC, related, bookmark, share
   ========================================================================== */

import { content } from "../../services/content.js";
import { createEl } from "../../utils/dom.js";
import { getBookmarks, toggleArticleBookmark } from "../../services/bookmarks.js";
import { showToast } from "../../ui/toast.js";
import { recordContentView } from "../../services/player-progress.js";
import { discoverArticles } from "../../services/discovery.js";

export async function renderArticle(params) {
  const id = params[0] || params.id;
  const article = content.getArticle(id);

  if (!article) {
    return createEl("section", { className: "page" }, [
      createEl("div", { className: "container" }, [
        createEl("h1", {}, "Artikel tidak ditemukan"),
        createEl("p", {}, "Artikel yang Anda cari tidak tersedia."),
        createEl("a", { className: "btn-primary", href: "#/" }, "Kembali ke Beranda"),
      ]),
    ]);
  }

  recordContentView(article);

  const bookmarkButton = createEl("button", { className: "btn btn-outline", onClick: () => {
    try {
      const saved = toggleArticleBookmark(article);
      bookmarkButton.textContent = saved ? "Hapus dari simpanan" : "Simpan artikel";
      bookmarkButton.setAttribute("aria-pressed", String(saved));
      showToast(saved ? "Artikel disimpan di perangkat ini." : "Artikel dihapus dari simpanan.", "info");
    } catch { showToast("Tidak dapat mengubah simpanan di perangkat ini.", "error"); }
  } }, getBookmarks().some((item) => item.id === article.id) ? "Hapus dari simpanan" : "Simpan artikel");
  bookmarkButton.setAttribute("aria-pressed", String(getBookmarks().some((item) => item.id === article.id)));

  const page = createEl("section", { className: "page article-page" }, [
    createEl("div", { className: "container" }, [
      createEl("nav", { className: "breadcrumbs", "aria-label": "Jejak navigasi" }, [
        createEl("a", { href: "#/explore" }, "Eksplorasi"),
        createEl("span", { text: " / " }),
        createEl("a", { href: `#/category/${article.category}` }, article.category.charAt(0).toUpperCase() + article.category.slice(1)),
        createEl("span", { text: " > " }),
        createEl("span", { text: article.title }),
      ]),
      createEl("article", { className: "card article-reading" }, [
        createEl("div", { className: "card-body article-reading-body" }, [
          createEl("div", { className: "article-header", style: "margin-bottom:var(--space-5)" }, [
            createEl("div", { className: `badge badge-${categoryColor(article.category)}` }, article.category.charAt(0).toUpperCase() + article.category.slice(1)),
            createEl("h1", { style: "margin:var(--space-3) 0;line-height:var(--leading-tight)" }, article.title),
            createEl("p", { style: "color:var(--color-text-secondary);font-size:var(--text-sm)" }, article.summary),
            bookmarkButton,
            createEl("div", { style: "margin-top:var(--space-4);display:flex;gap:var(--space-2);flex-wrap:wrap" }, [
              createEl("span", { style: "font-size:var(--text-xs);color:var(--color-text-muted)" }, article.readTime + " baca"),
              createEl("span", { style: "font-size:var(--text-xs);color:var(--color-text-muted)" }, article.publishedAt),
              article.verified ? createEl("span", { className: "badge badge-source", style: "font-size:var(--text-xs)" }, "Terverifikasi") : null,
            ]),
          ]),
          createEl("div", { className: "article-content", id: "article-content" }),
          createEl("div", { style: "margin-top:var(--space-8);padding-top:var(--space-6);border-top:1px solid var(--color-border)" }, [
            createEl("h3", { style: "margin-bottom:var(--space-3)" }, "Artikel Terkait"),
            createEl("div", { className: "grid-feed", id: "article-related" }),
          ]),
        ]),
      ]),
    ]),
  ]);

  // Render content blocks
  const contentEl = page.querySelector("#article-content");
  article.content.forEach((block) => {
    contentEl.appendChild(renderBlock(block));
  });

  // Related
  const relatedEl = page.querySelector("#article-related");
  const related = discoverArticles(content.getArticles({ limit: Infinity }), { context: article, limit: 4 });
  related.forEach((item) => {
    relatedEl.appendChild(relatedCard(item.article, item.reason));
  });

  return page;
}

function renderBlock(block) {
  if (block.type === "h2") return createEl("h2", { style: "margin:var(--space-6) 0 var(--space-2)" }, block.text);
  if (block.type === "h3") return createEl("h3", { style: "margin:var(--space-5) 0 var(--space-2)" }, block.text);
  if (block.type === "p") return createEl("p", { style: "margin-bottom:var(--space-4);line-height:var(--leading-relaxed)" }, block.text);
  if (block.type === "ul") {
    const ul = createEl("ul", { style: "margin-bottom:var(--space-4);padding-left:var(--space-6)" });
    block.items.forEach((item) => {
      const li = createEl("li", { style: "margin-bottom:var(--space-2);line-height:var(--leading-relaxed)" }, item);
      ul.appendChild(li);
    });
    return ul;
  }
  return createEl("p", {}, block.text || "");
}

function relatedCard(a, reason) {
  return createEl("article", { className: "card", style: "height:100%" }, [
    createEl("div", { className: "card-body" }, [
      createEl("h4", { style: "margin:0 0 var(--space-2)" }, a.title),
      createEl("p", { style: "margin:0 0 var(--space-3);font-size:var(--text-xs);color:var(--color-text-muted)" }, reason),
      createEl("a", { className: "btn-link", href: `#/article/${a.id}` }, "Baca →"),
    ]),
  ]);
}

function categoryColor(cat) {
  return { technology: "tech", chess: "chess", anime: "anime" }[cat] || "tech";
}