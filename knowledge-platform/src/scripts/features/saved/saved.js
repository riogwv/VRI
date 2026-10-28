/* ==========================================================================
   Saved / Bookmarks — stored locally on this device
   ========================================================================== */

import { createEl } from "../../utils/dom.js";
import { getBookmarks, removeBookmark } from "../../services/bookmarks.js";
import { showToast } from "../../ui/toast.js";

export async function renderSaved() {
  const page = createEl("section", { className: "page saved-page" }, [
    createEl("div", { className: "container" }, [
      createEl("div", { className: "section-header", style: "margin-bottom:var(--space-6)" }, [
        createEl("h1", {}, "Disimpan"),
      ]),
      createEl("p", { style: "color:var(--color-text-muted);margin-bottom:var(--space-4)" }, "Simpanan tetap tersedia di perangkat ini dan disinkronkan ke akun saat Anda masuk."),
      createEl("div", { className: "saved-list", id: "saved-list" }),
    ]),
  ]);

  renderSavedList(page.querySelector("#saved-list"));
  return page;
}

function renderSavedList(container) {
  const marks = getBookmarks();
  container.innerHTML = "";

  if (marks.length === 0) {
    container.appendChild(createEl("div", { className: "empty-state" }, [
      createEl("h3", {}, "Belum ada konten disimpan"),
      createEl("p", {}, "Simpan artikel yang Anda sukai untuk dibaca nanti."),
      createEl("a", { className: "btn-primary", href: "#/explore" }, "Jelajahi Konten"),
    ]));
    return;
  }

  marks.forEach((m) => {
    container.appendChild(bookmarkItem(m));
  });
}

function bookmarkItem(m) {
  return createEl("article", { className: "card", style: "padding:var(--space-4)" }, [
    createEl("div", { className: "card-body", style: "padding:0" }, [
      createEl("div", { style: "display:flex;justify-content:space-between;align-items:flex-start;gap:var(--space-2);margin-bottom:var(--space-2)" }, [
        createEl("h3", { style: "margin:0;font-size:var(--text-lg)" }, m.title),
        createEl("button", {
          className: "btn-icon",
          "aria-label": "Hapus dari simpanan",
          onClick: () => {
            try {
              removeBookmark(m.id);
              renderSavedList(document.querySelector("#saved-list"));
              showToast("Dihapus dari simpanan", "info");
            } catch { showToast("Tidak dapat mengubah simpanan di perangkat ini.", "error"); }
          },
        }, "×"),
      ]),
      createEl("div", { style: "color:var(--color-text-muted);font-size:var(--text-sm);margin-bottom:var(--space-3)" },
        m.summary || m.explanation || ""),
      createEl("div", { style: "display:flex;gap:var(--space-2)" }, [
        createEl("span", { style: "font-size:var(--text-xs);color:var(--color-text-muted)" }, m.category || "Konten"),
        typeof m.id === "string" && /^[a-z0-9-]+$/.test(m.id) ? createEl("a", { className: "btn-link", href: `#/article/${m.id}` }, "Buka →") : null,
      ]),
    ]),
  ]);
}