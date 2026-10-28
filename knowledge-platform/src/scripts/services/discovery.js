import { getBookmarks } from "./bookmarks.js";
import { getPlayerProgress } from "./player-progress.js";

export const DISCOVERY_WEIGHTS = {
  categoryAffinity: 2,
  savedCategory: 3,
  unseen: 3,
  recentlyViewed: -4,
  fresh: 2,
  contextCategory: 3,
  sharedTag: 2,
  linkedFromContext: 5,
  exploreOutsidePreference: 3,
};

const CATEGORY_LABELS = {
  technology: "Teknologi",
  science: "Sains",
  chess: "Catur",
  anime: "Anime",
};

export function discoverArticles(articles, {
  limit = 4,
  mode = "recommended",
  context = null,
  excludeIds = [],
  progress = getPlayerProgress(),
  bookmarks = getBookmarks(),
} = {}) {
  if (!Array.isArray(articles) || limit < 1) return [];

  const excluded = new Set(excludeIds);
  if (context?.id) excluded.add(context.id);
  const candidates = uniqueArticles(articles).filter((article) => !excluded.has(article.id));
  const seen = new Set((progress?.recentContent || []).map((item) => item.id));
  const affinity = progress?.categoryAffinity || {};
  const savedCategories = categoryCounts(bookmarks);
  const dominantCategory = preferredCategory(affinity, savedCategories);
  const newestDate = newestPublishedAt(candidates);

  const ranked = candidates.map((article, index) => {
    const scored = scoreArticle(article, { affinity, savedCategories, seen, newestDate, context, mode, dominantCategory });
    return { article, index, ...scored };
  }).sort((a, b) => b.score - a.score || a.index - b.index);

  if (mode === "recent") return ranked.slice(0, limit).map((entry) => ({ article: entry.article, score: entry.score, reason: reasonFor(entry, { dominantCategory }) }));
  return selectDiverse(ranked, limit, {
    dominantCategory,
    reserveExploration: mode === "recommended" || mode === "explore",
  });
}

function uniqueArticles(articles) {
  const ids = new Set();
  return articles.filter((article) => {
    if (!article?.id || ids.has(article.id)) return false;
    ids.add(article.id);
    return true;
  });
}

function categoryCounts(bookmarks) {
  return (Array.isArray(bookmarks) ? bookmarks : []).reduce((counts, item) => {
    if (typeof item?.category === "string") counts[item.category] = (counts[item.category] || 0) + 1;
    return counts;
  }, {});
}

function preferredCategory(affinity, savedCategories) {
  const categories = new Set([...Object.keys(affinity || {}), ...Object.keys(savedCategories || {})]);
  return [...categories].sort((a, b) => (
    ((affinity[b] || 0) + (savedCategories[b] || 0)) - ((affinity[a] || 0) + (savedCategories[a] || 0)) || a.localeCompare(b)
  ))[0] || null;
}

function newestPublishedAt(articles) {
  return articles.reduce((newest, article) => Math.max(newest, dateValue(article.publishedAt)), 0);
}

function dateValue(value) {
  const timestamp = Date.parse(value || "");
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function scoreArticle(article, { affinity, savedCategories, seen, newestDate, context, mode, dominantCategory }) {
  let score = 0;
  const reasons = [];
  const affinityScore = Math.min(affinity[article.category] || 0, 5) * DISCOVERY_WEIGHTS.categoryAffinity;
  if (affinityScore) {
    score += affinityScore;
    reasons.push("affinity");
  }
  const savedScore = Math.min(savedCategories[article.category] || 0, 2) * DISCOVERY_WEIGHTS.savedCategory;
  if (savedScore) {
    score += savedScore;
    reasons.push("saved");
  }
  if (seen.has(article.id)) score += DISCOVERY_WEIGHTS.recentlyViewed;
  else {
    score += DISCOVERY_WEIGHTS.unseen;
    reasons.push("unseen");
  }
  if (newestDate && dateValue(article.publishedAt) === newestDate) {
    score += DISCOVERY_WEIGHTS.fresh;
    reasons.push("fresh");
  }
  if (context) {
    if (article.category && article.category === context.category) {
      score += DISCOVERY_WEIGHTS.contextCategory;
      reasons.push("context-category");
    }
    const sharedTags = tagOverlap(article.tags, context.tags);
    if (sharedTags) {
      score += sharedTags * DISCOVERY_WEIGHTS.sharedTag;
      reasons.push("shared-tags");
    }
    if (Array.isArray(context.related) && context.related.includes(article.id)) {
      score += DISCOVERY_WEIGHTS.linkedFromContext;
      reasons.push("linked");
    }
  }
  if (mode === "explore" && dominantCategory && article.category !== dominantCategory) {
    score += DISCOVERY_WEIGHTS.exploreOutsidePreference;
    reasons.push("explore");
  }
  if (mode === "recent") score = dateValue(article.publishedAt) || score;
  return { score, reasons };
}

function tagOverlap(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return 0;
  const tags = new Set(a.map((tag) => String(tag).toLowerCase()));
  return b.filter((tag) => tags.has(String(tag).toLowerCase())).length;
}

function selectDiverse(ranked, limit, { dominantCategory, reserveExploration }) {
  const pool = ranked.slice();
  const selected = [];
  const categoryCounts = {};
  let lastCategory = null;

  while (pool.length && selected.length < limit) {
    const alternatives = pool.filter((entry) => entry.article.category !== lastCategory && (categoryCounts[entry.article.category] || 0) < 2);
    const choice = alternatives[0] || pool[0];
    pool.splice(pool.indexOf(choice), 1);
    selected.push(choice);
    categoryCounts[choice.article.category] = (categoryCounts[choice.article.category] || 0) + 1;
    lastCategory = choice.article.category;
  }

  if (reserveExploration && dominantCategory && selected.length > 2 && !selected.some((entry) => entry.article.category !== dominantCategory)) {
    const outside = ranked.find((entry) => entry.article.category !== dominantCategory);
    if (outside) selected[selected.length - 1] = outside;
  }

  return uniqueArticles(selected.map((entry) => entry.article)).map((article) => {
    const entry = ranked.find((candidate) => candidate.article.id === article.id);
    return { article, score: entry.score, reason: reasonFor(entry, { dominantCategory }) };
  });
}

function reasonFor(entry, { dominantCategory }) {
  const { article, reasons } = entry;
  const label = CATEGORY_LABELS[article.category] || article.category;
  if (reasons.includes("linked")) return "Terkait dengan artikel ini";
  if (reasons.includes("shared-tags") || reasons.includes("context-category")) return "Topik serupa";
  if (reasons.includes("saved")) return `Karena kamu menyimpan artikel ${label}`;
  if (reasons.includes("affinity")) return `Karena minatmu pada ${label}`;
  if (reasons.includes("explore") && article.category !== dominantCategory) return `Jelajahi ${label}`;
  if (reasons.includes("fresh")) return `Artikel terbaru di ${label}`;
  return "Belum kamu jelajahi";
}
