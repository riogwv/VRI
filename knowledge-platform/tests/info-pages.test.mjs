import { test, expect, vi } from 'vitest';
import { renderInfoPage } from '../src/scripts/features/info/info.js';

test('all footer pages render a heading and informative text', async () => {
  const makeElement = (tag) => ({ tag, style: {}, children: [], appendChild(child) { this.children.push(child); } });
  vi.stubGlobal('document', { createElement: makeElement, createTextNode: text => ({ text }) });
  for (const key of ['about', 'sources', 'privacy', 'terms', 'moderation']) {
    const page = await renderInfoPage(key);
    const container = page.children[0];
    expect(container.children[0].tag).toBe('h1');
    expect(container.children[0].children[0].text.length).toBeGreaterThan(0);
    expect(container.children.some(child => child.tag === 'p')).toBe(true);
  }
  vi.unstubAllGlobals();
});
