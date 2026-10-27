import { test, expect, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ get: vi.fn(), toast: vi.fn() }));
vi.mock('../src/scripts/services/content.js', () => ({ content: { getChessPuzzle: mocks.get, getChessPuzzlesSeed: () => [{ id: 'one', fen: '6k1/5ppp/8/8/8/8/8/R6K w - - 0 1', moves: ['a1a8'] }, { id: 'two', fen: 'k7/2K5/8/8/8/8/8/1Q6 w - - 0 1', moves: ['b1b8'] }] } }));
vi.mock('../src/scripts/ui/toast.js', () => ({ showToast: mocks.toast }));
vi.mock('../src/scripts/utils/dom.js', () => {
  class El {
    constructor(tag, props = {}, children = []) { this.tag = tag; this.props = props; this.children = Array.isArray(children) ? children.filter(Boolean) : [children]; this.dataset = {}; this.style = {}; this.handlers = {}; this.classList = { contains: name => (this.props.className || '').split(' ').includes(name) }; for (const c of this.children) if (c && typeof c === 'object') c.parentElement = this; }
    appendChild(child) { child.parentElement = this; this.children.push(child); }
    append(...children) { children.forEach(child => this.appendChild(child)); }
    replaceChildren(...children) { this.children = []; this.append(...children); }
    set innerHTML(value) { this.children = []; }
    addEventListener(name, fn) { this.handlers[name] = fn; }
    setAttribute(name, value) { this[name] = String(value); }
    contains(el) { return !!this.find(x => x === el); }
    find(fn) { if (fn(this)) return this; for (const child of this.children) { const result = child?.find?.(fn); if (result) return result; } return null; }
    querySelector(selector) { const sq = selector.match(/\[data-sq="([^"]+)"\]/); if (sq) return this.find(x => x.dataset.sq === sq[1]); if (selector.startsWith('#')) return this.find(x => x.props.id === selector.slice(1)); if (selector === '.container') return this.find(x => x.props.className === 'container'); return null; }
    querySelectorAll(selector) { return selector.includes("#chess-") ? ["chess-hint", "chess-reset", "chess-next"].map(id => this.querySelector(`#${id}`)) : []; }
    closest(selector) { let el = this; while (el) { if (selector === '.chess-page' && el.classList.contains('chess-page')) return el; el = el.parentElement; } return null; }
    focus() { document.activeElement = this; }
  }
  return { createEl: (tag, props, children) => new El(tag, props, children) };
});
import { renderChess } from '../src/scripts/features/chess/chess.js';

async function flush() { for (let i = 0; i < 5; i++) await Promise.resolve(); }

test('selection shows legal destinations; invalid moves and puzzle completion give feedback', async () => {
  vi.stubGlobal('document', { activeElement: null });
  mocks.get.mockResolvedValue(null);
  vi.spyOn(Math, 'random').mockReturnValue(0);
  const page = await renderChess(); await flush();
  const board = page.querySelector('#chess-board');
  board.querySelector('[data-sq="a1"]').props.onClick();
  expect(board.querySelector('[data-sq="a1"]').props.className).toContain('selected');
  expect(board.querySelector('[data-sq="a8"]').props.className).toContain('legal-target');
  board.querySelector('[data-sq="b2"]').props.onClick();
  expect(page.querySelector('#chess-status').textContent).toContain('ilegal');
  board.querySelector('[data-sq="a1"]').props.onClick();
  board.querySelector('[data-sq="a8"]').props.onClick();
  expect(page.querySelector('#chess-status').textContent).toContain('selesai');
  vi.restoreAllMocks(); vi.unstubAllGlobals();
});

test('next puzzle blocks old board while loading and picks a different local puzzle', async () => {
  vi.stubGlobal('document', { activeElement: null });
  mocks.get.mockReset().mockResolvedValueOnce(null);
  vi.spyOn(Math, 'random').mockReturnValue(0);
  const page = await renderChess(); await flush();
  const board = page.querySelector('#chess-board');
  let resolve; mocks.get.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
  page.querySelector('#chess-next').handlers.click();
  board.querySelector('[data-sq="a1"]').props.onClick();
  expect(board['aria-busy']).toBe('true');
  expect(page.querySelector('#chess-next').disabled).toBe(true);
  expect(page.querySelector('#chess-status').textContent).toContain('Menyiapkan');
  resolve(null); await flush();
  expect(board['aria-busy']).toBe('false');
  expect(page.querySelector('#chess-next').disabled).toBe(false);
  expect(board.querySelector('[data-sq="b1"]').textContent).toBe('♕');
  vi.restoreAllMocks(); vi.unstubAllGlobals();
});
