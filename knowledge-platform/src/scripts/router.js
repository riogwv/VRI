/* ==========================================================================
   Hash-based router — tiny, dependency-free
   ========================================================================== */

const routes = []; // { path: string|RegExp, handler: (params) => Promise<HTMLElement|void> }

let currentRoute = null;

export function addRoute(path, handler) {
  const isRegExp = path instanceof RegExp;
  routes.push({ path, handler, isRegExp });
  // Keep static routes checked before regex
  routes.sort((a, b) => (a.isRegExp === b.isRegExp ? 0 : a.isRegExp ? 1 : -1));
}

function matchRoute(path) {
  for (const route of routes) {
    if (route.isRegExp) {
      const m = path.match(route.path);
      if (m) return { route, params: m.groups || m.slice(1) };
    } else if (route.path === path || route.path === path.replace(/\/$/, "")) {
      return { route, params: {} };
    }
  }
  return null;
}

export function navigate(path, { replace = false } = {}) {
  const target = path.startsWith("#") ? path : `#${path}`;
  if (replace) {
    history.replaceState(null, "", target);
  } else {
    history.pushState(null, "", target);
  }
  dispatchRoute();
}

export function dispatchRoute() {
  const raw = window.location.hash.slice(1) || "/";
  const path = raw.split("?")[0];
  const match = matchRoute(path);

  const main = document.getElementById("main");
  if (!main) return;

  // Clear previous content
  main.innerHTML = "";

  if (!match) {
    const tpl = document.getElementById("route-not-found");
    if (tpl) main.appendChild(tpl.content.cloneNode(true));
    currentRoute = null;
    return;
  }

  currentRoute = { ...match, path };
  match.route.handler(match.params).then((el) => {
    if (el) {
      main.appendChild(el);
    }
    window.scrollTo(0, 0);
  });
}

export function initRouter() {
  window.addEventListener("hashchange", dispatchRoute);
  window.addEventListener("popstate", dispatchRoute);
  dispatchRoute();
}

export function getCurrentRoute() {
  return currentRoute;
}