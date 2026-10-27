import { test, expect, vi } from 'vitest';
import { getBookmarks, toggleArticleBookmark, removeBookmark } from '../src/scripts/services/bookmarks.js';

test('article bookmarks persist, toggle, and can be removed', () => {
  let saved = null;
  vi.stubGlobal('localStorage', { getItem: () => saved, setItem: (key, value) => { saved = value; } });
  const article = { id: 'intro', title: 'Intro', summary: 'Summary', category: 'technology' };
  expect(toggleArticleBookmark(article)).toBe(true);
  expect(getBookmarks()).toMatchObject([{ id: 'intro', url: '#/article/intro' }]);
  expect(toggleArticleBookmark(article)).toBe(false);
  expect(getBookmarks()).toEqual([]);
  toggleArticleBookmark(article);
  removeBookmark('intro');
  expect(getBookmarks()).toEqual([]);
  vi.unstubAllGlobals();
});

test('invalid stored values do not crash readers', () => {
  vi.stubGlobal('localStorage', { getItem: () => '{bad' });
  expect(getBookmarks()).toEqual([]);
  vi.unstubAllGlobals();
});
