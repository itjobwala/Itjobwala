/**
 * skillMatcher.js — Normalized, token-aware skill matching.
 *
 * Replaces character-level substring matching (s.includes(kw) || kw.includes(s))
 * which caused false positives like "test" → "testng" via character containment,
 * and "github actions" → "git" via character substring.
 *
 * ── Three matching rules ──────────────────────────────────────────────────────
 *
 * Rule 1 — Exact match (always).
 *   "playwright" === "playwright" ✓
 *
 * Rule 2a — Skill is longer than keyword.
 *   Check whether the keyword's word tokens appear as a contiguous sequence
 *   ANYWHERE in the skill's word tokens (all positions, not just position 0).
 *   "selenium webdriver"   → keyword "selenium":     pos 0 ✓
 *   "rest api testing"     → keyword "api testing":  pos 1 ✓
 *   "page object model (pom)" → kw "page object model": pos 0 ✓
 *
 * Rule 2b — Keyword is longer than skill, multi-word skill.
 *   Check whether the skill's word tokens appear as a contiguous sequence
 *   ANYWHERE in the keyword's word tokens.
 *   "api testing"         ⊂ "rest api testing"              pos 1 ✓
 *   "performance testing" ⊂ "load and performance testing"  pos 2 ✓
 *   "mobile testing"      ⊂ "android mobile testing"        pos 1 ✓
 *   "github actions"      ⊂ "github actions workflow"       pos 0 ✓
 *   "rest assured"        ⊂ "rest assured api automation"   pos 0 ✓
 *   "page object model"   ⊂ "page object model (pom)"       pos 0 ✓
 *
 * Rule 3 — Keyword is longer, single-word skill (named tool only).
 *   Only the FIRST word of the keyword is checked (word-boundary prefix).
 *   Generic category words are explicitly blocked by GENERIC_TOKENS.
 *   "selenium"  → "selenium webdriver":  kwWords[0]==="selenium" ✓ (tool)
 *   "api"       → "api testing":         blocked by GENERIC_TOKENS ✗
 *   "automation"→ "automation testing":  blocked by GENERIC_TOKENS ✗
 *
 * ── What is NOT allowed ───────────────────────────────────────────────────────
 *   Character-level substring ("testng".includes("test"))          — eliminated
 *   "github actions" counting as "git" via substring               — eliminated
 *   Short/generic single-word prefix matching (api, test, manual…) — blocked
 *
 * Both strings must be pre-normalized (lowercase, trimmed) by the caller.
 */

/**
 * Single-word tokens that are generic QA category/method words.
 * Blocked from Rule 3 (single-word prefix of longer keyword) because they
 * produce false-positive hits against compound keyword phrases.
 * Named tools (selenium, playwright, docker…) are NOT in this set.
 */
const GENERIC_TOKENS = new Set([
  'test', 'testing',
  'api',
  'automation',
  'manual',
  'load',
  'stress',
  'regression',
  'functional',
  'integration',
  'mobile',
  'performance',
  'security',
  'smoke',
  'sanity',
  'unit',
  'end',
  'e2e',
  'uat',
  'bdd',
  'tdd',
  'qa',
  'qe',
  'sqa',
  'cross',
  'browser',
  'platform',
  'acceptance',
  'exploratory',
  'system',
  'sprint',
  'agile',
  'scrum',
  'defect',
  'bug',
  'quality',
]);

/** Check if `needleWords` appear as a contiguous word sequence anywhere in `haystackWords`. */
function containsWordSequence(haystackWords, needleWords) {
  const n = needleWords.length;
  const needle = needleWords.join(' ');
  for (let i = 0; i <= haystackWords.length - n; i++) {
    if (haystackWords.slice(i, i + n).join(' ') === needle) return true;
  }
  return false;
}

/**
 * Match one candidate skill string against one ATS keyword string.
 * Both must be pre-normalized (lowercase, trimmed).
 *
 * @param {string} skill   - candidate skill
 * @param {string} keyword - ATS keyword
 * @returns {boolean}
 */
export function skillMatches(skill, keyword) {
  // Rule 1 — Exact match
  if (skill === keyword) return true;

  const skillWords = skill.split(' ');
  const kwWords    = keyword.split(' ');

  if (skillWords.length === kwWords.length) {
    // Same word count, not exact → no match (avoid partial character overlap).
    return false;
  }

  if (skillWords.length > kwWords.length) {
    // Rule 2a — Skill is longer (more specific variant of the keyword).
    // Check keyword appears anywhere in skill's word sequence.
    // "selenium webdriver" → keyword "selenium":   pos 0  ✓
    // "rest api testing"   → keyword "api testing": pos 1  ✓
    return containsWordSequence(skillWords, kwWords);
  }

  // kwWords.length > skillWords.length — keyword is longer than skill.

  if (skillWords.length > 1) {
    // Rule 2b — Multi-word skill: check if it appears anywhere in the keyword.
    // "api testing" ⊂ "rest api testing":            pos 1  ✓
    // "github actions" ⊂ "github actions workflow":   pos 0  ✓
    return containsWordSequence(kwWords, skillWords);
  }

  // Rule 3 — Single-word skill, keyword is longer.
  // Block generic category words entirely.
  if (GENERIC_TOKENS.has(skill)) return false;
  // Named tool: only matches when it is the FIRST word of the keyword.
  // "selenium" → "selenium webdriver": kwWords[0]==="selenium"  ✓
  // Restricting to position 0 prevents "docker" matching "no docker needed" etc.
  return kwWords[0] === skill;
}
