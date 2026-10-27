import { test, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function createHandler(fetch) {
  let handler;
  const code = readFileSync(new URL('../backend/api/news/index.js', import.meta.url), 'utf8')
    .replace(/^import .*;\s*$/gm, '');
  const context = { serve: fn => { handler = fn; }, Deno: { env: { get: () => 'example-secret' } }, URL, Response, fetch };
  vm.runInNewContext(code, context);
  return handler;
}

test('rejects methods and invalid input before calling upstream', async () => {
  const fetch = vi.fn();
  const handle = createHandler(fetch);
  expect((await handle(new Request('https://example.test/', { method: 'POST' }))).status).toBe(405);
  expect((await handle(new Request('https://example.test/?max=999'))).status).toBe(400);
  expect((await handle(new Request('https://example.test/?category=other'))).status).toBe(400);
  expect(fetch).not.toHaveBeenCalled();
});

test('upstream failure cannot expose error details or the API key', async () => {
  const handle = createHandler(vi.fn(async () => { throw new Error('example-secret'); }));
  const response = await handle(new Request('https://example.test/'));
  expect(response.status).toBe(502);
  expect(await response.text()).not.toContain('example-secret');
  expect(response.headers.get('access-control-allow-origin')).toBe('*');
});
