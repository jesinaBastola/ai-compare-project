// utils/cache.js
//
// Simple in-memory cache so repeated requests for the same combination
// of tools (e.g. "chatgpt-vs-claude") don't repeat DB/AI calls every time.
//
// This satisfies the spec's "designed to be easily cacheable" requirement.
// It's in-memory for now (works fine for a single server instance / demo).
// For multi-instance production deployments, swap this for Redis - the
// get/set/buildCacheKey interface below would stay identical, so nothing
// else in the app needs to change.

const store = new Map(); // key -> { value, expiresAt }

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Build a deterministic cache key from a list of tool slugs.
 * Sorting first means ["claude","chatgpt"] and ["chatgpt","claude"]
 * hit the same cache entry.
 */
function buildCacheKey(slugs) {
  return `compare:${slugs.slice().sort().join("+")}`;
}

function get(key) {
  const entry = store.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    store.delete(key); // expired - treat as a miss
    return null;
  }

  return entry.value;
}

function set(key, value, ttlMs = DEFAULT_TTL_MS) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

module.exports = { buildCacheKey, get, set };
