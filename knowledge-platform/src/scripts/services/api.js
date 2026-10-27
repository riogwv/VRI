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
  const requestHeaders = { Accept: "application/json", ...headers };
  if (body) requestHeaders["Content-Type"] = "application/json";

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (signal?.aborted) throw signal.reason || new DOMException("Aborted", "AbortError");
    const controller = new AbortController();
    let timedOut = false;
    const abort = () => controller.abort(signal.reason);
    signal?.addEventListener("abort", abort, { once: true });
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeout);
    try {
      const res = await fetch(url, {
        method, headers: requestHeaders, signal: controller.signal,
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (!res.ok) throw new ApiError(res.statusText || "Request gagal", res.status, url);
      const ct = res.headers.get("content-type") || "";
      return ct.includes("application/json") ? await res.json() : await res.text();
    } catch (err) {
      if (timedOut) throw new ApiError("Waktu habis (timeout)", 408, url);
      if (signal?.aborted) throw signal.reason || err;
      if (!(attempt < retries && err instanceof ApiError && err.status >= 500)) throw err;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
  }
}

export function buildQuery(params) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  return sp.toString();
}