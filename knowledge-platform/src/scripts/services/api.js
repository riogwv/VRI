/* ==========================================================================
   Base API client — timeout, retry, error handling, no secrets exposed
   ========================================================================== */

const DEFAULT_TIMEOUT = 15000;
const MAX_RETRIES = 2;

export class ApiError extends Error {
  constructor(message, status, url) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
  }
}

export async function fetchJson(url, { method = "GET", headers = {}, body, signal, timeout = DEFAULT_TIMEOUT, retries = MAX_RETRIES } = {}) {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeout);

  const opts = {
    method,
    headers: { Accept: "application/json", ...headers },
    signal: controller.signal,
  };
  if (body) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, opts);
      clearTimeout(tid);

      if (!res.ok) {
        throw new ApiError(
          res.statusText || "Request gagal",
          res.status,
          url
        );
      }
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        return await res.json();
      }
      return await res.text();
    } catch (err) {
      lastErr = err;
      if (err.name === "AbortError") {
        throw new ApiError("Waktu habis (timeout)", 408, url);
      }
      if (attempt < retries && err instanceof ApiError && err.status >= 500) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

export function buildQuery(params) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  return sp.toString();
}