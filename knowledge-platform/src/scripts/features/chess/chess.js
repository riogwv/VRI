/* ==========================================================================
   Chess — interactive local puzzles (seed) with Lichess fallback display.
   Move validation via chess.js; solution sequence from seed data.
   ========================================================================== */

import { Chess } from "chess.js";
import { createEl } from "../../utils/dom.js";
import { content } from "../../services/content.js";
import { showToast } from "../../ui/toast.js";

const PIECE_UNICODE = {
  r: "♜",
  n: "♞",
  b: "♝",
  q: "♛",
  k: "♚",
  p: "♟",
  R: "♖",
  N: "♘",
  B: "♗",
  Q: "♕",
  K: "♔",
  P: "♙",
};

export async function renderChess() {
  const container = createEl("section", { className: "page chess-page" }, [
    createEl("div", { className: "container" }, [
      createEl("div", { className: "game-heading" }, [
        createEl("a", { className: "game-back", href: "#/games" }, "← Semua permainan"),
        createEl("h1", {}, "Puzzle Catur"),
        createEl("p", { style: "color:var(--color-text-muted)" },
          "Latih taktik dengan puzzle lokal. Pilih kotak asal lalu tujuan; hanya langkah legal yang diterima."),
      ]),
      createEl("div", { className: "chess-layout", style: "display:flex;gap:var(--space-6);flex-wrap:wrap" }, [
        createEl("div", { className: "chess-puzzle-card", style: "flex:1;min-width:300px" }, [
          createEl("div", { className: "card" }, [
            createEl("div", { className: "card-body", style: "padding:var(--space-5)" }, [
              createEl("div", { id: "chess-prompt", style: "font-weight:600;margin-bottom:var(--space-3)" }),
              createEl("div", {
                id: "chess-board",
                style:
                  "display:grid;grid-template-columns:repeat(8,1fr);gap:0;width:100%;max-width:400px;aspect-ratio:1;margin-bottom:var(--space-4);border:2px solid var(--color-border)",
              }),
              createEl("div", { id: "chess-status", role: "status", "aria-live": "polite", style: "font-size:var(--text-sm);margin-bottom:var(--space-3)" }),
              createEl("div", { style: "display:flex;gap:var(--space-2);flex-wrap:wrap" }, [
                createEl("button", { id: "chess-hint", className: "btn btn-outline btn-sm" }, "Petunjuk"),
                createEl("button", { id: "chess-reset", className: "btn btn-outline btn-sm" }, "Reset"),
                createEl("button", { id: "chess-next", className: "btn btn-primary btn-sm" }, "Puzzle Berikutnya"),
              ]),
              createEl("div", { id: "chess-info", style: "font-size:var(--text-sm);color:var(--color-text-secondary);margin-top:var(--space-4)" }),
            ]),
          ]),
        ]),
        createEl("div", { className: "chess-info-panel", style: "flex:0.6;min-width:260px" }, [
          createEl("h3", {}, "Taktik Catur"),
          createEl("ul", { style: "padding-left:var(--space-4);color:var(--color-text-secondary);font-size:var(--text-sm)" }, [
            createEl("li", { style: "margin-bottom:var(--space-2)" }, "Fork: satu bidak menyerang dua atau lebih lawan."),
            createEl("li", { style: "margin-bottom:var(--space-2)" }, "Pin: bidak tidak bisa gerak tanpa mengancam bidak lebih berharga."),
            createEl("li", { style: "margin-bottom:var(--space-2)" }, "Skewer: serangan bidak berharga di depan."),
            createEl("li", { style: "margin-bottom:var(--space-2)" }, "Klik bidak sendiri, lalu kotak tujuan."),
          ]),
        ]),
      ]),
    ]),
  ]);

  const session = { puzzle: null, game: null, step: 0, selected: null, solved: false, loading: true };

  let loadId = 0;
  async function loadRandomPuzzle() {
    const currentLoad = ++loadId;
    session.loading = true;
    container.querySelector("#chess-board").setAttribute("aria-busy", "true");
    setControlsDisabled(container, true);
    setStatus(container, "Menyiapkan puzzle…");
    session.selected = null;
    session.step = 0;
    session.solved = false;

    let puzzle = null;
    try {
      const lichessPuzzle = await content.getChessPuzzle("normal");
      if (lichessPuzzle && lichessPuzzle.fen) {
        puzzle = normalizePuzzle(lichessPuzzle, "lichess");
      }
    } catch (err) {
      console.warn("[chess] lichess failed:", err.message);
    }

    if (currentLoad !== loadId) return;
    if (!puzzle) {
      const seeds = content.getChessPuzzlesSeed();
      const choices = seeds.length > 1 ? seeds.filter((seed) => seed.id !== session.puzzle?.id) : seeds;
      const s = choices[Math.floor(Math.random() * choices.length)];
      puzzle = normalizePuzzle(s, "seed");
    }

    session.puzzle = puzzle;
    session.game = new Chess(puzzle.fen);
    session.loading = false;
    container.querySelector("#chess-board").setAttribute("aria-busy", "false");
    setControlsDisabled(container, false);
    paintBoard(container, session);
    renderInfo(container, puzzle);
    setStatus(container, `Giliran ${session.game.turn() === "w" ? "putih" : "hitam"}. Pilih bidak, lalu pilih kotak tujuan.`);
  }

  container.querySelector("#chess-reset").addEventListener("click", () => {
    if (!session.puzzle || session.loading) return;
    session.game = new Chess(session.puzzle.fen);
    session.step = 0;
    session.selected = null;
    session.solved = false;
    paintBoard(container, session);
    setStatus(container, "Puzzle direset.");
  });

  const requestPuzzle = () => {
    loadRandomPuzzle().catch(() => setStatus(container, "Puzzle tidak dapat dimuat. Coba puzzle berikutnya."));
  };
  container.querySelector("#chess-next").addEventListener("click", requestPuzzle);

  container.querySelector("#chess-hint").addEventListener("click", () => {
    if (!session.puzzle || session.solved || session.loading) return;
    const expected = session.puzzle.moves[session.step];
    if (!expected) return;
    const from = expected.slice(0, 2);
    const to = expected.slice(2, 4);
    setStatus(container, `Petunjuk: pertimbangkan ${from} → ${to}`);
    highlightHint(container, from, to);
  });

  requestPuzzle();
  return container;
}

