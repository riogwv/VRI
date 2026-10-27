import { test, expect, vi } from 'vitest';
const fake = vi.hoisted(() => {
  class El {
    constructor(tag, props = {}, children = []) { this.tag = tag; this.props = props; this.children = Array.isArray(children) ? children.filter(Boolean) : [children]; this.dataset = {}; this.style = {}; this.handlers = {}; this.classes = new Set(); this.classList = { toggle: (name, on) => on ? this.classes.add(name) : this.classes.delete(name) }; }
    appendChild(child) { this.children.push(child); }
    addEventListener(name, fn) { this.handlers[name] = fn; }
    setAttribute(name, value) { this[name] = String(value); }
    set innerHTML(value) { this.children = []; }
    contains(el) { return !!this.find(x => x === el); }
    find(fn) { if (fn(this)) return this; for (const child of this.children) { const result = child?.find?.(fn); if (result) return result; } return null; }
    all(fn) { return [ ...(fn(this) ? [this] : []), ...this.children.flatMap(child => child?.all?.(fn) || []) ]; }
    querySelector(selector) {
      const cell = selector.match(/input\[data-cell="([^"]+)"\]/);
      if (cell) return this.find(x => x.tag === 'input' && x.dataset.cell === cell[1]);
      if (selector.startsWith('#')) return this.find(x => x.props.id === selector.slice(1));
      return null;
    }
    querySelectorAll(selector) { return this.all(x => (x.props.className || '').split(' ').includes(selector.slice(1))); }
    focus() { document.activeElement = this; this.handlers.focus?.(); }
    dispatchEvent(event) { this.handlers[event.type]?.(event); }
  }
  return { createEl: (tag, props, children) => new El(tag, props, children) };
});
vi.mock('../src/scripts/utils/dom.js', () => ({ createEl: fake.createEl }));
vi.mock('../src/scripts/services/content.js', () => ({ content: { getCrossword: () => ({ grid: [], size: { rows: 3, cols: 3 }, title: 'Test', across: [{ num: 1, row: 0, col: 0, answer: 'AB', clue: 'Across' }], down: [{ num: 1, row: 0, col: 0, answer: 'AC', clue: 'Down' }] }) } }));
import { renderCrossword } from '../src/scripts/features/crossword/crossword.js';

test('down clue selects the word and typing advances downward', async () => {
  vi.stubGlobal('document', { activeElement: null });
  const page = await renderCrossword();
  const clue = page.querySelector('#cw-down').children[0];
  clue.props.onClick();
  const grid = page.querySelector('#cw-grid');
  const start = grid.querySelector('input[data-cell="0,0"]');
  expect(page.querySelector('#cw-direction').textContent).toBe('Menurun 1');
  expect(grid.children[3].classes.has('word-active')).toBe(true);
  expect(clue['aria-pressed']).toBe('true');
  start.value = 'a'; start.handlers.input({ target: start });
  expect(document.activeElement.dataset.cell).toBe('1,0');
  vi.unstubAllGlobals();
});

test('space changes direction at a crossing', async () => {
  vi.stubGlobal('document', { activeElement: null });
  const page = await renderCrossword();
  page.querySelector('#cw-across').children[0].props.onClick();
  const start = page.querySelector('#cw-grid').querySelector('input[data-cell="0,0"]');
  start.handlers.keydown({ key: ' ', preventDefault() {} });
  expect(page.querySelector('#cw-direction').textContent).toBe('Menurun 1');
  vi.unstubAllGlobals();
});
