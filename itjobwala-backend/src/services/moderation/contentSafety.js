/**
 * Content-safety engine for job listings.
 * Rules are deterministic and heuristic — false positives are acceptable
 * (they route to admin review or recruiter edits, not a hard block on publishing).
 *
 * Export: checkJobContent(job) → { passed: boolean, flags: Flag[] }
 * Flag shape: { code: string, severity: 'block'|'warn', message: string, field: string }
 */

// ── Editable rule lists ───────────────────────────────────────────────────────

const FRAUD_FEE_PATTERNS = [
  /registration\s+fee/i,
  /security\s+deposit/i,
  /training\s+fee/i,
  /processing\s+fee/i,
  /joining\s+fee/i,
  /pay\s*[₹rs\.]+\s*\d+/i,
  /send\s*[₹rs\.]+/i,
  /money\s+transfer/i,
  /wire\s+transfer/i,
  /guaranteed\s+(income|earnings|salary)/i,
  /earn\s+(upto|up\s+to|₹|\$)\s*\d+\s+(daily|weekly|per\s+day)/i,
  /multi.?level\s+marketing/i,
  /\bmlm\b/i,
  /network\s+marketing/i,
  /investment\s+required/i,
  /deposit\s+required/i,
  /pay\s+(before|to)\s+(join|start)/i,
  /refundable\s+deposit/i,
];

