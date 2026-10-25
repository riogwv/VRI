/* ==========================================================================
   Toast notification — temporary messages
   ========================================================================== */

let container = null;

function ensureContainer() {
  if (container) return container;
  container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "20px";
  container.style.right = "20px";
  container.style.zIndex = "1000";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "8px";
  container.style.pointerEvents = "none";
  document.body.appendChild(container);
  return container;
}

export function showToast(message, type = "info") {
  ensureContainer();
  const el = document.createElement("div");
  el.style.padding = "12px 16px";
  el.style.borderRadius = "10px";
  el.style.color = "#fff";
  el.style.fontSize = "0.875rem";
  el.style.fontWeight = "600";
  el.style.boxShadow = "0 10px 15px -3px rgb(0 0 0 / 0.1)";
  el.style.pointerEvents = "auto";
  el.style.minWidth = "260px";
  el.style.transform = "translateY(20px)";
  el.style.opacity = "0";
  el.style.transition = "all 0.2s ease";

  const bg = type === "error" ? "#dc2626" : type === "success" ? "#16a34a" : "#2563eb";
  el.style.background = bg;
  el.textContent = message;

  container.appendChild(el);

  requestAnimationFrame(() => {
    el.style.transform = "translateY(0)";
    el.style.opacity = "1";
  });

  setTimeout(() => {
    el.style.transform = "translateY(20px)";
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 200);
  }, 4000);
}