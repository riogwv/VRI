import { test, expect, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ news: vi.fn() }));
vi.mock('../src/scripts/services/content.js', () => ({ content: { getFunFacts: () => [], getArticles: () => [], getCategories: () => [], getNews: mocks.news } }));
vi.mock('../src/scripts/components/card-grid.js', () => ({ renderCardGrid() {} }));
vi.mock('../src/scripts/utils/dom.js', () => ({ createEl: (tag, props = {}, children = []) => ({
  tag, props, children: Array.isArray(children) ? children.filter(Boolean) : [children], textContent: '',
  appendChild(child) { this.children.push(child); }, replaceChildren() { this.children = []; },
  querySelector(selector) { return this.find(el => el.props?.id === selector.slice(1)); },
  find(fn) { if (fn(this)) return this; for (const child of this.children) { const match = child?.find?.(fn); if (match) return match; } return null; },
}) }));
import { renderHome } from '../src/scripts/features/home/home.js';

test('shows fetched headlines with internal links and game entry points', async () => {
  mocks.news.mockResolvedValueOnce({ results: [{ title: 'Headline', source: 'Example' }] });
  const page = await renderHome();
  await Promise.resolve();
  const news = page.querySelector('#home-news');
  expect(news.children[0].props.href).toBe('#/news');
  expect(news.children[0].children[1].children[0]).toBe('Headline');
  expect(page.find(el => el.props?.href === '#/games/sudoku')).toBeTruthy();
});

test('shows an honest unavailable message when news fails', async () => {
  mocks.news.mockRejectedValueOnce(new Error('offline'));
  const page = await renderHome();
  await Promise.resolve(); await Promise.resolve();
  expect(page.querySelector('#home-news').textContent).toContain('belum tersedia');
});
