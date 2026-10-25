/* ==========================================================================
   card-grid — render array of elements into a grid container
   ========================================================================== */

export function renderCardGrid(container, items) {
  container.innerHTML = "";
  items.forEach((el) => container.appendChild(el));
}