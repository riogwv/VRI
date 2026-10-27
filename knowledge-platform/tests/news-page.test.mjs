import { test, expect, vi } from 'vitest';
const source = vi.hoisted(() => ({ getNews: vi.fn() }));
vi.mock('../src/scripts/services/content.js', () => ({ content: source }));
vi.mock('../src/scripts/utils/dom.js', () => ({ createEl: (tag, props = {}, children = []) => ({
  tag, props, children: Array.isArray(children) ? children.filter(Boolean) : [children],
  setAttribute() {}, replaceChildren() { this.children = []; }, appendChild(item) { this.children.push(item); },
}) }));
import { renderNews } from '../src/scripts/features/news/news.js';

test('shows a clear unavailable state when news cannot load', async () => {
  source.getNews.mockResolvedValue({ results: [], error: 'unavailable' });
  const page = await renderNews();
  await Promise.resolve();
  const grid = page.children[0].children[1];
  expect(grid.children[0].children[0].children[0]).toBe('Berita belum tersedia');
});

test('never turns unsafe external URLs into links', async () => {
  source.getNews.mockResolvedValue({ results: [{ title: 'News', source: 'Example', url: 'javascript:alert(1)' }] });
  const page = await renderNews();
  await Promise.resolve();
  const footer = page.children[0].children[1].children[0].children[3];
  expect(footer.children.some(child => child.tag === 'a')).toBe(false);
});
