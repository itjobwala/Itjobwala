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
