import { test, expect, vi } from 'vitest';
const source = vi.hoisted(() => ({ getNews: vi.fn() }));
vi.mock('../src/scripts/services/content.js', () => ({ content: source }));
vi.mock('../src/scripts/utils/dom.js', () => ({ safeExternalUrl: (value) => { try { const u = new URL(value); return ['http:', 'https:'].includes(u.protocol) ? u.href : null; } catch { return null; } }, createEl: (tag, props = {}, children = []) => ({
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

test('retry requests news again after an error', async () => {
  source.getNews.mockReset().mockResolvedValueOnce({ results: [], error: 'unavailable' }).mockResolvedValueOnce({ results: [] });
  const page = await renderNews();
  await Promise.resolve();
  const grid = page.children[0].children[1];
  const retry = grid.children[0].children.find(child => child.tag === 'button');
  retry.props.onClick();
  await Promise.resolve();
  expect(source.getNews).toHaveBeenCalledTimes(2);
  expect(grid.children[0].children[1].children[0]).toContain('Belum ada berita');
});
