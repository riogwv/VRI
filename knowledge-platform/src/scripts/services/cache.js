/* ==========================================================================
   Simple in-memory cache with TTL
   ========================================================================== */

const store = new Map();

export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function cacheSet(key, value, ttlMs) {
  store.set(key, { value, expiry: Date.now() + ttlMs });
}

export function cacheDel(key) {
  store.delete(key);
}

export function cacheClear() {
  store.clear();
}