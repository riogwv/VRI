/* ==========================================================================
   Saved / Bookmarks — Supabase-backed (graceful fallback if not configured)
   ========================================================================== */

import { createEl } from "../../utils/dom.js";
import { isAuthenticated, getUser, signOut } from "../../services/auth.js";
import { showToast } from "../../ui/toast.js";

const STORAGE_KEY = "kh_bookmarks";

export async function renderSaved() {
  const page = createEl("section", { className: "page saved-page" }, [
    createEl("div", { className: "container" }, [
      createEl("div", { className: "section-header", style: "margin-bottom:var(--space-6)" }, [
        createEl("h2", {}, "Disimpan"),
      ]),
      createEl("div", { className: "saved-list", id: "saved-list" }),
    ]),
  ]);

  renderSavedList(page.querySelector("#saved-list"));
  return page;
}

function getLocalBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function setLocalBookmarks(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function renderSavedList(container) {
  const marks = getLocalBookmarks();
  container.innerHTML = "";

  if (marks.length === 0) {
    container.appendChild(createEl("div", { className: "empty-state" }, [
      createEl("h3", {}, "Belum ada konten disimpan"),
      createEl("p", {}, "Simpan artikel atau fakta yang Anda sukai untuk dibaca nanti."),
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
            const marks = getLocalBookmarks().filter((x) => x.id !== m.id);
            setLocalBookmarks(marks);
            renderSavedList(document.querySelector("#saved-list"));
            showToast("Dihapus dari simpanan", "info");
          },
        }, [
          createEl("svg", { viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", "stroke-width": "2", style: "width:16px;height:16px" }, [
            createEl("path", { d: "M6 18L18 6M6 6l12 12" }),
          ]),
        ]),
      ]),
      createEl("div", { style: "color:var(--color-text-muted);font-size:var(--text-sm);margin-bottom:var(--space-3)" },
        m.summary || m.explanation || ""),
      createEl("div", { style: "display:flex;gap:var(--space-2)" }, [
        createEl("span", { style: "font-size:var(--text-xs);color:var(--color-text-muted)" }, m.category || "Konten"),
        m.url ? createEl("a", { className: "btn-link", href: m.url, target: "_blank", rel: "noopener" }, "Buka →") : null,
      ]),
    ]),
  ]);
}