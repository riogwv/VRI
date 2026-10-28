import { content } from "../../services/content.js";
import { createEl, safeExternalUrl } from "../../utils/dom.js";
import { hasViewedNews, recordNewsView } from "../../services/player-progress.js";

export async function renderNews() {
  const results = createEl("div", { className: "news-grid" }, [
    createEl("p", { className: "news-state" }, "Memuat berita teknologi…"),
  ]);
  const page = createEl("section", { className: "page news-page" }, [
    createEl("div", { className: "container" }, [
      createEl("div", { className: "news-heading" }, [
        createEl("span", { className: "section-kicker" }, "JENDELA INFORMASI"),
        createEl("h1", {}, "Berita teknologi"),
        createEl("p", { className: "game-intro" }, "Ikuti kabar terbaru dari sumber berita eksternal."),
      ]),
      results,
    ]),
  ]);
  results.setAttribute("aria-live", "polite");
  function loadNews() {
    results.replaceChildren(createEl("p", { className: "news-state" }, "Memuat berita teknologi…"));
    content.getNews({ limit: 10 }).then(({ results: items, error }) => {
    results.replaceChildren();
    if (!items?.length) {
      results.appendChild(createEl("div", { className: "news-state" }, [
        createEl("h2", {}, "Berita belum tersedia"),
        createEl("p", {}, error ? "Layanan berita belum dikonfigurasi atau sedang mengalami gangguan. Coba lagi nanti." : "Belum ada berita untuk ditampilkan saat ini."),
        error ? createEl("button", { type: "button", className: "btn btn-primary", onClick: loadNews }, "Coba lagi") : null,
        createEl("a", { className: "btn btn-outline", href: "#/explore" }, "Jelajahi artikel"),
      ]));
      return;
    }
    const shown = new Set();
    items.forEach((item) => {
      const href = safeExternalUrl(item.url);
      const identity = href || `${item.source || ""}:${item.title || ""}`;
      if (shown.has(identity)) return;
      shown.add(identity);
      const link = href ? createEl("a", { className: "btn-link", href, onClick: () => recordNewsView({ ...item, url: href }) }, "Baca di sumber ↗") : null;
      if (link) { link.target = "_blank"; link.rel = "noopener noreferrer"; }
      results.appendChild(createEl("article", { className: "news-card card" }, [
        createEl("div", { className: "news-meta" }, [createEl("span", { className: "badge badge-news" }, "Berita"), createEl("span", {}, `${item.source || "Sumber tidak diketahui"}${hasViewedNews(href) ? " · Dibaca" : ""}`)]),
        createEl("h2", {}, item.title),
        createEl("p", {}, item.summary || "Tidak ada ringkasan tersedia."),
        createEl("div", { className: "news-footer" }, [createEl("span", {}, item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("id-ID") : "Tanggal tidak tersedia"), link]),
      ]));
    });
    }).catch(() => {
      results.replaceChildren(createEl("div", { className: "news-state" }, [
        createEl("h2", {}, "Berita tidak dapat dimuat"),
        createEl("p", {}, "Periksa koneksi Anda, lalu coba lagi."),
        createEl("button", { type: "button", className: "btn btn-primary", onClick: loadNews }, "Coba lagi"),
      ]));
    });
  }
  loadNews();
  return page;
}
