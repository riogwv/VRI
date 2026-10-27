/* ==========================================================================
   Global search bar — debounced, routes to search page
   ========================================================================== */

import { navigate } from "../router.js";

export function initSearch() {
  const input = document.getElementById("global-search");
  const form = input?.closest("form");
  if (!input || !form) return;

  let timer = null;

  input.addEventListener("input", () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length === 0) return;
    timer = setTimeout(() => {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }, 300);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearTimeout(timer);
    const q = input.value.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  });
}

export function setSearchQuery(q) {
  const input = document.getElementById("global-search");
  if (input) input.value = q;
}