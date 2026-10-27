/* ==========================================================================
   Sudoku — playable 9×9 game with generator, solver, validation,
   candidates, timer, mistakes, hints, undo/redo, win detection.
   ========================================================================== */

import { createEl } from "../../utils/dom.js";

const DIFFICULTY = {
  easy: { blanks: 35, label: "Mudah" },
  medium: { blanks: 45, label: "Sedang" },
  hard: { blanks: 55, label: "Sulit" },
};

function generateGrid() {
  const grid = Array(9).fill(null).map(() => Array(9).fill(0));
  fillDiagonal(grid);
  solve(grid);
  return grid;
}

function fillDiagonal(grid) {
  for (let i = 0; i < 9; i += 3) fillBox(grid, i, i);
}

function fillBox(grid, row, col) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let n;
      do { n = Math.floor(Math.random() * 9) + 1; } while (!isSafe(grid, row + i, col + j, n));
      grid[row + i][col + j] = n;
    }
  }
}

function isSafe(grid, row, col, num) {
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false;
    if (grid[x][col] === num) return false;
  }
  const br = 3 * Math.floor(row / 3);
  const bc = 3 * Math.floor(col / 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[br + i][bc + j] === num) return false;
    }
  }
  return true;
}

function solve(grid) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isSafe(grid, row, col, num)) {
            grid[row][col] = num;
            if (solve(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function removeDigits(grid, blanks) {
  const puzzle = grid.map((row) => row.slice());
  const cells = Array.from({ length: 81 }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  let removed = 0;
  for (const cell of cells) {
    if (removed >= blanks) break;
    const r = Math.floor(cell / 9), c = cell % 9;
    const value = puzzle[r][c];
    puzzle[r][c] = 0;
    if (countSolutions(puzzle) === 1) removed++;
    else puzzle[r][c] = value;
  }
  // shortcut: some puzzles have fewer blanks than requested; retry generation if exact difficulty is needed.
  return puzzle;
}

function countSolutions(grid, limit = 2) {
  let count = 0;
  function solveCount(g) {
    if (count >= limit) return;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (g[r][c] === 0) {
          for (let n = 1; n <= 9; n++) {
            if (isSafe(g, r, c, n)) {
              g[r][c] = n;
              solveCount(g);
              g[r][c] = 0;
            }
          }
          return;
        }
      }
    }
    count++;
  }
  solveCount(grid.map((row) => row.slice()));
  return count;
}
export async function renderSudoku(params) {
  const difficulty = (params && params.diff) || "medium";
  const container = createEl("div", { className: "page sudoku-page" });

  container.innerHTML = `
    <div class="container">
      <div class="section-header" style="margin-bottom:var(--space-6)">
        <div><a class="game-back" href="#/games">← Semua permainan</a><h1>Sudoku</h1><p class="game-intro">Pilih kotak, lalu isi angka 1–9. Setiap baris, kolom, dan blok harus berisi angka yang berbeda.</p></div>
        <div style="display:flex;gap:var(--space-2);align-items:center">
          <label for="sudoku-diff" style="font-size:var(--text-sm);color:var(--color-text-secondary)">Tingkat:</label>
          <select id="sudoku-diff" style="padding:var(--space-2)var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius);background:var(--color-surface);color:var(--color-text);font-size:var(--text-sm)">
            <option value="easy">Mudah</option>
            <option value="medium" selected>Sedang</option>
            <option value="hard">Sulit</option>
          </select>
          <button id="sudoku-new" class="btn btn-primary" style="margin-left:var(--space-3)">Baru</button>
        </div>
      </div>

      <div class="sudoku-controls" style="display:flex;gap:var(--space-3);justify-content:space-between;align-items:center;margin-bottom:var(--space-6);flex-wrap:wrap">
        <div style="display:flex;gap:var(--space-3);align-items:center;color:var(--color-text-secondary);font-size:var(--text-sm)">
          <span id="sudoku-timer">00:00</span>
          <span>•</span>
          <span id="sudoku-mistakes">Kesalahan: 0</span>
          <span>•</span>
          <span id="sudoku-hints">Petunjuk: 0</span>
        </div>
        <div style="display:flex;gap:var(--space-2)">
          <button id="sudoku-hint" class="btn btn-outline btn-sm">Petunjuk</button>
          <button id="sudoku-undo" class="btn btn-outline btn-sm">Undo</button>
          <button id="sudoku-reset" class="btn btn-outline btn-sm">Reset</button>
          <button id="sudoku-check" class="btn btn-outline btn-sm">Periksa</button>
        </div>
      </div>

      <div class="sudoku-board-wrapper" style="display:flex;justify-content:center">
        <div id="sudoku-board" class="sudoku-board"></div>
      </div>

      <div class="sudoku-numpad" style="display:flex;justify-content:center;gap:var(--space-2);margin-top:var(--space-6);flex-wrap:wrap">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="num-btn" data-num="${n}">${n}</button>`).join("")}
        <button class="num-btn num-clear" data-num="0">Hapus</button>
        <button class="num-btn num-candidate" data-mode="candidate" aria-pressed="false">Mode Kandidat</button>
      </div>

      <div id="sudoku-message" role="status" aria-live="polite" style="margin-top:var(--space-4);text-align:center;min-height:24px"></div>
    </div>
  `;

  newGame(difficulty, () => updateStatus(container));
  let ownedTimerId = state.timerId;
  renderBoard(container);
  updateStatus(container);
  setMessage(container, "Pilih kotak untuk mulai mengisi.", "info");

  const diffSel = container.querySelector("#sudoku-diff");
  diffSel.value = difficulty;
  diffSel.addEventListener("change", () => {
    const d = diffSel.value;
    clearInterval(state.timerId);
    newGame(d, () => updateStatus(container));
    ownedTimerId = state.timerId;
    renderBoard(container);
    updateStatus(container);
  });

  container.querySelector("#sudoku-new").addEventListener("click", () => {
    clearInterval(state.timerId);
    newGame(state.difficulty, () => updateStatus(container));
    ownedTimerId = state.timerId;
    renderBoard(container);
    updateStatus(container);
    setMessage(container, "Puzzle baru dibuat.", "info");
  });

  container.querySelector("#sudoku-hint").addEventListener("click", () => {
    const h = hint();
    if (h) {
      selectedCell = { r: h.r, c: h.c };
      renderBoard(container);
      updateStatus(container);
      setMessage(container, `Petunjuk: kotak (${h.r + 1}, ${h.c + 1}) = ${h.val}`, "info");
      checkCompletion(container);
    } else {
      setMessage(container, "Semua kotak sudah terisi.", "info");
    }
  });

  container.querySelector("#sudoku-undo").addEventListener("click", () => {
    undo();
    renderBoard(container);
    updateStatus(container);
  });

  container.querySelector("#sudoku-reset").addEventListener("click", () => {
    reset();
    ownedTimerId = state.timerId;
    renderBoard(container);
    updateStatus(container);
    setMessage(container, "Papan direset.", "info");
  });

  container.querySelector("#sudoku-check").addEventListener("click", () => {
    if (!checkValid(state.grid)) {
      state.mistakes++;
      setMessage(container, "Ada angka yang bertentangan. Periksa kembali.", "error");
    } else if (isComplete(state.grid, state.solution)) {
      clearInterval(state.timerId);
      state.completed = true;
      setMessage(container, `Selamat! Puzzle selesai dalam ${formatTime(state.seconds)} (${state.hintsUsed} petunjuk).`, "success");
    } else {
      setMessage(container, "Saat ini masih valid. Lanjutkan!", "success");
    }
    updateStatus(container);
    renderBoard(container);
  });

  let candidateMode = false;
  const onKeydown = (e) => {
    if (!container.isConnected) return;
    if (!selectedCell || state.completed) return;
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
    if (tag === "BUTTON" && !container.querySelector("#sudoku-board").contains(document.activeElement)) return;
    const { r, c } = selectedCell;
    if (e.key >= "1" && e.key <= "9") {
      if (candidateMode) toggleCandidate(r, c, parseInt(e.key, 10));
      else setCell(r, c, parseInt(e.key, 10));
      renderBoard(container);
      updateStatus(container);
      if (state.fixed[r][c]) setMessage(container, "Kotak ini adalah angka awal dan tidak dapat diubah.", "info");
      else if (!candidateMode && cellError(r, c)) setMessage(container, "Angka ini bertentangan dengan baris, kolom, atau blok.", "error");
      else setMessage(container, candidateMode ? "Kandidat diperbarui." : "Angka diperbarui.", "info");
      checkCompletion(container);
      e.preventDefault();
    } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
      setCell(r, c, 0);
      renderBoard(container);
      updateStatus(container);
      e.preventDefault();
    } else if (e.key === "ArrowUp" && r > 0) {
      selectedCell = { r: r - 1, c };
      renderBoard(container);
      e.preventDefault();
    } else if (e.key === "ArrowDown" && r < 8) {
      selectedCell = { r: r + 1, c };
      renderBoard(container);
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && c > 0) {
      selectedCell = { r, c: c - 1 };
      renderBoard(container);
      e.preventDefault();
    } else if (e.key === "ArrowRight" && c < 8) {
      selectedCell = { r, c: c + 1 };
      renderBoard(container);
      e.preventDefault();
    }
  };
  document.addEventListener("keydown", onKeydown);
  container.dispose = () => {
    clearInterval(ownedTimerId);
    document.removeEventListener("keydown", onKeydown);
  };

  container.querySelectorAll(".num-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const num = btn.dataset.num;
      const mode = btn.dataset.mode;
      if (mode === "candidate") {
        candidateMode = !candidateMode;
        btn.classList.toggle("active", candidateMode);
        btn.setAttribute("aria-pressed", String(candidateMode));
        setMessage(container, candidateMode ? "Mode kandidat aktif: angka akan menjadi catatan kecil." : "Mode angka aktif.", "info");
        btn.style.background = candidateMode ? "var(--color-focus)" : "";
        btn.style.color = candidateMode ? "#fff" : "";
        return;
      }
      if (!selectedCell) { setMessage(container, "Pilih kotak terlebih dahulu.", "info"); return; }
      const { r, c } = selectedCell;
      if (state.fixed[r][c]) { setMessage(container, "Kotak ini adalah angka awal dan tidak dapat diubah.", "info"); return; }
      if (candidateMode && num !== "0") toggleCandidate(r, c, parseInt(num, 10));
      else setCell(r, c, parseInt(num));
      renderBoard(container);
      updateStatus(container);
      if (!state.completed && num !== "0" && !candidateMode && cellError(r, c)) setMessage(container, "Angka ini bertentangan dengan baris, kolom, atau blok.", "error");
      else if (!state.completed) setMessage(container, candidateMode ? "Kandidat diperbarui." : "Angka diperbarui.", "info");
      checkCompletion(container);
    });
  });

  return container;
}
/* ==========================================================================
   UI
   ========================================================================== */

function cellError(r, c) {
  const val = state.grid[r][c];
  if (val === 0) return false;
  for (let c2 = 0; c2 < 9; c2++) if (c2 !== c && state.grid[r][c2] === val) return true;
  for (let r2 = 0; r2 < 9; r2++) if (r2 !== r && state.grid[r2][c] === val) return true;
  const br = 3 * Math.floor(r / 3), bc = 3 * Math.floor(c / 3);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      const rr = br + i, cc = bc + j;
      if ((rr !== r || cc !== c) && state.grid[rr][cc] === val) return true;
    }
  return false;
}

function renderBoard(container) {
  const board = container.querySelector("#sudoku-board");
  const restoreFocus = board.contains(document.activeElement);
  board.innerHTML = "";
  board.style.display = "grid";
  board.style.gridTemplateColumns = "repeat(9, 1fr)";
  board.style.width = "min(420px, 100%)";
  board.style.aspectRatio = "1";

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const fixed = state.fixed[r][c];
      const val = state.grid[r][c];
      const isSelected = selectedCell && selectedCell.r === r && selectedCell.c === c;
      const isPeer = selectedCell && (selectedCell.r === r || selectedCell.c === c || (Math.floor(selectedCell.r / 3) === Math.floor(r / 3) && Math.floor(selectedCell.c / 3) === Math.floor(c / 3)));
      const isSame = selectedCell && val !== 0 && val === state.grid[selectedCell.r][selectedCell.c];
      const cand = state.candidates[`${r},${c}`] || [];

      const cell = createEl("button", {
        className: `sudoku-cell ${fixed ? "fixed" : ""} ${val === 0 ? "empty" : ""} ${isSelected ? "selected" : ""} ${isPeer ? "peer" : ""} ${isSame ? "same-value" : ""} ${cellError(r, c) ? "error" : ""}`,
        "aria-label": `Baris ${r + 1}, kolom ${c + 1}, ${val || "kosong"}${fixed ? ", angka awal" : ""}`,
        style: "padding:0;font-size:16px;font-weight:600;border:1px solid var(--color-border);color:var(--color-text)",
        onClick: () => { selectedCell = { r, c }; renderBoard(container); },
      });

      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.setAttribute("aria-pressed", String(!!isSelected));
      if (c % 3 === 0) cell.style.borderLeftWidth = "2px";
      if (r % 3 === 0) cell.style.borderTopWidth = "2px";
      if (c === 8) cell.style.borderRightWidth = "2px";
      if (r === 8) cell.style.borderBottomWidth = "2px";

      if (fixed) cell.style.color = "var(--color-text)";
      else if (val !== 0) cell.style.color = "var(--color-focus)";
      if (val !== 0) cell.textContent = val;

      if (val === 0 && cand.length > 0) {
        cell.style.position = "relative";
        const candLayer = createEl("div", {
          style: "position:absolute;inset:2px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:1px;pointer-events:none;font-size:10px;color:var(--color-text-muted)",
        });
        for (let n = 1; n <= 9; n++) {
          candLayer.appendChild(createEl("span", {
            style: cand.includes(n) ? "opacity:1" : "opacity:0",
            text: n,
          }));
        }
        cell.appendChild(candLayer);
      }

      board.appendChild(cell);
    }
  }
  if (restoreFocus && selectedCell) board.querySelector(`[data-row="${selectedCell.r}"][data-col="${selectedCell.c}"]`)?.focus();
}

function checkCompletion(container) {
  if (!state.completed && isComplete(state.grid, state.solution)) {
    clearInterval(state.timerId);
    state.completed = true;
    setMessage(container, `Selamat! Puzzle selesai dalam ${formatTime(state.seconds)} (${state.hintsUsed} petunjuk).`, "success");
  }
}

function updateStatus(container) {
  container.querySelector("#sudoku-timer").textContent = formatTime(state.seconds);
  container.querySelector("#sudoku-mistakes").textContent = `Kesalahan: ${state.mistakes}`;
  container.querySelector("#sudoku-hints").textContent = `Petunjuk: ${state.hintsUsed}`;
}

function setMessage(container, msg, type) {
  const el = container.querySelector("#sudoku-message");
  el.textContent = msg;
  el.style.color = type === "success" ? "var(--color-success)" : type === "error" ? "var(--color-error)" : "var(--color-text-secondary)";
}
/* ==========================================================================
   Game state
   ========================================================================== */

let state = {
  puzzle: [], solution: [], grid: [], fixed: [],
  candidates: {}, mistakes: 0, hintsUsed: 0, seconds: 0,
  timerId: null, difficulty: "medium", history: [], completed: false,
};

let selectedCell = null;
let onTimerTick = null;

function startTimer() {
  clearInterval(state.timerId);
  state.timerId = setInterval(() => { state.seconds++; onTimerTick?.(); }, 1000);
}

function newGame(difficulty, onTick = null) {
  onTimerTick = onTick;
  state.difficulty = difficulty;
  const { puzzle, solution } = generatePuzzle(difficulty);
  state.puzzle = puzzle;
  state.solution = solution;
  state.grid = puzzle.map((row) => row.slice());
  state.fixed = puzzle.map((row) => row.map((v) => v !== 0));
  state.candidates = {};
  state.mistakes = 0;
  state.hintsUsed = 0;
  state.seconds = 0;
  state.history = [];
  state.completed = false;
  selectedCell = null;
  startTimer();
}

function setCell(r, c, val) {
  if (state.fixed[r][c] || state.completed) return;
  const old = state.grid[r][c];
  if (old === val) return;
  state.grid[r][c] = val;
  state.history.push({ r, c, old });
  delete state.candidates[`${r},${c}`];
}

function undo() {
  if (state.history.length === 0 || state.completed) return;
  const last = state.history.pop();
  state.grid[last.r][last.c] = last.old;
}

function reset() {
  state.grid = state.puzzle.map((row) => row.slice());
  state.candidates = {};
  state.mistakes = 0;
  state.hintsUsed = 0;
  state.seconds = 0;
  state.completed = false;
  state.history = [];
  selectedCell = null;
  startTimer();
}

function toggleCandidate(r, c, n) {
  if (state.fixed[r][c] || state.completed || state.grid[r][c] !== 0 || n < 1 || n > 9) return;
  const key = `${r},${c}`;
  if (!state.candidates[key]) state.candidates[key] = [];
  const idx = state.candidates[key].indexOf(n);
  if (idx >= 0) state.candidates[key].splice(idx, 1);
  else state.candidates[key].push(n);
}

function hint() {
  if (state.completed) return null;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (state.grid[r][c] === 0) {
        state.history.push({ r, c, old: 0 });
        state.grid[r][c] = state.solution[r][c];
        delete state.candidates[`${r},${c}`];
        state.hintsUsed++;
        return { r, c, val: state.solution[r][c] };
      }
    }
  }
  return null;
}

export { state, selectedCell, newGame, setCell, undo, reset, toggleCandidate, hint };

function generatePuzzle(difficulty) {
  const blanks = DIFFICULTY[difficulty].blanks;
  const solution = generateGrid();
  return { puzzle: removeDigits(solution, blanks), solution };
}

function checkValid(grid) {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (grid[r][c] !== 0) {
        const val = grid[r][c];
        grid[r][c] = 0;
        const ok = isSafe(grid, r, c, val);
        grid[r][c] = val;
        if (!ok) return false;
      }
  return true;
}

function isComplete(grid, solution) {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (grid[r][c] !== solution[r][c]) return false;
  return true;
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export { DIFFICULTY, generatePuzzle, checkValid, isComplete, formatTime };