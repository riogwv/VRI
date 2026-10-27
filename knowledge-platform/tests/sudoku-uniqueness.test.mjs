import { test } from 'vitest';
import assert from 'node:assert/strict';
import { generatePuzzle } from '../src/scripts/features/sudoku/sudoku.js';

// Independent solver: choose the cell with the fewest candidates and stop at two.
function solutions(board) {
  const grid = board.map(row => [...row]);
  function count() {
    let best = null;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
      if (grid[r][c]) continue;
      const allowed = [];
      for (let n = 1; n <= 9; n++) {
        const row = grid[r].includes(n);
        const column = grid.some(line => line[c] === n);
        const box = grid.slice(Math.floor(r / 3) * 3, Math.floor(r / 3) * 3 + 3)
          .some(line => line.slice(Math.floor(c / 3) * 3, Math.floor(c / 3) * 3 + 3).includes(n));
        if (!row && !column && !box) allowed.push(n);
      }
      if (!allowed.length) return 0;
      if (!best || allowed.length < best.allowed.length) best = { r, c, allowed };
    }
    if (!best) return 1;
    let total = 0;
    for (const n of best.allowed) {
      grid[best.r][best.c] = n;
      total += count();
      if (total >= 2) break;
    }
    grid[best.r][best.c] = 0;
    return total;
  }
  return count();
}

test('generated puzzles have one solution and clues match the solution', () => {
  for (const difficulty of ['easy', 'medium', 'hard']) {
    for (let i = 0; i < 10; i++) {
      const { puzzle, solution } = generatePuzzle(difficulty);
      assert.equal(solutions(puzzle), 1, `${difficulty} puzzle ${i + 1}`);
      for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
        if (puzzle[r][c]) assert.equal(puzzle[r][c], solution[r][c]);
      }
    }
  }
});
