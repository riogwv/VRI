import { content } from "../../services/content.js";
import { createEl } from "../../utils/dom.js";

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
  content.getNews({ limit: 10 }).then(({ results: items, error }) => {
    results.replaceChildren();
    if (!items?.length) {
      results.appendChild(createEl("div", { className: "news-state" }, [
        createEl("h2", {}, "Berita belum tersedia"),
        createEl("p", {}, error ? "Layanan berita belum dikonfigurasi atau sedang mengalami gangguan. Coba lagi nanti." : "Belum ada berita untuk ditampilkan saat ini."),
        createEl("a", { className: "btn btn-outline", href: "#/explore" }, "Jelajahi artikel"),
      ]));
      return;
    }
    items.forEach((item) => {
      let link = null;
      try {
        const url = new URL(item.url);
        if (url.protocol === "https:" || url.protocol === "http:") {
          link = createEl("a", { className: "btn-link", href: url.href }, "Baca di sumber ↗");
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
      } catch { /* Invalid external URLs are not displayed. */ }
      results.appendChild(createEl("article", { className: "news-card card" }, [
        createEl("div", { className: "news-meta" }, [createEl("span", { className: "badge badge-news" }, "Berita"), createEl("span", {}, item.source || "Sumber tidak diketahui")]),
        createEl("h2", {}, item.title),
        createEl("p", {}, item.summary || "Tidak ada ringkasan tersedia."),
        createEl("div", { className: "news-footer" }, [createEl("span", {}, item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("id-ID") : "Tanggal tidak tersedia"), link]),
      ]));
    });
  }).catch(() => {
    results.textContent = "Berita tidak dapat dimuat. Coba lagi nanti.";
  });
  return page;
}
