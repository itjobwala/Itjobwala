// Verbs that signal ownership, impact, and decisive action
const STRONG_VERBS = new Set([
  'architected','automated','built','championed','created','delivered','deployed',
  'designed','developed','drove','engineered','established','executed','founded',
  'generated','grew','implemented','improved','increased','launched','led',
  'migrated','optimized','orchestrated','pioneered','reduced','refactored',
  'released','revamped','scaled','shipped','spearheaded','streamlined','transformed',
  'authored','collaborated','coordinated','defined','enhanced','integrated',
  'introduced','maintained','managed','mentored','modernized','monitored',
  'owned','partnered','published','rebuilt','resolved','restructured','saved',
  'solved','standardized','trained','upgraded','validated','wrote',
]);

// Phrases / verbs that signal passive, vague, or low-ownership involvement
const WEAK_PATTERNS = [
  /\bresponsible for\b/i,
  /\btasked with\b/i,
  /\bhelped (to|with)?\b/i,
  /\bassisted (with|in)?\b/i,
  /\bwas (involved|part of|responsible)\b/i,
  /\bparticipated in\b/i,
  /\binvolved in\b/i,
  /\bworked on\b/i,
  /\bcontributed to\b/i,
  /\bprovided support\b/i,
  /\bsupported the\b/i,
  /\bhandled (the|various)?\b/i,
];

/**
 * Classify bullet points or sentences from experience text.
 * Returns { strong: string[], weak: string[], neutral: string[], score: number }
 */
export function analyzeActionVerbs(text) {
  if (!text) return { strong: [], weak: [], neutral: [], score: 0 };

  // Split on newlines and punctuation to get sentence-like units
  const lines = text
    .split(/[\n\r.•\-–—]+/)
    .map(l => l.trim())
    .filter(l => l.length > 8);

  const strong  = [];
  const weak    = [];
  const neutral = [];

  for (const line of lines) {
    const firstWord = line.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');

    if (STRONG_VERBS.has(firstWord)) {
      strong.push(firstWord);
    } else if (WEAK_PATTERNS.some(p => p.test(line))) {
      weak.push(line.slice(0, 40).trim());
    } else {
      neutral.push(firstWord);
    }
  }

  const scored = strong.length + neutral.length + weak.length;
  const score  = scored === 0 ? 50 : Math.round((strong.length / scored) * 100);

  return {
    strong:  [...new Set(strong)].slice(0, 6),
    weak:    weak.slice(0, 4),
    neutral: [],
    score,
  };
}

/**
 * Count quantified achievements — numbers appearing in contexts that imply impact.
 */
export function countQuantifiedAchievements(text) {
  if (!text) return { count: 0, examples: [] };

  const patterns = [
    /\d+\s*%/g,                                   // percentages
    /\$\s*\d[\d,.]+[KMB]?/g,                     // dollar amounts
    /\d+[KMB]\+?\s*(users?|customers?|requests?|queries?|transactions?)/gi,
    /\d+x\s/g,                                   // multipliers like 3x faster
    /reduced\s+\w+\s+by\s+\d+/gi,
    /improved\s+\w+\s+by\s+\d+/gi,
    /increased\s+\w+\s+by\s+\d+/gi,
    /team of\s+\d+/gi,
    /\d+\s+(engineers?|developers?|testers?|members?)/gi,
    /\d+\s+(test cases?|test scripts?|automated tests?)/gi,
    /\bfrom\s+[\d.]+\s+to\s+[\d.]+/gi,           // "from X to Y"
    /\d+\s*(hours?|days?|weeks?|minutes?)\s+(saved?|reduced?|faster)/gi,
  ];

  const matches = [];
  for (const pattern of patterns) {
    const found = text.match(pattern) ?? [];
    matches.push(...found.slice(0, 2)); // cap per pattern
  }

  const unique  = [...new Set(matches)].slice(0, 6);
  return { count: unique.length, examples: unique };
}
