import { test, expect, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ news: vi.fn(), articles: vi.fn() }));
vi.mock('../src/scripts/services/content.js', () => ({ content: { getFunFacts: () => [], getArticles: mocks.articles, getCategories: () => [], getNews: mocks.news } }));
vi.mock('../src/scripts/components/card-grid.js', () => ({ renderCardGrid() {} }));
vi.mock('../src/scripts/utils/dom.js', () => ({ safeExternalUrl: (value) => { try { const u = new URL(value); return ['http:', 'https:'].includes(u.protocol) ? u.href : null; } catch { return null; } }, createEl: (tag, props = {}, children = []) => ({
  tag, props, children: Array.isArray(children) ? children.filter(Boolean) : [children], textContent: '',
  appendChild(child) { this.children.push(child); }, replaceChildren() { this.children = []; },
  querySelector(selector) { return this.find(el => el.props?.id === selector.slice(1)); },
  find(fn) { if (fn(this)) return this; for (const child of this.children) { const match = child?.find?.(fn); if (match) return match; } return null; },
}) }));
import { renderHome } from '../src/scripts/features/home/home.js';

test('shows fetched headlines with safe external links and game entry points', async () => {
  mocks.news.mockResolvedValueOnce({ results: [{ title: 'Headline', source: 'Example', url: 'https://example.test/story' }] });
  const page = await renderHome();
  await Promise.resolve();
  const news = page.querySelector('#home-news');
  expect(news.children[0].props.href).toBe('https://example.test/story');
  expect(news.children[0].children[1].children[0]).toBe('Headline');
  expect(page.find(el => el.props?.href === '#/games/sudoku')).toBeTruthy();
});

test('shows an honest unavailable message when news fails', async () => {
  mocks.news.mockRejectedValueOnce(new Error('offline'));
  const page = await renderHome();
  await Promise.resolve(); await Promise.resolve();
  expect(page.querySelector('#home-news').textContent).toContain('belum tersedia');
});

test('unsafe headline URLs are not links', async () => {
  mocks.news.mockResolvedValueOnce({ results: [{ title: 'Unsafe', url: 'javascript:alert(1)' }] });
  const page = await renderHome(); await Promise.resolve();
  expect(page.querySelector('#home-news').children[0].tag).toBe('div');
});


test('shows Continue Exploring after a visitor has opened local content', async () => {
  vi.stubGlobal('localStorage', {
    getItem: () => JSON.stringify({
      version: 1,
      recentContent: [{ id: 'saved-article', title: 'Saved article', category: 'chess', viewedAt: '2026-10-01' }],
      recentNews: [], categoryAffinity: { chess: 1 }, streak: { current: 0, longest: 0, lastActiveDay: null },
      games: { chess: { played: 0, completed: 0, lastCompletionSession: null }, sudoku: { played: 0, completed: 0, lastCompletionSession: null }, crossword: { played: 0, completed: 0, lastCompletionSession: null } },
    }),
    setItem() {}, removeItem() {},
  });
  mocks.articles.mockReturnValue([{ id: 'saved-article', title: 'Saved article', category: 'chess', summary: '', readTime: '1 menit' }]);
  mocks.news.mockResolvedValueOnce({ results: [] });
  const page = await renderHome();
  expect(page.find(el => el.props?.['aria-label'] === 'Lanjutkan membaca')).toBeTruthy();
  vi.unstubAllGlobals();
});
