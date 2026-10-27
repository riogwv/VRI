import { test, expect, vi } from 'vitest';

const fake = vi.hoisted(() => {
  class Element {
    constructor(tag = 'div') { this.tagName = tag.toUpperCase(); this.children = []; this.style = {}; this.dataset = {}; this.attributes = {}; this.handlers = {}; this.isConnected = true; this.className = ''; this._html = ''; this.classList = { toggle() {}, add() {}, remove() {} }; }
    set innerHTML(value) { this._html = value; this.children = []; }
    get innerHTML() { return this._html; }
    appendChild(child) { this.children.push(child); return child; }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    addEventListener(name, fn) { this.handlers[name] = fn; }
    contains(el) { return this.children.includes(el); }
    focus() { document.activeElement = this; }
    querySelector(selector) {
      const match = selector.match(/^\[data-row="(\d+)"\]\[data-col="(\d+)"\]$/);
      if (match) return this.children.find(child => String(child.dataset.row) === match[1] && String(child.dataset.col) === match[2]);
      return this.nodes?.[selector] || null;
    }
    querySelectorAll(selector) { return selector === '.num-btn' ? this.buttons : []; }
  }
  function createEl(tag, props = {}) {
    const el = new Element(tag);
    el.className = props.className || '';
    if (props.onClick) el.handlers.click = props.onClick;
    if (props['aria-label']) el.setAttribute('aria-label', props['aria-label']);
    if (props.className === 'page sudoku-page') {
      el.nodes = {};
      for (const id of ['sudoku-board','sudoku-diff','sudoku-new','sudoku-hint','sudoku-undo','sudoku-reset','sudoku-check','sudoku-timer','sudoku-mistakes','sudoku-hints','sudoku-message']) el.nodes['#' + id] = new Element();
      el.buttons = Array.from({ length: 9 }, (_, i) => { const b = new Element('button'); b.dataset.num = String(i + 1); return b; });
      const clear = new Element('button'); clear.dataset.num = '0';
      const candidate = new Element('button'); candidate.dataset.mode = 'candidate';
      el.buttons.push(clear, candidate);
    }
    return el;
  }
  return { createEl, Element };
});
vi.mock('../src/scripts/utils/dom.js', () => ({ createEl: fake.createEl }));
import { renderSudoku, state } from '../src/scripts/features/sudoku/sudoku.js';

test('selecting a cell shows selection, keeps focus and highlights related cells', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('document', { activeElement: null, addEventListener() {}, removeEventListener() {} });
  const page = await renderSudoku();
  const board = page.querySelector('#sudoku-board');
  const row = state.fixed.findIndex(line => line.includes(false));
  const col = state.fixed[row].indexOf(false);
  const cell = board.children[row * 9 + col];
  cell.focus();
  cell.handlers.click();
  const selected = board.children[row * 9 + col];
  expect(selected.className).toContain('selected');
  expect(selected.attributes['aria-pressed']).toBe('true');
  expect(document.activeElement).toBe(selected);
  expect(board.children[row * 9 + ((col + 1) % 9)].className).toContain('peer');
  page.buttons[0].handlers.click();
  expect(state.grid[row][col]).toBe(1);
  page.dispose();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test('finishing the last cell marks the puzzle complete without pressing check', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('document', { activeElement: null, addEventListener() {}, removeEventListener() {} });
  const page = await renderSudoku();
  const row = state.fixed.findIndex(line => line.includes(false));
  const col = state.fixed[row].indexOf(false);
  state.grid = state.solution.map(line => [...line]);
  state.grid[row][col] = 0;
  const board = page.querySelector('#sudoku-board');
  board.children[row * 9 + col].handlers.click();
  page.buttons[state.solution[row][col] - 1].handlers.click();
  expect(state.completed).toBe(true);
  expect(page.querySelector('#sudoku-message').textContent).toContain('Selamat');
  page.dispose();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test('hint selects the filled cell and conflicting numbers explain the problem', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('document', { activeElement: null, addEventListener() {}, removeEventListener() {} });
  const page = await renderSudoku();
  state.grid = state.solution.map(line => [...line]);
  state.fixed[0][0] = false; state.fixed[0][1] = false;
  state.grid[0][0] = 0; state.grid[0][1] = 0;
  page.querySelector('#sudoku-hint').handlers.click();
  expect(page.querySelector('#sudoku-board').children[0].className).toContain('selected');
  const duplicate = state.grid[0][0];
  page.querySelector('#sudoku-board').children[1].handlers.click();
  page.buttons[duplicate - 1].handlers.click();
  expect(page.querySelector('#sudoku-message').textContent).toContain('bertentangan');
  page.dispose(); vi.useRealTimers(); vi.unstubAllGlobals();
});

test('keyboard entry reports a conflict', async () => {
  vi.useFakeTimers();
  const handlers = {};
  vi.stubGlobal('document', { activeElement: null, addEventListener(name, fn) { handlers[name] = fn; }, removeEventListener() {} });
  const page = await renderSudoku();
  state.grid = state.solution.map(line => [...line]);
  state.fixed[0][1] = false;
  state.grid[0][1] = 0;
  page.querySelector('#sudoku-board').children[1].handlers.click();
  handlers.keydown({ key: String(state.grid[0][0]), preventDefault() {} });
  expect(page.querySelector('#sudoku-message').textContent).toContain('bertentangan');
  page.dispose(); vi.useRealTimers(); vi.unstubAllGlobals();
});
