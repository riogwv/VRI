import { recordSavedContent } from "./player-progress.js";

const STORAGE_KEY = "kh_bookmarks";

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
    return !exists;
  } catch {
    return exists;
  }
}

export function removeBookmark(id) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getBookmarks().filter((item) => item.id !== id)));
  } catch { /* Bookmarks remain optional when browser storage is unavailable. */ }
}
