import { test, expect, vi } from 'vitest';
vi.mock('../src/scripts/router.js', () => ({ navigate: vi.fn() }));
import { initSearch } from '../src/scripts/ui/global-search.js';
import { navigate } from '../src/scripts/router.js';

test('submitting search cancels pending debounce navigation', () => {
  vi.useFakeTimers();
  const handlers = {}, formHandlers = {};
  const form = { addEventListener(name, fn) { formHandlers[name] = fn; } };
  const input = { value: 'chess', closest: () => form, addEventListener(name, fn) { handlers[name] = fn; } };
  globalThis.document = { getElementById: () => input };
  initSearch(); handlers.input(); formHandlers.submit({ preventDefault() {} });
  vi.runAllTimers();
  expect(navigate).toHaveBeenCalledTimes(1);
  vi.useRealTimers();
});
