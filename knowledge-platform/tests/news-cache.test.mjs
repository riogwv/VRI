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

test('simultaneous requests share one fetch and failures can be retried', async () => {
  const { cacheClear } = await import('../src/scripts/services/cache.js');
  cacheClear(); fetchJson.mockReset();
  let finish;
  fetchJson.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  const first = news.fetchTechNews(); const second = news.fetchTechNews();
  expect(fetchJson).toHaveBeenCalledTimes(1);
  finish({ articles: [{ title: 'Shared' }] });
  expect((await first).results).toEqual((await second).results);
  cacheClear();
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  fetchJson.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ articles: [] });
  expect((await news.fetchTechNews()).error).toBe('offline');
  expect((await news.fetchTechNews()).error).toBeUndefined();
  warning.mockRestore();
});
