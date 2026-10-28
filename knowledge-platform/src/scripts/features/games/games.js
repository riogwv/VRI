/* ==========================================================================
   Games hub — daily challenges, resume and local progression
   ========================================================================== */

import { createEl } from "../../utils/dom.js";
import { content } from "../../services/content.js";
import { dailyChallenge, getContinuePlaying, getDailyStatus, getGameProgress } from "../../services/game-progress.js";
import { calendarDay } from "../../services/player-progress.js";

const GAMES = [
  { key: "sudoku", title: "Sudoku", desc: "Isi papan 9×9 dengan angka 1–9 tanpa duplikasi di baris, kolom, dan blok 3×3.", color: "games", route: "#/games/sudoku" },
  { key: "crossword", title: "Teka-Teki Silang", desc: "Isi kotak kosong dengan jawaban yang cocok dengan petunjuk mendatar dan menurun.", color: "games", route: "#/games/crossword" },
  { key: "chess", title: "Puzzle Catur", desc: "Latih taktik catur: fork, pin, dan kombinasi dari Lichess.", color: "chess", route: "#/games/chess" },
];

export async function renderGames() {
  const progress = getGameProgress();
  const day = calendarDay();
  const daily = [
    dailyChallenge("sudoku", ["easy", "medium", "hard"], day),
    dailyChallenge("crossword", content.getCrossword() ? [content.getCrossword()] : [], day),
    dailyChallenge("chess", content.getChessPuzzlesSeed(), day),
  ].filter(Boolean);
  const sessions = getContinuePlaying();
  const page = createEl("section", { className: "page games-page" }, [
    createEl("div", { className: "container" }, [
      createEl("div", { className: "game-heading" }, [
        createEl("span", { className: "section-kicker" }, "WAKTUNYA BERMAIN"),
        createEl("h1", {}, "Asah otak, santai saja."),
        createEl("p", { className: "game-intro" }, "Lanjutkan permainanmu atau selesaikan tantangan hari ini."),
      ]),
      progression(progress),
      dailySection(daily, day),
      sessions.length ? continueSection(sessions) : null,
      createEl("div", { className: "grid-feed", id: "games-grid" }),
    ]),
  ]);
  const grid = page.querySelector("#games-grid");
  GAMES.forEach((game) => grid.appendChild(gameCard(game)));
  return page;
}

function dailySection(challenges, day) {
  return createEl("section", { className: "game-progress", "aria-label": "Tantangan harian" }, [
    createEl("strong", {}, `Tantangan Hari Ini · ${day}`),
    ...challenges.map((challenge) => {
      const game = GAMES.find((entry) => entry.key === challenge.game);
      const status = getDailyStatus(challenge.game, day);
      return createEl("a", { className: "btn btn-outline btn-sm", href: `${game.route}?daily=${day}` }, `${game.title}: ${status === "completed" ? "Selesai ✓" : status === "in-progress" ? "Lanjutkan" : "Mulai"}`);
    }),
  ]);
}

function continueSection(sessions) {
  return createEl("section", { className: "game-progress", "aria-label": "Lanjutkan permainan" }, [
    createEl("strong", {}, "Lanjutkan Bermain"),
    ...sessions.map((session) => {
      const game = GAMES.find((entry) => entry.key === session.game);
      const detail = session.game === "sudoku" ? `${session.difficulty} · ${session.seconds || 0} dtk` : session.game === "chess" ? session.puzzle?.title || "Puzzle aktif" : "Teka-teki belum selesai";
      const query = session.dailyDate ? `?daily=${session.dailyDate}` : "";
      return createEl("a", { className: "btn btn-outline btn-sm", href: `${game.route}${query}` }, `${game.title}: ${detail} →`);
    }),
  ]);
}

function progression(progress) {
  const { player, completed, played, completionRate, sudokuBest } = progress;
  return createEl("section", { className: "game-progress", "aria-label": "Statistik permainan lokal" }, [
    createEl("strong", {}, "Progresmu"),
    createEl("span", {}, `🔥 ${player.streak.current} hari`),
    createEl("span", {}, `🏆 Rekor ${player.streak.longest} hari`),
    createEl("span", {}, `🎮 ${completed}/${played} selesai (${completionRate}%)`),
    sudokuBest.easy != null ? createEl("span", {}, `Sudoku mudah terbaik: ${formatSeconds(sudokuBest.easy)}`) : null,
    sudokuBest.medium != null ? createEl("span", {}, `Sedang: ${formatSeconds(sudokuBest.medium)}`) : null,
    sudokuBest.hard != null ? createEl("span", {}, `Sulit: ${formatSeconds(sudokuBest.hard)}`) : null,
  ]);
}

function gameCard(game) {
  return createEl("a", { className: "card", href: game.route, style: "text-decoration:none;display:flex;flex-direction:column;height:100%" }, [
    createEl("div", { className: "card-body", style: "flex:1;display:flex;flex-direction:column" }, [
      createEl("div", { className: `game-icon game-icon-${game.key}`, "aria-hidden": "true" }, { sudoku: "▦", crossword: "✎", chess: "♞" }[game.key]),
      createEl("div", { className: `badge badge-${game.color}` }, "Permainan"),
      createEl("h3", { style: "margin:var(--space-2) 0 0" }, game.title),
      createEl("p", { style: "color:var(--color-text-secondary);font-size:var(--text-sm);line-height:var(--leading-relaxed);flex:1" }, game.desc),
    ]),
    createEl("div", { style: "padding:var(--space-5);border-top:1px solid var(--color-border)" }, [createEl("span", { style: "font-size:var(--text-xs);color:var(--color-focus);font-weight:600" }, "Mulai Bermain →")]),
  ]);
}

function formatSeconds(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }
