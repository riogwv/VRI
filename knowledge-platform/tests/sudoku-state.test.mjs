import { test, expect, vi } from 'vitest';
import { newGame, reset, state, setCell, toggleCandidate } from '../src/scripts/features/sudoku/sudoku.js';

test('reset after completion restores a playable puzzle and starts a visible timer', () => {
  vi.useFakeTimers();
  const tick = vi.fn();
  newGame('easy', tick);
  state.completed = true;
  state.seconds = 12;
  state.hintsUsed = 2;
  reset();
  expect(state.completed).toBe(false);
  expect(state.seconds).toBe(0);
  expect(state.hintsUsed).toBe(0);
  const r = state.fixed.findIndex(row => row.includes(false));
  const c = state.fixed[r].indexOf(false);
  setCell(r, c, 1);
  expect(state.grid[r][c]).toBe(1);
  vi.advanceTimersByTime(1000);
  expect(state.seconds).toBe(1);
  expect(tick).toHaveBeenCalledOnce();
  clearInterval(state.timerId);
  vi.useRealTimers();
});

test('candidate notes cannot contain zero or be added to filled cells', () => {
  vi.useFakeTimers();
  newGame('easy');
  const r = state.fixed.findIndex(row => row.includes(false));
  const c = state.fixed[r].indexOf(false);
  toggleCandidate(r, c, 0);
  expect(state.candidates[`${r},${c}`]).toBeUndefined();
  setCell(r, c, 2);
  toggleCandidate(r, c, 3);
  expect(state.candidates[`${r},${c}`]).toBeUndefined();
  clearInterval(state.timerId);
  vi.useRealTimers();
});
