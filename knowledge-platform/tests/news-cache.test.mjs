import { test, expect, vi } from 'vitest';
vi.mock('../src/scripts/config.js', () => ({ CONFIG: { api: { edgeFunction: 'https://example.test' }, cache: { ttlNews: 60000 } } }));
vi.mock('../src/scripts/services/api.js', () => ({ fetchJson: vi.fn(async () => ({ articles: [{ title: 'News', url: 'https://example.test/item' }] })) }));
import { news } from '../src/scripts/api/news.js';
import { fetchJson } from '../src/scripts/services/api.js';

test('cache hits preserve the response envelope and results', async () => {
  const first = await news.fetchTechNews();
  const second = await news.fetchTechNews();
  expect(first.fromCache).toBe(false);
  expect(second.fromCache).toBe(true);
  expect(second.results).toEqual(first.results);
  expect(fetchJson).toHaveBeenCalledTimes(1);
});
