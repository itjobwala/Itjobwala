/**
 * Centralised XSS sanitizer for user-provided text fields.
 *
 * Every controller that persists free-text from users should run values
 * through sanitizeText() (single string) or sanitizeFields() (object)
 * BEFORE passing them to the ORM.
 *
 * Uses the same `xss` library already used for chat messages.
 */

import xss from 'xss';

// Strict options: strip ALL HTML tags — profile fields are plain text,
// never rich HTML.  This is stronger than the chat config (which might
// keep some harmless tags).
const XSS_OPTIONS = {
  whiteList:         {},          // allow zero HTML tags
  stripIgnoreTag:    true,        // strip (don't escape) unknown tags
  stripIgnoreTagBody: ['script', 'style', 'noscript'], // remove entire <script>…</script>
};

/**
 * Sanitize a single string value.  Returns the cleaned string.
 * Non-string values are passed through unchanged.
 */
export function sanitizeText(value) {
  if (typeof value !== 'string') return value;
  return xss(value, XSS_OPTIONS);
}

/**
 * Sanitize every string-valued property in a plain object (one level deep).
 * Returns a new object — the original is not mutated.
 *
 * Useful for bulk-sanitizing a request body before patching the DB.
 */
export function sanitizeFields(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const [key, val] of Object.entries(obj)) {
    out[key] = sanitizeText(val);
  }
  return out;
}

/**
 * Recursively sanitize all string values inside any JSON-serialisable value.
 * Preserves structure (objects, arrays), numbers, booleans, and null unchanged.
 *
 * Cycle-safe (WeakSet) and depth-capped at MAX_DEPTH to reject pathological payloads.
 * Non-plain objects (class instances, Buffers) are returned as-is.
 */
const MAX_DEPTH = 6;

export function deepSanitize(value) {
  return _walk(value, 0, new WeakSet());
}

function _walk(value, depth, seen) {
  if (typeof value === 'string') return sanitizeText(value);
  if (depth >= MAX_DEPTH) return value;
  if (Array.isArray(value)) {
    if (seen.has(value)) return value;
    seen.add(value);
    return value.map(item => _walk(item, depth + 1, seen));
  }
  if (value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    if (seen.has(value)) return value;
    seen.add(value);
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = _walk(val, depth + 1, seen);
    }
    return out;
  }
  return value;
}
