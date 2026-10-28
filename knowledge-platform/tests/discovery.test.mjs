import { expect, test } from "vitest";
import { discoverArticles } from "../src/scripts/services/discovery.js";

const articles = [
  { id: "tech-old", category: "technology", tags: ["cpu"], publishedAt: "2026-01-01" },
  { id: "tech-new", category: "technology", tags: ["chip"], publishedAt: "2026-03-01" },
  { id: "chess", category: "chess", tags: ["tactics", "fork"], publishedAt: "2026-02-01" },
  { id: "science", category: "science", tags: ["space"], publishedAt: "2026-02-15" },
  { id: "anime", category: "anime", tags: ["history"], publishedAt: "2026-02-20" },
  { id: "chess", category: "chess", tags: ["duplicate"], publishedAt: "2026-04-01" },
];
const emptyProgress = { recentContent: [], categoryAffinity: {} };

test("keeps a deterministic, diverse cold-start feed without duplicates", () => {
  const first = discoverArticles(articles, { limit: 4, progress: emptyProgress, bookmarks: [] });
  const second = discoverArticles(articles, { limit: 4, progress: emptyProgress, bookmarks: [] });
  expect(first.map((item) => item.article.id)).toEqual(second.map((item) => item.article.id));
  expect(new Set(first.map((item) => item.article.id)).size).toBe(first.length);
  expect(new Set(first.map((item) => item.article.category)).size).toBeGreaterThan(1);
});

test("uses affinity but reserves room for discovery and penalizes recently viewed content", () => {
  const ranked = discoverArticles(articles, {
    limit: 4,
    progress: { recentContent: [{ id: "tech-old" }], categoryAffinity: { technology: 5 } },
    bookmarks: [{ category: "technology" }],
  });
  expect(ranked[0].article.category).toBe("technology");
  expect(ranked.some((item) => item.article.category !== "technology")).toBe(true);
  expect(ranked.findIndex((item) => item.article.id === "tech-new")).toBeLessThan(ranked.findIndex((item) => item.article.id === "tech-old"));
});

test("uses article context, excludes the current article, and gives a truthful related reason", () => {
  const related = discoverArticles(articles, {
    limit: 3,
    context: { id: "chess", category: "chess", tags: ["tactics", "fork"], related: ["tech-new"] },
    excludeIds: ["chess"],
    progress: emptyProgress,
    bookmarks: [],
  });
  expect(related.map((item) => item.article.id)).not.toContain("chess");
  expect(related[0].article.id).toBe("tech-new");
  expect(related[0].reason).toBe("Terkait dengan artikel ini");
});

test("handles stale IDs and missing metadata without breaking ranking", () => {
  const ranked = discoverArticles([{ id: "plain" }, { id: "other", category: "science" }], {
    progress: { recentContent: [{ id: "deleted" }], categoryAffinity: { science: 1 } },
    bookmarks: [{ category: "science" }],
  });
  expect(ranked.map((item) => item.article.id)).toEqual(["other", "plain"]);
});


test("keeps the Explore modes meaningfully different", () => {
  const progress = { recentContent: [], categoryAffinity: { chess: 5 } };
  const recommended = discoverArticles(articles, { limit: 3, mode: "recommended", progress, bookmarks: [] });
  const recent = discoverArticles(articles, { limit: 3, mode: "recent", progress, bookmarks: [] });
  expect(recommended.map((item) => item.article.id)).not.toEqual(recent.map((item) => item.article.id));
  expect(recent[0].article.id).toBe("tech-new");
});