function normalizePuzzle(raw, source) {
  let moves = raw.moves;
  if (typeof moves === "string") moves = moves.trim().split(/\s+/);
  if (!Array.isArray(moves)) moves = [];
  return {
    id: raw.id || raw.puzzle?.id || "lichess",
    source,
    fen: raw.fen || raw.game?.fen,
    moves: moves.map((m) => m.toLowerCase()),
    rating: raw.rating || raw.puzzle?.rating,
    themes: raw.themes || raw.puzzle?.themes || [],
    explanation: raw.explanation || raw.puzzle?.explanation || "",
    prompt: raw.prompt || raw.puzzle?.prompt || "Temukan langkah terbaik untuk putih.",
    url: raw.url || (raw.id ? `https://lichess.org/training/${raw.id}` : ""),
  };
}

function paintBoard(container, session) {
  const boardEl = container.querySelector("#chess-board");
  const promptEl = container.querySelector("#chess-prompt");
  promptEl.textContent = session.puzzle.prompt;

  const focusedSquare = boardEl.contains(document.activeElement) ? document.activeElement?.dataset.sq : null;
  boardEl.innerHTML = "";
  const targets = new Set(session.selected ? session.game.moves({ square: session.selected, verbose: true }).map((move) => move.to) : []);
  const fen = session.game.fen();
  const rows = fen.split(" ")[0].split("/");
  const turn = session.game.turn();

  for (let r = 0; r < 8; r++) {
    let c = 0;
    for (const ch of rows[r]) {
      if (/[1-8]/.test(ch)) {
        const n = parseInt(ch, 10);
        for (let i = 0; i < n; i++) {
          appendSquare(boardEl, r, c, turn, session, targets);
          c++;
        }
        continue;
      }
      appendSquare(boardEl, r, c, turn, session, targets, ch);
      c++;
    }
  }
  if (focusedSquare) boardEl.querySelector(`[data-sq="${focusedSquare}"]`)?.focus();
}

function appendSquare(boardEl, r, c, turn, session, targets, pieceChar = null) {
  const sq = String.fromCharCode(97 + c) + (8 - r);
  const light = (r + c) % 2 === 0;
  const isSelected = session.selected === sq;
  const isLegalTarget = targets.has(sq);
  const piece = session.game.get(sq);
  const names = { p: "pion", n: "kuda", b: "gajah", r: "benteng", q: "menteri", k: "raja" };

  const cell = createEl("button", {
    type: "button",
    className: `chess-cell ${isSelected ? "selected" : ""} ${isLegalTarget ? "legal-target" : ""}`,
    "aria-label": `Kotak ${sq}, ${piece ? `${names[piece.type]} ${piece.color === "w" ? "putih" : "hitam"}` : "kosong"}${isLegalTarget ? ", langkah legal" : ""}`,
    style: `width:100%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:clamp(20px,5vw,32px);background:${light ? "#f0d9b5" : "#b58863"};border:none;cursor:pointer;color:#111;outline:${isSelected ? "3px solid var(--color-focus)" : ""}`,
    onClick: () => onSquareClick(session, sq, boardEl.closest(".chess-page")),
  });

  cell.setAttribute("aria-pressed", String(isSelected));
  if (pieceChar) cell.textContent = PIECE_UNICODE[pieceChar] || "";
  cell.dataset.sq = sq;
  boardEl.appendChild(cell);
}

