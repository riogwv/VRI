import { test, expect, vi } from 'vitest';
import { addRoute, dispatchRoute } from '../src/scripts/router.js';

test('ignores stale routes and disposes their resources', async () => {
  let resolveSlow;
  const dispose = vi.fn();
  const nodes = [];
  const main = { set innerHTML(value) { nodes.length = 0; }, appendChild(node) { nodes.push(node); } };
  globalThis.document = { getElementById: id => id === 'main' ? main : null };
  globalThis.window = { location: { hash: '#/slow' }, scrollTo() {} };
  addRoute('/slow', () => new Promise(resolve => { resolveSlow = resolve; }));
  addRoute('/fast', async () => ({ name: 'fast' }));
  dispatchRoute();
  await Promise.resolve();
  window.location.hash = '#/fast';
  dispatchRoute();
  await new Promise(resolve => setTimeout(resolve, 0));
  resolveSlow({ name: 'stale', dispose });
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(nodes.map(node => node.name)).toEqual(['fast']);
  expect(dispose).toHaveBeenCalledOnce();
});

test('failed routes show an error instead of leaving the page empty', async () => {
  const nodes = [];
  const main = { set innerHTML(value) { nodes.length = 0; }, appendChild(node) { nodes.push(node); } };
  globalThis.document = { getElementById: id => id === 'main' ? main : null, createElement: () => ({}) };
  globalThis.window = { location: { hash: '#/broken' }, scrollTo() {} };
  addRoute('/broken', async () => { throw new Error('test failure'); });
  const logger = vi.spyOn(console, 'error').mockImplementation(() => {});
  dispatchRoute();
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(nodes[0].textContent).toMatch(/gagal dimuat/i);
  logger.mockRestore();
});
