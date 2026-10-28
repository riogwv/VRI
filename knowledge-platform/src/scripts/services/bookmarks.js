import { recordSavedContent } from "./player-progress.js";

const STORAGE_KEY = "kh_bookmarks";

function schedule(action, value) { import("./cloud-sync.js").then((sync) => action === "remove" ? sync.removeCloudBookmark(value) : sync.syncBookmark(value)).catch(() => {}); }

export function getBookmarks() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : [];
  } catch {
    return [];
  }
}

export function toggleArticleBookmark(article) {
  const marks = getBookmarks();
  const exists = marks.some((item) => item.id === article.id);
  const next = exists ? marks.filter((item) => item.id !== article.id) : [
    ...marks,
    { id: article.id, title: article.title, summary: article.summary, category: article.category, url: `#/article/${article.id}` },
  ];
  try {
    if (!exists) recordSavedContent(article);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    schedule(exists ? "remove" : "save", exists ? article.id : next[next.length - 1]);
    return !exists;
  } catch {
    return exists;
  }
}

export function removeBookmark(id) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getBookmarks().filter((item) => item.id !== id)));
    schedule("remove", id);
  } catch { /* Bookmarks remain optional when browser storage is unavailable. */ }
}

export function setBookmarks(marks) {
  const next = Array.isArray(marks) ? marks.filter((item) => item?.id).slice(0, 100) : [];
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Storage is optional. */ }
  return next;
}
