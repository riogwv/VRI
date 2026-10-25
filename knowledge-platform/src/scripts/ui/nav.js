/* ==========================================================================
   Navigation — mobile menu + active route highlighting
   ========================================================================== */

export function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("main-nav");
  const links = nav.querySelectorAll(".nav-link");

  let open = false;

  toggle.addEventListener("click", () => {
    open = !open;
    toggle.setAttribute("aria-expanded", String(open));
    nav.hidden = !open;
    nav.setAttribute("aria-hidden", String(!open));
  });

  // Close mobile nav when a link is clicked
  links.forEach((link) => {
    link.addEventListener("click", () => {
      open = false;
      toggle.setAttribute("aria-expanded", "false");
      nav.hidden = true;
      nav.setAttribute("aria-hidden", "true");
    });
  });

  // Highlight active link on route change
  window.addEventListener("hashchange", () => updateActive(links));
  window.addEventListener("popstate", () => updateActive(links));
  updateActive(links);
}

function updateActive(links) {
  const hash = window.location.hash.slice(1) || "/";
  const base = hash.split("?")[0];
  links.forEach((link) => {
    const href = link.getAttribute("href").replace("#", "");
    const isActive =
      base === href ||
      (href !== "/" && base.startsWith(href + "/")) ||
      (base === "/" && href === "/");
    link.classList.toggle("active", isActive);
  });
}