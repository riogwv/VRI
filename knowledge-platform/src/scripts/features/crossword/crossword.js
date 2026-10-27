/* ==========================================================================
   Crossword — validated grid + clues + keyboard navigation + validation
   ========================================================================== */

import { createEl } from "../../utils/dom.js";
import { content } from "../../services/content.js";

export async function renderCrossword() {
  const data = content.getCrossword();
  if (!data) {
    return createEl("section", { className: "page" }, [
      createEl("div", { className: "container" }, [
        createEl("h1", {}, "Teka-Teki Silang Tidak Tersedia"),
        createEl("a", { className: "btn-primary", href: "#/games" }, "Kembali ke Permainan"),
      ]),
    ]);
  }

  const { grid, across, down, size, title } = data;
  const rows = size.rows;
  const cols = size.cols;

  const answerMap = {};
  const cellMap = {};

  across.forEach((clue) => {
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.row;
      const c = clue.col + i;
      const key = `${r},${c}`;
      const letter = clue.answer[i].toUpperCase();
      if (answerMap[key] && answerMap[key] !== letter) {
        console.warn("[crossword] clue conflict at", key, answerMap[key], letter);
      }
      answerMap[key] = letter;
      cellMap[key] = cellMap[key] || {};
      cellMap[key].acrossId = clue.num;
      if (i === 0) cellMap[key].num = cellMap[key].num || clue.num;
    }
  });

  down.forEach((clue) => {
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.row + i;
      const c = clue.col;
      const key = `${r},${c}`;
      const letter = clue.answer[i].toUpperCase();
      if (answerMap[key] && answerMap[key] !== letter) {
        console.warn("[crossword] clue conflict at", key, answerMap[key], letter);
      }
      answerMap[key] = letter;
      cellMap[key] = cellMap[key] || {};
      cellMap[key].downId = clue.num;
      if (i === 0) cellMap[key].num = cellMap[key].num || clue.num;
    }
  });

  const userAnswers = {};
  const container = createEl("section", { className: "page crossword-page" }, [
    createEl("div", { className: "container" }, [
      createEl("div", { className: "game-heading" }, [
        createEl("a", { className: "game-back", href: "#/games" }, "← Semua permainan"),
        createEl("h1", {}, title),
        createEl("p", { className: "game-intro" }, "Pilih kotak dan ketik huruf sesuai petunjuk. Gunakan tombol panah untuk berpindah."),
      ]),
      createEl("div", { className: "crossword-layout", style: "display:flex;gap:var(--space-6);flex-wrap:wrap" }, [
        createEl("div", { className: "crossword-grid-wrap" }, [
          createEl("div", { id: "cw-grid", className: "cw-grid" }),
        ]),
        createEl("div", { className: "crossword-clues", style: "min-width:260px" }, [
          createEl("div", { className: "clue-group" }, [
            createEl("h3", {}, "Mendatar"),
            createEl("div", { id: "cw-across" }),
          ]),
          createEl("div", { className: "clue-group", style: "margin-top:var(--space-5)" }, [
            createEl("h3", {}, "Menurun"),
            createEl("div", { id: "cw-down" }),
          ]),
        ]),
      ]),
      createEl("div", { style: "margin-top:var(--space-6);display:flex;gap:var(--space-2);flex-wrap:wrap" }, [
        createEl("button", { id: "cw-check", className: "btn btn-outline" }, "Periksa Jawaban"),
        createEl("button", { id: "cw-reset", className: "btn btn-outline" }, "Reset"),
      ]),
      createEl("div", { id: "cw-message", role: "status", "aria-live": "polite", "aria-label": "Status jawaban", style: "margin-top:var(--space-4);text-align:center;min-height:24px" }),
    ]),
  ]);

  function paintGrid() {
    renderGrid(container, grid, cellMap, rows, cols, userAnswers, answerMap);
  }

  paintGrid();
  renderClues(container, across, down);

  container.querySelector("#cw-check").addEventListener("click", () => {
    let wrong = 0;
    let filled = 0;
    for (const [key, ch] of Object.entries(answerMap)) {
      if (userAnswers[key]) {
        filled++;
        if (userAnswers[key] !== ch) wrong++;
      }
    }
    const total = Object.keys(answerMap).length;
    if (wrong === 0 && filled === total) {
      setMessage(container, "Selamat! Semua jawaban benar.", "success");
    } else if (wrong > 0) {
      setMessage(container, `Ada ${wrong} huruf yang salah.`, "error");
    } else {
      setMessage(container, `Terisi ${filled}/${total}. Lanjutkan!`, "info");
    }
    paintGrid();
  });

  container.querySelector("#cw-reset").addEventListener("click", () => {
    Object.keys(userAnswers).forEach((k) => delete userAnswers[k]);
    paintGrid();
    setMessage(container, "Papan direset.", "info");
  });

  return container;
}

function renderGrid(container, grid, cellMap, rows, cols, userAnswers, answerMap) {
  const gridEl = container.querySelector("#cw-grid");
  const focusedCell = gridEl.contains(document.activeElement) ? document.activeElement?.dataset.cell : null;
  gridEl.innerHTML = "";
  gridEl.style.display = "grid";
  gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  gridEl.style.gap = "1px";
  gridEl.style.width = "min(320px, 100%)";
  gridEl.style.aspectRatio = `${cols} / ${rows}`;

  const playable = new Set(Object.keys(answerMap));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r},${c}`;
      if (!playable.has(key)) {
        gridEl.appendChild(createEl("div", { style: "background:#1a1a1a;min-height:32px" }));
        continue;
      }

      const info = cellMap[key] || {};
      const val = userAnswers[key] || "";

      const cell = createEl("div", {
        className: "cw-cell",
        style:
          "background:var(--color-surface);border:1px solid var(--color-border);display:flex;align-items:center;justify-content:center;position:relative;font-weight:600;min-height:32px",
      });

      if (info.num) {
        cell.appendChild(
          createEl("div", {
            style: "position:absolute;top:2px;left:2px;font-size:10px;color:var(--color-text-muted)",
            text: String(info.num),
          })
        );
      }

      const input = createEl("input", {
        type: "text",
        maxlength: "1",
        "aria-label": `Kotak baris ${r + 1} kolom ${c + 1}`,
        style:
          "width:100%;height:100%;text-align:center;text-transform:uppercase;font-size:16px;font-weight:600;background:transparent;border:none;color:var(--color-text)",
        value: val,
      });

      input.dataset.cell = key;
      input.addEventListener("input", (e) => {
        let v = e.target.value.toUpperCase();
        if (v && !/^[A-Z]$/.test(v)) v = "";
        e.target.value = v;
        userAnswers[key] = v;
        if (v) moveFocus(gridEl, key, 1, playable, rows, cols);
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          moveFocus(gridEl, key, 1, playable, rows, cols);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          moveFocus(gridEl, key, -1, playable, rows, cols);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          moveFocus(gridEl, key, cols, playable, rows, cols);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          moveFocus(gridEl, key, -cols, playable, rows, cols);
        } else if (e.key === "Backspace" || e.key === "Delete") {
          if (!e.target.value) moveFocus(gridEl, key, -1, playable, rows, cols);
          else {
            e.target.value = "";
            userAnswers[key] = "";
          }
        }
      });

      input.addEventListener("focus", () => {
        gridEl.querySelectorAll(".cw-cell").forEach((el) => el.classList.remove("selected"));
        cell.classList.add("selected");
      });

      cell.appendChild(input);
      gridEl.appendChild(cell);
    }
  }
  if (focusedCell) gridEl.querySelector(`input[data-cell="${focusedCell}"]`)?.focus();
}

function moveFocus(gridEl, key, delta, playable, rows, cols) {
  let [r, c] = key.split(",").map(Number);
  if (delta === cols) r++;
  else if (delta === -cols) r--;
  else c += delta;
  if (r < 0 || r >= rows || c < 0 || c >= cols || !playable.has(`${r},${c}`)) return;
  gridEl.querySelector(`input[data-cell="${r},${c}"]`)?.focus();
}

function renderClues(container, across, down) {
  const acrossEl = container.querySelector("#cw-across");
  const downEl = container.querySelector("#cw-down");
  acrossEl.innerHTML = "";
  downEl.innerHTML = "";

  across.forEach((clue) => {
    acrossEl.appendChild(clueItem(clue.num, clue.clue));
  });
  down.forEach((clue) => {
    downEl.appendChild(clueItem(clue.num, clue.clue));
  });
}

function clueItem(num, clueText) {
  return createEl(
    "div",
    {
      className: "clue-item",
      style: "font-size:var(--text-sm);margin-bottom:var(--space-2)",
    },
    [
      createEl("span", { style: "font-weight:700;color:var(--color-focus);margin-right:var(--space-1)" }, `${num}.`),
      createEl("span", {}, clueText),
    ]
  );
}

function setMessage(container, msg, type) {
  const el = container.querySelector("#cw-message");
  el.textContent = msg;
  el.style.color =
    type === "success"
      ? "var(--color-success)"
      : type === "error"
        ? "var(--color-error)"
        : "var(--color-text-secondary)";
}