function onSquareClick(session, sq, pageRoot) {
  if (session.loading || session.solved || session.game.isGameOver()) return;

  const container = pageRoot.querySelector(".container") || pageRoot;

  if (!session.selected) {
    const piece = session.game.get(sq);
    if (!piece || piece.color !== session.game.turn()) {
      setStatus(pageRoot, "Pilih bidak sendiri yang sedang giliran.");
      showToast("Pilih bidak sendiri yang sedang giliran.", "info");
      return;
    }
    session.selected = sq;
    setStatus(pageRoot, `Bidak ${sq} dipilih. Pilih salah satu kotak tujuan yang ditandai.`);
    paintBoard(container.parentElement?.closest(".chess-page") ? container.closest(".chess-page") : pageRoot, session);
    return;
  }

  if (session.selected === sq) {
    session.selected = null;
    paintBoard(pageRoot, session);
    return;
  }

  const from = session.selected;
  const to = sq;
  const expected = session.puzzle.moves[session.step];
  const attempt = (from + to).toLowerCase();

  let move = null;
  try {
    move = session.game.move({ from, to, promotion: "q" });
  } catch {
    move = null;
  }

  if (!move) {
    setStatus(pageRoot, "Langkah ilegal. Pilih bidak dan coba lagi.");
    showToast("Langkah ilegal menurut aturan catur.", "error");
    session.selected = null;
    paintBoard(pageRoot, session);
    return;
  }

  if (expected && attempt !== expected && attempt !== expected.slice(0, 4)) {
    session.game.undo();
    setStatus(pageRoot, "Langkah legal, tetapi bukan solusi. Coba lagi.");
    showToast("Langkah legal, tapi bukan solusi puzzle. Coba lagi.", "error");
    session.selected = null;
    paintBoard(pageRoot, session);
    return;
  }

  session.step++;
  session.selected = null;

  if (session.step >= session.puzzle.moves.length) {
    session.solved = true;
    setStatus(pageRoot, session.puzzle.explanation || "Benar! Puzzle selesai.");
    showToast("Puzzle selesai!", "success");
  } else {
    setStatus(pageRoot, "Bagus! Lanjutkan jika ada langkah balasan otomatis dari puzzle.");
    applyAutoReply(session, pageRoot);
  }

  paintBoard(pageRoot, session);
}

function applyAutoReply(session, pageRoot) {
  const next = session.puzzle.moves[session.step];
  if (!next || session.game.turn() !== "b") return;
  try {
    session.game.move({ from: next.slice(0, 2), to: next.slice(2, 4), promotion: "q" });
    session.step++;
  } catch (err) {
    console.warn("[chess] auto reply skipped:", err.message);
  }
  if (session.step >= session.puzzle.moves.length) {
    session.solved = true;
    setStatus(pageRoot, session.puzzle.explanation || "Benar! Puzzle selesai.");
  }
}

function setControlsDisabled(container, disabled) {
  container.querySelectorAll("#chess-hint, #chess-reset, #chess-next").forEach((button) => {
    button.disabled = disabled;
  });
}

function setStatus(containerOrPage, text) {
  const root = containerOrPage.classList?.contains("chess-page") ? containerOrPage : containerOrPage.closest?.(".chess-page");
  const el = (root || containerOrPage).querySelector("#chess-status");
  if (el) el.textContent = text;
}

function highlightHint(pageRoot, from, to) {
  pageRoot.querySelectorAll(".chess-cell").forEach((cell) => {
    if (cell.dataset.sq === from || cell.dataset.sq === to) {
      cell.style.boxShadow = "inset 0 0 0 3px var(--color-focus)";
    }
  });
}

function renderInfo(container, puzzle) {
  const infoEl = container.querySelector("#chess-info");
  infoEl.replaceChildren();
  const source = createEl("div", { style: "margin-bottom:var(--space-2)" },
    `Sumber: ${puzzle.source === "lichess" ? "Lichess API" : "Koleksi lokal (seed)"}`);
  const details = createEl("div", { style: "margin-bottom:var(--space-2)" },
    `Rating: ${puzzle.rating || "—"} | Tema: ${(puzzle.themes || []).join(", ") || "—"}`);
  infoEl.append(source, details);
  try {
    const url = new URL(puzzle.url);
    if (url.protocol === "https:" || url.protocol === "http:") {
      const link = createEl("a", { className: "btn-link", href: url.href }, "Buka referensi eksternal →");
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      infoEl.appendChild(link);
    }
  } catch {
    // Invalid or missing URLs are not rendered as links.
  }
}
