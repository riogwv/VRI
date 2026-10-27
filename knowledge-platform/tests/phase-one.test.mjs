import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createEl } from '../src/scripts/utils/dom.js';
import { initNav } from '../src/scripts/ui/nav.js';

function element() {
  const attributes = {};
  const handlers = {};
  const classes = new Set();
  return {
    attributes, style: {}, handlers,
    classList: {
      toggle(name, active) { if (active) classes.add(name); else classes.delete(name); },
      remove(name) { classes.delete(name); },
      contains(name) { return classes.has(name); },
    },
    setAttribute(key, value) { attributes[key] = String(value); },
    getAttribute(key) { return attributes[key]; },
    addEventListener(name, handler) { handlers[name] = handler; },
    appendChild() {},
  };
}

test('input attributes retain password masking and crossword state', () => {
  globalThis.document = { createElement: element };
  const password = createEl('input', { type: 'password', placeholder: 'Kata sandi', autocomplete: 'current-password' });
  assert.equal(password.attributes.type, 'password');
  assert.equal(password.attributes.placeholder, 'Kata sandi');
  assert.equal(password.attributes.autocomplete, 'current-password');
  const letter = createEl('input', { type: 'text', maxlength: 1, value: 'A' });
  assert.equal(letter.attributes.maxlength, '1');
  assert.equal(letter.attributes.value, 'A');
});

test('mobile navigation opens, closes on selection, and does not hide desktop nav', () => {
  const toggle = element();
  const nav = element();
  const home = element();
  home.setAttribute('href', '#');
  nav.querySelectorAll = () => [home];
  globalThis.document = { querySelector: () => toggle, getElementById: () => nav };
  globalThis.window = { location: { hash: '' }, addEventListener() {} };
  initNav();
  assert.equal(home.classList.contains('active'), true);
  toggle.handlers.click();
  assert.equal(toggle.attributes['aria-expanded'], 'true');
  assert.equal(nav.classList.contains('is-open'), true);
  home.handlers.click();
  assert.equal(toggle.attributes['aria-expanded'], 'false');
  assert.equal(nav.classList.contains('is-open'), false);
  assert.equal('hidden' in nav, false);
  assert.equal('aria-hidden' in nav.attributes, false);
});
