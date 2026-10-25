/* ==========================================================================
   Theme toggle — dark / light, persisted in localStorage
   ========================================================================== */

const THEME_KEY = "kh-theme";

export function initTheme() {
  const toggle = document.getElementById("theme-toggle");
  const sun = toggle.querySelector(".sun");
  const moon = toggle.querySelector(".moon");
  const html = document.documentElement;

  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");

  setTheme(theme, { sun, moon });

  toggle.addEventListener("click", () => {
    const next = html.dataset.theme === "light" ? "dark" : "light";
    setTheme(next, { sun, moon });
    localStorage.setItem(THEME_KEY, next);
  });
}

function setTheme(theme, { sun, moon }) {
  const html = document.documentElement;
  html.dataset.theme = theme;
  if (sun) sun.style.display = theme === "light" ? "block" : "none";
  if (moon) moon.style.display = theme === "dark" ? "block" : "none";
}