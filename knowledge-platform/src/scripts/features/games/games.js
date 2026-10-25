/* ==========================================================================
   Games hub — entry point for Sudoku, Crossword, Chess
   ========================================================================== */

import { createEl } from "../../utils/dom.js";

const GAMES = [
  {
    key: "sudoku",
    title: "Sudoku",
    desc: "Isi papan 9×9 dengan angka 1–9 tanpa duplikasi di baris, kolom, dan blok 3×3.",
    color: "games",
    route: "#/games/sudoku",
  },
  {
    key: "crossword",
    title: "Teka-Teki Silang",
    desc: "Isi kotak kosong dengan jawaban yang cocok dengan petunjuk mendatar dan menurun.",
    color: "games",
    route: "#/games/crossword",
  },
  {
    key: "chess",
    title: "Puzzle Catur",
    desc: "Latih taktik catur: fork, pin, dan kombinasi dari Lichess.",
    color: "chess",
    route: "#/games/chess",
  },
];

export async function renderGames() {
  const page = createEl("section", { className: "page games-page" }, [
    createEl("div", { className: "container" }, [
      createEl("h2", { style: "margin-bottom:var(--space-6)" }, "Permainan Asah Otak"),
      createEl("div", { className: "grid-feed", id: "games-grid" }),
    ]),
  ]);

  const grid = page.querySelector("#games-grid");
  GAMES.forEach((g) => {
    grid.appendChild(gameCard(g));
  });

  return page;
}

function gameCard(g) {
  return createEl("a", {
    className: "card",
    href: g.route,
    style: "text-decoration:none;display:flex;flex-direction:column;height:100%",
  }, [
    createEl("div", { className: "card-body", style: "flex:1;display:flex;flex-direction:column" }, [
      createEl("div", { className: `badge badge-${g.color}` }, g.title),
      createEl("h3", { style: "margin:var(--space-2) 0 0" }, g.title),
      createEl("p", { style: "color:var(--color-text-secondary);font-size:var(--text-sm);line-height:var(--leading-relaxed);flex:1" }, g.desc),
    ]),
    createEl("div", { style: "padding:var(--space-5);border-top:1px solid var(--color-border)" }, [
      createEl("span", { style: "font-size:var(--text-xs);color:var(--color-focus);font-weight:600" }, "Mulai Bermain →"),
    ]),
  ]);
}