const OFF_PLATFORM_PATTERNS = [
  // Email addresses (bare)
  /[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/i,
  // Phone numbers (Indian + international)
  /(\+91[\-\s]?)?[6-9]\d{9}\b/,
  /\b\d{3}[\-.\s]\d{3}[\-.\s]\d{4}\b/,
  // WhatsApp / Telegram handles
  /whatsapp\s*(me|us|at|:|\d)/i,
  /telegram\s*(me|us|at|:|\d)/i,
  /contact\s+(me|us|directly)\s+(at|on|via)/i,
  /reach\s+(me|us)\s+(at|on|via)/i,
  /dm\s+(me|us)\b/i,
];

const DISCRIMINATORY_PATTERNS = [
  // Gender
  /\bmales?\s+only\b/i,
  /\bfemales?\s+only\b/i,
  /\b(only|strictly)\s+(male|female|men|women)\b/i,
  /\b(male|female)\s+(candidates?|applicants?)\s+(only|preferred)\b/i,
  // Age
  /\b(below|under|age\s+(limit|bar|criteria))\s+\d{2}\b/i,
  /\bage\s+\d{2}[\s-]*to[\s-]*\d{2}\b/i,
  /\bbelow\s+\d{2}\s+years?\b/i,
  // Marital status
  /\bunmarried\s+only\b/i,
  /\bmarried\s+only\b/i,
  /\b(unmarried|single)\s+candidates?\b/i,
  // Religion / caste
  /\b(hindus?|muslims?|christians?|sikhs?|jains?)\s+only\b/i,
  /\b(brahmin|kshatriya|vaishya|shudra|sc|st|obc)\s+(only|preferred|candidates?)\b/i,
];

const PROFANITY_LIST = [
  /\bfuck\b/i, /\bshit\b/i, /\bbitch\b/i, /\basshole\b/i,
  /\bcunt\b/i, /\bdick\b/i, /\bfucking\b/i, /\bbullshit\b/i,
];

// Suspicious external URL pattern (non-itjobwala domains)
const EXTERNAL_URL_PATTERN = /https?:\/\/(?!(?:www\.)?itjobwala\.com)[^\s"'<>]+/gi;

const SPAM_CAPS_RATIO_THRESHOLD = 0.6; // >60% uppercase = spam
const MIN_DESCRIPTION_CHARS     = 100;

// ── Helper ────────────────────────────────────────────────────────────────────

function collectText(job) {
  return {
    title:           String(job.title           ?? ''),
    location:        String(job.location        ?? ''),
    description:     String(job.description     ?? ''),
    responsibilities: (Array.isArray(job.responsibilities) ? job.responsibilities.join(' ') : String(job.responsibilities ?? '')),
    requirements:    (Array.isArray(job.requirements)     ? job.requirements.join(' ')     : String(job.requirements     ?? '')),
    benefits:        (Array.isArray(job.benefits)         ? job.benefits.join(' ')         : String(job.benefits         ?? '')),
    niceToHave:      (Array.isArray(job.nice_to_have)     ? job.nice_to_have.join(' ')     : String(job.nice_to_have     ?? '')),
  };
}

function capsRatio(str) {
  const letters = str.replace(/[^a-zA-Z]/g, '');
  if (!letters.length) return 0;
  return (str.replace(/[^A-Z]/g, '').length) / letters.length;
}

// Longest run of consecutive consonants in a word (real English rarely exceeds ~4-5).
function longestConsonantRun(word) {
  let max = 0;
  let current = 0;
  for (const ch of word) {
    if (/[aeiouAEIOU]/.test(ch)) {
      current = 0;
    } else {
      current += 1;
      if (current > max) max = current;
    }
  }
  return max;
}

function vowelRatio(word) {
  if (!word.length) return 0;
  const vowels = (word.match(/[aeiouAEIOU]/g) || []).length;
  return vowels / word.length;
}

const GIBBERISH_RATIO_THRESHOLD = 0.25;
const GIBBERISH_MIN_WORDS = 5;

// A 4+ letter "word" that looks like keyboard mash: either a long consonant
// run (>=5), or — for words of 5+ letters, to avoid tripping on short tech
// acronyms like "gRPC"/"HTTP" — essentially no vowels at all.
function isSuspiciousWord(word) {
  return longestConsonantRun(word) >= 5 || (word.length >= 5 && vowelRatio(word) < 0.15);
}

// A field reads as gibberish if either:
//  - it has enough words (>=5) to judge a ratio, and over 25% look suspicious
//    (avoids false positives from a single odd/technical word in prose), or
//  - it's short (title, location, a single bullet item) and contains ANY
//    suspicious word — a ratio isn't meaningful with only 1-4 words, but a
//    single keyboard-mash word in a field that's supposed to be a whole
//    title/location/bullet is already a strong signal on its own.
function isFieldGibberish(text) {
  const words = text.match(/[a-zA-Z]{4,}/g) || [];
  if (words.length === 0) return false;
  if (words.length < GIBBERISH_MIN_WORDS) {
    return words.some(isSuspiciousWord);
  }
  return words.filter(isSuspiciousWord).length / words.length > GIBBERISH_RATIO_THRESHOLD;
}

// ── Main export ───────────────────────────────────────────────────────────────

export function checkJobContent(job) {
  const flags = [];
  const fields = collectText(job);
  const allText = Object.values(fields).join(' ');
  const descPlusContent = [fields.description, fields.responsibilities, fields.requirements].join(' ');

  // 1. Fraud / payment demands (block)
  for (const pattern of FRAUD_FEE_PATTERNS) {
    if (pattern.test(allText)) {
      flags.push({
        code:     'FRAUD_FEE_SIGNAL',
        severity: 'block',
        message:  'Job content contains language that suggests payment is requested from applicants (e.g. registration fee, deposit, or guaranteed income claims). Remove all such references.',
        field:    'description',
      });
      break;
    }
  }

  // 2. Off-platform contact info (block)
  for (const pattern of OFF_PLATFORM_PATTERNS) {
    if (pattern.test(descPlusContent)) {
      flags.push({
        code:     'OFF_PLATFORM_CONTACT',
        severity: 'block',
        message:  'Job content contains contact information (email, phone, or messaging app) that encourages candidates to contact outside the platform. Remove direct contact details.',
        field:    'description',
      });
      break;
    }
  }

  // 3. Discriminatory requirements (block)
  for (const pattern of DISCRIMINATORY_PATTERNS) {
    if (pattern.test(allText)) {
      flags.push({
        code:     'DISCRIMINATORY_LANGUAGE',
        severity: 'block',
        message:  'Job content contains discriminatory restrictions based on gender, age, marital status, religion, or caste. Remove all such requirements.',
        field:    'requirements',
      });
      break;
    }
  }

  // 4. Profanity / offensive language (block)
  for (const pattern of PROFANITY_LIST) {
    if (pattern.test(allText)) {
      flags.push({
        code:     'PROFANITY',
        severity: 'block',
        message:  'Job content contains offensive or inappropriate language.',
        field:    'description',
      });
      break;
    }
  }

  // 5. Suspicious external URLs (warn)
  const urlMatches = allText.match(EXTERNAL_URL_PATTERN);
  if (urlMatches && urlMatches.length > 0) {
    flags.push({
      code:     'SUSPICIOUS_URL',
      severity: 'warn',
      message:  `Job content contains external URLs (${urlMatches.slice(0, 2).join(', ')}${urlMatches.length > 2 ? '…' : ''}). External links are not recommended in job listings.`,
      field:    'description',
    });
  }

  // 6. Spam title (all-caps) (warn)
  if (capsRatio(fields.title) > SPAM_CAPS_RATIO_THRESHOLD && fields.title.length > 5) {
    flags.push({
      code:     'SPAM_TITLE',
      severity: 'warn',
      message:  'Job title appears to be written mostly in capital letters. Use sentence or title case.',
      field:    'title',
    });
  }

  // 7. Description too short (warn)
  if (fields.description.trim().length < MIN_DESCRIPTION_CHARS) {
    flags.push({
      code:     'SHORT_DESCRIPTION',
      severity: 'warn',
      message:  `Job description is too short (${fields.description.trim().length} characters). Provide at least ${MIN_DESCRIPTION_CHARS} characters for a meaningful listing.`,
      field:    'description',
    });
  }

  // 8. Salary sanity: salary_min > salary_max (block)
  const salMin = Number(job.salary_min ?? job.salaryMin ?? 0);
  const salMax = Number(job.salary_max ?? job.salaryMax ?? 0);
  if (salMin > 0 && salMax > 0 && salMin > salMax) {
    flags.push({
      code:     'INVALID_SALARY_RANGE',
      severity: 'block',
      message:  `Minimum salary (${salMin}) exceeds maximum salary (${salMax}). Fix the salary range.`,
      field:    'salary_min',
    });
  }

  // 9. Title required (block)
  if (!fields.title.trim()) {
    flags.push({
      code:     'MISSING_TITLE',
      severity: 'block',
      message:  'Job title is required.',
      field:    'title',
    });
  }

  // 10. Description required (block)
  if (!fields.description.trim()) {
    flags.push({
      code:     'MISSING_DESCRIPTION',
      severity: 'block',
      message:  'Job description is required.',
      field:    'description',
    });
  }

  // 11. Gibberish / nonsensical content — checked per field (including short
  // fields like title/location) so the flag points at the actual offending
  // field, and so a single garbage bullet/title/location can't hide behind
  // a long, otherwise-legitimate description.
  const GIBBERISH_FIELDS = [
    { key: 'title',            label: 'title',            dbField: 'title' },
    { key: 'location',         label: 'location',         dbField: 'location' },
    { key: 'description',      label: 'description',      dbField: 'description' },
    { key: 'responsibilities', label: 'responsibilities', dbField: 'responsibilities' },
    { key: 'requirements',     label: 'requirements',     dbField: 'requirements' },
    { key: 'niceToHave',       label: 'nice to have',     dbField: 'nice_to_have' },
    { key: 'benefits',         label: 'benefits',         dbField: 'benefits' },
  ];

  const gibberishFieldLabels = GIBBERISH_FIELDS
    .filter(({ key }) => isFieldGibberish(fields[key]))
    .map(({ label }) => label);

  if (gibberishFieldLabels.length > 0) {
    flags.push({
      code:     'GIBBERISH_CONTENT',
      severity: 'block',
      message:  `Job content appears to contain random or nonsensical text in: ${gibberishFieldLabels.join(', ')}. Rewrite with clear, meaningful content.`,
      field:    GIBBERISH_FIELDS.find(f => gibberishFieldLabels.includes(f.label))?.dbField ?? 'description',
    });
  }

  const hasBlock = flags.some(f => f.severity === 'block');

  return { passed: !hasBlock, flags };
}
