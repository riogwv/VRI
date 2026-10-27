import { test, expect, vi } from 'vitest';
const fake = vi.hoisted(() => {
  class Element {
    constructor(tag, props = {}, children = []) { this.tag = tag; this.props = props; this.children = Array.isArray(children) ? children.filter(Boolean) : [children]; this.dataset = {}; this.style = {}; this.handlers = {}; this.classList = { add() {}, remove() {} }; }
    appendChild(child) { this.children.push(child); }
    addEventListener(name, fn) { this.handlers[name] = fn; }
    contains() { return false; }
    set innerHTML(value) { this.children = []; }
    setAttribute() {}
    focus() { this.focused = true; }
    querySelector(selector) {
      if (selector.startsWith('#cw-grid input')) return this.target;
      if (selector.startsWith('input[data-cell')) return null;
      if (selector.startsWith('#')) return this.find(el => el.props.id === selector.slice(1));
      return null;
    }
    querySelectorAll() { return []; }
    find(fn) { if (fn(this)) return this; for (const child of this.children) { const result = child?.find?.(fn); if (result) return result; } return null; }
  }
  return { createEl: (tag, props, children) => new Element(tag, props, children), Element };
});
vi.mock('../src/scripts/utils/dom.js', () => ({ createEl: fake.createEl }));
vi.mock('../src/scripts/services/content.js', () => ({ content: { getCrossword: () => ({ grid: [], size: { rows: 2, cols: 2 }, title: 'Test', across: [{ num: 1, row: 0, col: 0, answer: 'AB', clue: 'A clue' }], down: [] }) } }));
import { renderCrossword } from '../src/scripts/features/crossword/crossword.js';

test('selecting a clue focuses its starting square', async () => {
  vi.stubGlobal('document', { activeElement: null });
  const page = await renderCrossword();
  const target = new fake.Element('input'); page.target = target;
  const clue = page.querySelector('#cw-across').children[0];
  expect(clue.tag).toBe('button');
  clue.props.onClick();
  expect(target.focused).toBe(true);
  vi.unstubAllGlobals();
});
