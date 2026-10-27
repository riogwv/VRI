import { test, expect, vi } from 'vitest';
import { fetchJson } from '../src/scripts/services/api.js';

test('cancels an already aborted request without fetching', async () => {
  const controller = new AbortController();
  controller.abort();
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  await expect(fetchJson('https://example.test', { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
  expect(fetchMock).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});

test('enforces timeout on a retry after a server error', async () => {
  const fetchMock = vi.fn().mockResolvedValueOnce({ ok: false, status: 500, statusText: 'error' })
    .mockImplementationOnce((url, options) => new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))));
  vi.stubGlobal('fetch', fetchMock);
  await expect(fetchJson('https://example.test', { retries: 1, timeout: 20 })).rejects.toMatchObject({ status: 408 });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  vi.unstubAllGlobals();
});
