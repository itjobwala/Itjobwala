/**
 * Extract structured sections from raw resume text using heuristic patterns.
 * Returns: contact_info, experience_entries, education_entries,
 *          project_entries, certification_entries, summary_text
 *
 * AI-ready: each function is a pure transform — easy to swap for LLM extraction.
 */

import { extractSkillsFromText } from './normalizeSkills.js';

// ── Contact Info ──────────────────────────────────────────────────────────────

export function extractContactInfo(text) {
  const emailMatch   = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  const phoneMatch   = text.match(/(?:\+91[\s\-]?)?[6-9]\d{9}|(?:\+\d{1,3}[\s\-]?)?\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}/);
  const linkedinMatch = text.match(/linkedin\.com\/in\/([a-zA-Z0-9\-_]+)/i);
  const githubMatch   = text.match(/github\.com\/([a-zA-Z0-9\-_]+)/i);

  // Name heuristic: first non-empty line that looks like a name (2–5 words, no digits)
  const firstLines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let name = null;
  for (const line of firstLines.slice(0, 5)) {
    if (/^[A-Za-z]+(?: [A-Za-z]+){1,4}$/.test(line) && line.split(' ').length <= 5) {
      name = line;
      break;
    }
  }

  return {
    name:     name,
    email:    emailMatch?.[0]   ?? null,
    phone:    phoneMatch?.[0]   ?? null,
    linkedin: linkedinMatch ? `linkedin.com/in/${linkedinMatch[1]}` : null,
    github:   githubMatch   ? `github.com/${githubMatch[1]}`        : null,
  };
}

// ── Experience ────────────────────────────────────────────────────────────────

// FIX D05/D06/D07/D21: Anchored (full-line) regexes prevent company/cert names that
// contain section keywords (e.g. "Experience Labs", "PMP Certification", "Education First")
// from being silently consumed as section headers.
const EXPERIENCE_HEADERS = /^\s*(work\s*experience|professional\s*experience|employment\s*(?:history)?|career\s*(?:history|summary)?|experience)\s*:?\s*$/i;
const EDUCATION_HEADERS  = /^\s*(education(?:al)?(?:\s+(?:background|history|qualifications?))?|academic\s*(?:background|credentials?|history|qualifications?)?|qualifications?|academic\s+record)\s*:?\s*$/i;
const PROJECT_HEADERS    = /\b(key\s+projects?|major\s+projects?|project\s+highlights?|side\s*projects?|personal\s*projects?|portfolio|projects?)\b/i;
const CERT_HEADERS       = /^\s*(certifications?|certificates?|licen[sc]es?|credentials?|professional\s+development)\s*:?\s*$/i;
const SUMMARY_SECTION_RE = /^\s*(professional\s+)?summary\s*:?\s*$|^\s*profile\s*:?\s*$|^\s*(career\s+)?objective\s*:?\s*$|^\s*about\s+me\s*:?\s*$/i;

// FIX D16: expanded to cover "Areas of Expertise", "Key Skills", "Technical Expertise"
const SKILLS_SECTION_HEADERS    = /^\s*(technical\s+)?skills?\s*:?\s*$|^\s*core\s+competenc(y|ies)\s*:?\s*$|^\s*technologies?\s*:?\s*$|^\s*areas?\s+of\s+expertise\s*:?\s*$|^\s*key\s+skills?\s*:?\s*$|^\s*technical\s+expertise\s*:?\s*$/i;
const LANGUAGES_SECTION_HEADERS = /^\s*(programming\s+)?languages?\s*:?\s*$/i;
const MISC_SECTION_HEADERS      = /^\s*hobbies\s*:?\s*$|^\s*interests?\s*:?\s*$|^\s*references?\s*:?\s*$/i;

// Used by isProjectSectionHeader to reject role/title lines masquerading as project names
const ROLE_TITLE_GUARD_RE = /\b(engineer|developer|analyst|manager|architect|lead|consultant|specialist|intern|fresher|tester|designer|programmer)\b/i;

// Functional-component suffixes — used to detect subsystem vs. parent project
const SUBSYSTEM_SUFFIX_RE = /\b(engine|module|workflow|integration|pipeline|subsystem|processor|middleware|handler|component)\s*$/i;

// Product-noun anchors that strongly indicate a standalone parent project
const PRODUCT_NOUN_PARENT_RE = /\b(suite|portal|platform|dashboard|marketplace|exchange|workspace|studio|console|hub|network)\b/i;

export function splitIntoSections(text) {
  const lines  = text.split('\n');
  const result = {
    preamble:       [],
    summary:        [],
    skills:         [],
    languages:      [],
    experience:     [],
    education:      [],
    projects:       [],
    certifications: [],
    _misc:          [],
  };
  let current = 'preamble';

  for (const line of lines) {
    const trimmed   = line.trim();
    const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;

    // Section header detection — consume the header line itself (don't push to array)
    if (trimmed && wordCount < 6) {
      if      (EXPERIENCE_HEADERS.test(trimmed))                                           { current = 'experience';     continue; }
      else if (EDUCATION_HEADERS.test(trimmed))                                            { current = 'education';      continue; }
      else if (PROJECT_HEADERS.test(trimmed) && !ROLE_TITLE_GUARD_RE.test(trimmed))       { current = 'projects';       continue; }
      else if (CERT_HEADERS.test(trimmed))                                                 { current = 'certifications'; continue; }
      else if (SUMMARY_SECTION_RE.test(trimmed))      { current = 'summary';        continue; }
      else if (SKILLS_SECTION_HEADERS.test(trimmed))  { current = 'skills';         continue; }
      else if (LANGUAGES_SECTION_HEADERS.test(trimmed)) { current = 'languages';    continue; }
      else if (MISC_SECTION_HEADERS.test(trimmed))    { current = '_misc';          continue; }
    }

    result[current].push(line);
  }

  return result;
}

const MONTH_WORD_SRC = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\w*';

// Shared pattern source — handles all common date formats:
//   "Apr 2022 – Present", "2022 - 2024", "09/2022 - 03/2024",
//   "2022/09 – 2024/03", "09-2022 to 03-2024", "January 2020 to March 2023"
const DATE_RANGE_SRC =
  `(?:\\d{1,2}[/\\-])?(?:${MONTH_WORD_SRC}[\\s,]+)?(\\b(?:19|20)\\d{2}\\b)(?:[/\\-]\\d{1,2})?` +
  `(?:\\s+to\\s+|[\\s\\-–—,]+)` +
  `(?:\\d{1,2}[/\\-])?(?:${MONTH_WORD_SRC}[\\s,]+)?(\\b(?:19|20)\\d{2}\\b|present|current|now)(?:[/\\-]\\d{1,2})?`;

// Global version — used ONLY by estimateExperienceYears (matchAll)
const YEAR_RANGE = new RegExp(DATE_RANGE_SRC, 'gi');

// Non-global — used inside extractExperienceEntries to get m.index + capture groups via exec()
const DATE_RANGE_RE = new RegExp(DATE_RANGE_SRC, 'i');

// Lines that are clearly bullet descriptions
const BULLET_RE = /^[\-•*◦▸]\s+|^\d+\.\s+/;

// Inline role–company separators: "Role - Company", "Role – Company", "Role at Company",
//                                 "Role @ Company", "Role | Company"
const INLINE_SEP_RE = /^(.+?)(?:\s+[-–—]\s+|\s+at\s+|\s+@\s+|\s+\|\s+)(.+)$/;

// Role-keyword pattern — signals the start of a new experience block.
// FIX D14: expanded to cover non-engineering roles: academic, medical, legal, sales, creative.
const EXP_ROLE_TITLE_RE = /\b(engineer|developer|analyst|manager|architect|lead|consultant|specialist|intern|fresher|tester|designer|programmer|scientist|officer|director|head|associate|executive|founder|owner|master|coordinator|writer|administrator|representative|practitioner|vp|vice|researcher|fellow|lecturer|professor|faculty|physician|nurse|doctor|therapist|strategist|recruiter|auditor|actuary|trader|attorney|paralegal|planner|journalist|reporter|accountant|creator)\b/i;

// Sentence-opening action verbs — a line starting with these is a description, not a title.
const SENTENCE_VERB_RE = /^\s*(led|built|created|developed|implemented|designed|managed|worked|collaborated|ensured|maintained|improved|reduced|increased|achieved|responsible|handled|supported|used|wrote|tested|automated|participated|contributed|coordinated|resolved|delivered|mentored|reviewed|analyzed|optimized|monitored|deployed|configured|integrated|migrated|fixed|drove|defined|established|launched|spearheaded|owned|oversaw|streamlined|reported|assisted)\b/i;

// ── Experience helpers ────────────────────────────────────────────────────────

function detectDateRange(line) {
  const m = DATE_RANGE_RE.exec(line);
  if (!m) return null;
  return {
    duration:  m[0].trim(),
    offset:    m.index,
    startYear: parseInt(m[1], 10),
    endYear:   /present|current|now/i.test(m[2]) ? null : parseInt(m[2], 10),
  };
}

function isLocationLine(str) {
  if (!str) return false;
  if (/^\s*(remote|hybrid|on[-\s]?site)\s*$/i.test(str)) return true;
  if (!/^[A-Za-z][a-zA-Z\s]+,\s*[A-Za-z][a-zA-Z\s]+$/.test(str)) return false;
  if (str.length >= 50) return false;
  if (/\b(technologies|solutions|systems|services|consulting|labs|software|digital|infotech|pvt|ltd|llp|inc|llc|corp|group|international|enterprises?|industries)\b/i.test(str)) return false;
  const locLeft  = str.split(',')[0].trim();
  const locRight = str.slice(str.indexOf(',') + 1).trim();
  if (/^[A-Z]{2,}$/.test(locLeft)) return false;                                               // all-caps acronym: HDFC, KPIT, IBM
  if (/^[A-Za-z]+$/.test(locLeft) && /^[A-Z]{1,3}$/.test(locRight)) return false;             // single-word + country code: Google, USA
  return true;
}

function extractRoleCompany(headerLines) {
  const lines = headerLines
    .map(l => l.trim())
    .filter(l => l && !isLocationLine(l));

  if (!lines.length) return { title: '', company: '' };

  const inlineMatch = lines[0].match(INLINE_SEP_RE);
  if (inlineMatch) {
    const left  = inlineMatch[1].trim();
    const right = inlineMatch[2].trim();
    const rightHasRole = EXP_ROLE_TITLE_RE.test(right);
    const leftHasRole  = EXP_ROLE_TITLE_RE.test(left);

    if (rightHasRole && !leftHasRole) {
      // FIX D09: detect which separator was used
      const midStr = lines[0].slice(left.length, lines[0].length - right.length);
      if (/\s+at\s+/i.test(midStr)) {
        // "Platform at Scale Engineer" — whole line is a compound title
        return { title: lines[0], company: lines[1] ?? '' };
      }
      // FIX D09: "Infosys | QA Engineer" or "Corp – Software Engineer" — company left, role right
      return { title: right, company: left };
    }
    return { title: left, company: right };
  }

  // FIX D01/D03: two-line layout swap — if lines[1] has role keyword and lines[0] doesn't,
  // the first line is the company and second is the role (Layout B / promotion block).
  if (lines[1] && EXP_ROLE_TITLE_RE.test(lines[1]) && !EXP_ROLE_TITLE_RE.test(lines[0])) {
    return { title: lines[1], company: lines[0] };
  }

  return {
    title:   lines[0],
    company: lines[1] ?? '',
  };
}

function isLikelyRoleTitle(str) {
  if (!str || str.length > 60 || BULLET_RE.test(str)) return false;
  if (str.split(/\s+/).filter(Boolean).length > 6) return false;
  if (SENTENCE_VERB_RE.test(str)) return false;
  if (/[,;!?]/.test(str)) return false;          // commas/hard punctuation → sentence
  if (/\.\s*$/.test(str)) return false;           // trailing period → sentence end
  return EXP_ROLE_TITLE_RE.test(str);
}

// ── Experience extraction ─────────────────────────────────────────────────────

export function extractExperienceEntries(text) {
  const expLines = (splitIntoSections(text).experience || []).map(l => l.trim());

  const entries    = [];
  let headerLines  = [];
  let currentEntry = null;
  let lastCompany  = '';   // FIX D03: carryover for same-company promotion blocks

  const flush = () => {
    if (currentEntry && (currentEntry.title || currentEntry.company)) {
      // FIX D03: inherit company from previous entry when this entry has none
      // (same-company promotion block: "Google → Senior Eng → Software Eng")
      if (!currentEntry.company && lastCompany) {
        currentEntry.company = lastCompany;
      }
      if (currentEntry.company) lastCompany = currentEntry.company;
      entries.push(currentEntry);
    }
    currentEntry = null;
    headerLines  = [];
  };

  for (const line of expLines) {
    if (!line) continue;

    // Bullets handled unconditionally BEFORE date detection (Bug 1 fix: bullet with year range)
    if (BULLET_RE.test(line)) {
      if (currentEntry) {
        const clean = line.replace(/^[\-•*◦▸]\s+/, '').replace(/^\d+\.\s+/, '');
        if (clean.length > 5) {
          currentEntry.description += (currentEntry.description ? ' ' : '') + clean;
        }
      }
      continue;
    }

    const dateInfo = detectDateRange(line);

    if (dateInfo) {
      const beforeDate = line
        .slice(0, dateInfo.offset)
        .replace(/[-–—|,]\s*$/, '')
        .trim();

      // FIX D08: beforeDate starting with a sentence verb means this line is a description
      // sentence containing a year range (e.g. "Led migration from 2019 to 2020"), not an anchor.
      if (beforeDate && SENTENCE_VERB_RE.test(beforeDate)) {
        if (currentEntry) {
          currentEntry.description += (currentEntry.description ? ' ' : '') + line;
        }
        continue;
      }

      const allHeaders = beforeDate ? [...headerLines, beforeDate] : headerLines;
      flush();
      const { title, company } = extractRoleCompany(allHeaders);
      currentEntry = { title, company, duration: dateInfo.duration, description: '' };
      headerLines  = [];

    } else if (currentEntry) {
      if (!currentEntry.title && !isLocationLine(line) && line.length < 80) {
        currentEntry.title = line;
      } else if (!currentEntry.company && !isLocationLine(line) && line.length < 80) {
        currentEntry.company = line;
        // FIX D02/D25: post-date swap — if company looks like the role and title looks like the
        // company (Layout F: "Company → Date → Role" or "Date → Company → Role"), swap them.
        if (EXP_ROLE_TITLE_RE.test(currentEntry.company) && !EXP_ROLE_TITLE_RE.test(currentEntry.title)) {
          [currentEntry.title, currentEntry.company] = [currentEntry.company, currentEntry.title];
        }
      } else if (isLikelyRoleTitle(line)) {
        flush();
        headerLines = [line];
      } else if (!isLocationLine(line)) {
        currentEntry.description += (currentEntry.description ? ' ' : '') + line;
      }
    } else {
      if (line.length < 120) {
        headerLines.push(line);
      }
    }
  }

  flush();
  return entries;
}

// ── Education ─────────────────────────────────────────────────────────────────

// FIX D10/D12: expanded degree keyword list — BS, MS, BA, MA, Associate Degree, MEng, LLB, MD
const DEGREE_KEYWORDS = /\b(b\.?tech|m\.?tech|b\.?e|m\.?e|b\.?sc|m\.?sc|mba|bba|phd|ph\.d|bachelor|master|doctorate|diploma|bca|mca|b\.?com|m\.?com|b\.?s|m\.?s|b\.?a|m\.?a|associate|m\.?eng|llb|llm|m\.?d|d\.?o)\b/i;

const YEAR_ONLY_RE   = /^\s*(\d{4})\s*[-–—to]+\s*(\d{4}|present|current|now)\s*$/i;
const SECTION_HDR_RE = /^(SKILLS?|EXPERIENCE|WORK|PROJECTS?|CERTIF|AWARDS?|LANGUAGES?|HOBBIES|INTERESTS?|REFERENCES?|SUMMARY|PROFILE|OBJECTIVE)\b/i;
const GPA_LINE_RE    = /^\s*(?:gpa|cgpa|grade|percentage|marks?)\s*[:=]/i;  // FIX D11

export function extractEducationEntries(text) {
  const sections  = splitIntoSections(text);
  const eduLines  = sections['education'] || [];
  const entries   = [];

  let currentEntry = null;
  for (const line of eduLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const yearRangeInLine = trimmed.match(/\b(19|20)\d{2}\b.*\b(19|20)\d{2}\b|\b(19|20)\d{2}\b\s*[-–—to]+\s*(present|current|now)/i);
    const singleYear      = trimmed.match(/\b(20\d{2}|19\d{2})\b/);

    if (DEGREE_KEYWORDS.test(trimmed)) {
      if (currentEntry) entries.push(currentEntry);
      const embeddedYear = trimmed.match(/\b(20\d{2}|19\d{2})\b/);
      // Extract embedded institution: "B.Tech ... - IIT Delhi" → institution = "IIT Delhi"
      const degreeInstMatch = trimmed.match(/^(.+?)\s*[-–—]\s*([A-Z][A-Za-z\s.,']+?)(?:\s*[-–—]\s*(?:19|20)\d{2}.*)?$/);
      let degreeClean = trimmed.replace(/[-–—]\s*(19|20)\d{2}\b.*/g, '').trim();
      let embeddedInstitution = '';
      if (degreeInstMatch) {
        const possibleDegree = degreeInstMatch[1].trim();
        const possibleInst   = degreeInstMatch[2].trim();
        // Only extract as institution if left side contains a degree keyword
        if (DEGREE_KEYWORDS.test(possibleDegree) && possibleInst.length > 3 && possibleInst.length < 80) {
          degreeClean = possibleDegree;
          embeddedInstitution = possibleInst;
        }
      }
      currentEntry = {
        degree:      degreeClean,
        institution: embeddedInstitution,
        year:        embeddedYear ? parseInt(embeddedYear[0], 10) : null,
      };
    } else if (currentEntry) {
      if (YEAR_ONLY_RE.test(trimmed) || yearRangeInLine) {
        // Pure date range line — extract end year as graduation year
        const years = trimmed.match(/\b(19|20)\d{2}\b/g) ?? [];
        if (years.length >= 2) currentEntry.year = parseInt(years[years.length - 1], 10);
        else if (years.length === 1) currentEntry.year = parseInt(years[0], 10);
      } else if (!currentEntry.institution && trimmed.length < 120 && !BULLET_RE.test(trimmed) && !SECTION_HDR_RE.test(trimmed) && !GPA_LINE_RE.test(trimmed)) {
        currentEntry.institution = trimmed;
        // Try to pull year from institution line too
        if (!currentEntry.year && singleYear) {
          currentEntry.year = parseInt(singleYear[0], 10);
          currentEntry.institution = trimmed.replace(/\b(19|20)\d{2}\b\s*[-–—to]*\s*/g, '').trim();
        }
      }
    }
  }
  if (currentEntry) entries.push(currentEntry);
  return entries;
}

// ── Projects ──────────────────────────────────────────────────────────────────

const PROJECT_LABEL_SECTION_RE = /\b(domain|project|client|module|product|platform|application|system|portal|suite|app|dashboard|engine|service|component|track|stream)\s*:/i;
const PRODUCT_NOUN_SECTION_RE  = /\b(suite|portal|platform|dashboard|application|system|engine|service|gateway|hub|cloud|studio|console|manager|center|workspace|marketplace|exchange|network)\b/i;
// P4 FIX: expanded to capture general metrics (%, $, x multipliers, large counts, K/M/B suffixes) in addition to QA-specific ones
const SECTION_METRIC_RE = /(?:\d[\d,]*(?:[KMB])?\+?\s*(?:test\s*cases?|test\s*scripts?|automation\s*scripts?|scenarios?|endpoints?|api\s*(?:calls?|endpoints?|assertions?)|assertions?|bugs?|defects?|issues?|modules?|features?|screens?|flows?|users?|clients?|requests?|transactions?|records?)|(?:\d+%|\d+x|\d+\s*times?)\s*(?:reduction|improvement|increase|faster|coverage|efficiency|accuracy|savings?|decrease|optimization)|(?:reduced?|improved?|increased?|decreased?|saved?)\s+\w+(?:\s+\w+){0,3}\s+by\s+\d+%?|\$[\d,]+[KMB]?\s*(?:savings?|cost|revenue|value)?|\d+\+?\s*(?:hrs?|hours?)\s*(?:saved?|reduced?|automated?))/gi;
// P2/P6 FIX: matches "Tools:", "Tools Used:", "Tech Stack:", "Technologies:", "Technology:", "Stack:", "Tech:"
const TOOLS_SECTION_LINE_RE = /\b(?:tools?\s*(?:used\s*)?|tech(?:nolog(?:ies?)?)?(?:\s+stack)?|stack|framework(?:s?\s+used)?)\s*:/i;

/**
 * Returns true when a pipe-separated line is a technology stack listing
 * (React | Node | MongoDB) rather than a project header.
 *
 * Guards applied in order — any single guard returning false means the line
 * is a project header, not a tech stack.
 */
export function isTechnologyStackLine(line) {
  const t = line.trim();
  if (!t || !/\|/.test(t)) return false;

  const parts = t.split('|').map(p => p.trim()).filter(Boolean);
  if (parts.length < 2) return false;

  for (const p of parts) {
    if (PRODUCT_NOUN_SECTION_RE.test(p))   return false; // platform, suite, portal …
    if (/\([A-Z]{2,6}\)/.test(p))          return false; // (MBS), (CRM)
    if (/^\s*(domain|client|platform|category|tech(?:nology)?(?:\s+stack)?|type)\s*:/i.test(p)) return false;
    if (/\b(built|developed|created|implemented|designed|led|established)\b/i.test(p)) return false;
    if (/\b(engineer|developer|manager|architect|lead|analyst|director)\b/i.test(p))   return false;
    if (/\d+\.?\d*\s*(years?|months?|yrs?)/i.test(p))   return false; // duration
    if (/\b(19|20)\d{2}\b/.test(p))        return false; // year
  }

  // Multi-word (3+) capitalised first segment → product name, not tool name
  const firstWords = parts[0].split(/\s+/).filter(Boolean);
  if (firstWords.length >= 3 && /^[A-Z]/.test(parts[0])) return false;

  // Nothing here — product-noun guard above already handles "Admin Dashboard",
  // "Meta Platform", etc. The old 2-word all-caps check was over-broad and
  // rejected legitimate compound tech terms like "Spring Boot", "REST API".

  // App/product suffix in the first segment → project name
  if (/\b(app|bot|portal|site|tracker|hub|assistant|agent|dashboard|cli|sdk|tool)\b/i.test(parts[0])) return false;

  // All segments must be short (≤ 4 words, ≤ 40 chars) for a tech-stack line
  return parts.every(p => p.split(/\s+/).filter(Boolean).length <= 4 && p.length <= 40);
}

function detectEntityTypeFromName(name, hasOpenParent) {
  const t = (name || '').trim();
  if (/\([A-Z]{2,6}\)/.test(t))    return 'parent_project';
  if (PRODUCT_NOUN_PARENT_RE.test(t)) return 'parent_project';
  if (/[–—]/.test(t))              return 'parent_project';
  if (PROJECT_LABEL_SECTION_RE.test(t) && /domain\s*:/i.test(t)) return 'parent_project';
  if (hasOpenParent && SUBSYSTEM_SUFFIX_RE.test(t)) return 'subsystem';
  return 'parent_project';
}

function isProjectSectionHeader(line) {
  const t = line.trim();
  if (!t || t.length > 140 || BULLET_RE.test(t) || /[.!?]$/.test(t)) return false;

  // Tech stack lines are never project headers
  if (isTechnologyStackLine(t)) return false;

  // P2/P6 FIX: "Tools:", "Tools Used:", "Tech Stack:", "Technologies:" etc. are stack labels, not project names
  if (TOOLS_SECTION_LINE_RE.test(t)) return false;

  // P1 FIX: description sentences starting with articles/pronouns are not project names
  if (/^(?:a|an|the|this|it)\s/i.test(t)) return false;

  // Pipe-separated line that passed the tech-stack filter → project header
  if (/\|/.test(t)) return true;

  // Semantic project signals
  if (PROJECT_LABEL_SECTION_RE.test(t))  return true;
  if (/\([A-Z]{2,6}\)/.test(t) && /^[A-Z]/.test(t) && t.length < 100) return true;
  if (PRODUCT_NOUN_SECTION_RE.test(t) && /^[A-Z]/.test(t) && t.length < 100) return true;

  // Em-dash title format: "ProjectName – Brief description" (allows lowercase-start e.g. "eBullion – …")
  if (t.search(/[–—]/) > 0 && t.search(/[–—]/) < 60 && t.length < 140) return true;

  // Short title-case fallback — reject known non-project patterns
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length >= 1 && words.length <= 6 && t.length < 80) {
    if (/^\d/.test(t))           return false; // starts with digit
    if (DEGREE_KEYWORDS.test(t)) return false; // B.Tech, Master's …
    if (ROLE_TITLE_GUARD_RE.test(t)) return false; // Senior QA Engineer …
    if (/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\b/i.test(t)) return false;
    // All words title-case → treat as project name
    if (words.every(w => /^[A-Z]/.test(w) || w.length <= 3)) return true;
  }

  return false;
}

const SECTION_DURATION_PART_RE  = /^\s*(?:\d+\.?\d*\s*(?:years?|months?|yrs?)|\d{4}\s*[-–—]\s*(?:\d{4}|present|current|now))\s*$/i;
const SECTION_METADATA_LABEL_RE = /^\s*(domain|client|platform|category|tech(?:nology)?(?:\s+stack)?|type)\s*:/i;
const SECTION_APP_PREFIX_RE     = /^\b\w+\s+app\s*:\s*/i;

function extractSectionProjectName(line) {
  const parts = line.split('|').map(p => p.trim()).filter(Boolean);

  const candidates = parts.filter(p =>
    !SECTION_DURATION_PART_RE.test(p) &&
    !SECTION_METADATA_LABEL_RE.test(p) &&
    p.length > 2
  );

  const pool = candidates.length ? candidates : [parts[0] ?? ''];

  let best = pool[0];
  for (const p of pool) {
    if (/\([A-Z]{2,6}\)/.test(p)) { best = p; break; }
    if (PRODUCT_NOUN_SECTION_RE.test(p) && !PRODUCT_NOUN_SECTION_RE.test(best)) best = p;
  }

  return best
    .replace(/\([A-Z]{2,6}\)\s*/g, '')
    .replace(SECTION_APP_PREFIX_RE, '')
    .replace(/\b(project|client|module|platform)\s*:\s*/gi, '')
    .replace(/\s*[-–—]\s*$/, '')
    .trim();
}

function extractSectionMetrics(text) {
  SECTION_METRIC_RE.lastIndex = 0;
  return [...new Set((text.match(SECTION_METRIC_RE) ?? []).map(m => m.trim()))];
}

export function extractProjectEntries(text) {
  const sections     = splitIntoSections(text);
  const projectLines = sections['projects'] || [];
  const entries      = [];

  let currentProject = null;
  let lastParentIdx  = -1; // tracks the most recent parent_project index in entries

  const pushProject = () => {
    if (!currentProject?.name) return;
    // P1 FIX: merge inline (non-bullet) description with bullet responsibilities;
    // do NOT overwrite inline description with responsibilities.join(' ')
    const inlineDesc = currentProject.description.trim();
    const bulletDesc = currentProject.responsibilities.join(' ');
    currentProject.description = [inlineDesc, bulletDesc].filter(Boolean).join(' ');
    // Promote a "subsystem" to parent_project when it has substantial own content
    if (currentProject.entity_type === 'subsystem' && currentProject.responsibilities.length >= 3) {
      currentProject.entity_type = 'parent_project';
    }
    if (currentProject.entity_type === 'parent_project') lastParentIdx = entries.length;
    entries.push(currentProject);
    currentProject = null;
  };

  for (const line of projectLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isProjectSectionHeader(trimmed)) {
      pushProject();
      const name       = extractSectionProjectName(trimmed);
      const entityType = detectEntityTypeFromName(name, lastParentIdx >= 0);

      currentProject = {
        name,
        entity_type:      entityType,
        domain:           (() => { const m = trimmed.match(/domain\s*:\s*([^|]+)/i); return m ? m[1].trim() : null; })(),
        tools:            [],
        metrics:          [],
        responsibilities: [],
        description:      '',
        detection_sources: ['projects_section'],
      };
    } else if (currentProject) {
      if (isTechnologyStackLine(trimmed)) {
        // Phase 2: pipe-separated tech stack under a project → extract tools, keep in description
        currentProject.tools.push(...extractSkillsFromText(trimmed));
        currentProject.description += (currentProject.description ? ' ' : '') + trimmed;
      } else if (TOOLS_SECTION_LINE_RE.test(trimmed)) {
        // P2/P6 FIX: parse tool names from the tech stack line AND keep in description for ATS text search
        const toolText = trimmed.replace(TOOLS_SECTION_LINE_RE, '').replace(/^[\s:,]+/, '');
        currentProject.tools.push(...extractSkillsFromText(toolText));
        currentProject.description += (currentProject.description ? ' ' : '') + trimmed;
      } else if (BULLET_RE.test(trimmed)) {
        const clean = trimmed.replace(/^[\-•*◦▸]\s+/, '').replace(/^\d+\.\s+/, '');
        currentProject.metrics.push(...extractSectionMetrics(clean));
        // P3 FIX: extract tech skills from bullet text into tools[]
        currentProject.tools.push(...extractSkillsFromText(clean));
        if (clean.length > 10) currentProject.responsibilities.push(clean);
      } else {
        currentProject.description += (currentProject.description ? ' ' : '') + trimmed;
      }
    }
  }

  pushProject();
  return entries;
}

// ── Certifications ────────────────────────────────────────────────────────────

// Artifact patterns to exclude from certifications
const CERT_ARTIFACT_RE = /^[-–—]+\s*\d+\s+of\s+\d+\s*[-–—]+$|^page\s+\d+|^\d+\s*$|^[-=_\s]{3,}$/i;

export function extractCertificationEntries(text) {
  const sections  = splitIntoSections(text);
  const certLines = sections['certifications'] || [];
  // FIX D13: strip leading bullet markers before filtering/returning
  return certLines
    .map(l => l.trim().replace(/^[\-•*◦▸]\s+|^\d+\.\s+/, ''))
    .filter(l =>
      l.length > 4 &&
      l.length < 200 &&
      !CERT_ARTIFACT_RE.test(l) &&
      !/^\d{4}$/.test(l)
    );
}

// ── Experience Years ──────────────────────────────────────────────────────────

export function estimateExperienceYears(text) {
  const matches = [...text.matchAll(YEAR_RANGE)];
  if (!matches.length) return 0;

  const currentYear = new Date().getFullYear();
  let total = 0;
  for (const m of matches) {
    const from = parseInt(m[1], 10);
    const toRaw = m[2].toLowerCase();
    const to = /present|current|now/.test(toRaw) ? currentYear : parseInt(m[2], 10);
    if (to > from && to <= currentYear + 1) total += (to - from);
  }
  return Math.min(total, 40);
}

// ── Summary text ──────────────────────────────────────────────────────────────

export function extractSummary(text) {
  const sections = splitIntoSections(text);
  const lines    = sections['summary'] || [];
  return lines
    .map(l => l.trim())
    .filter(Boolean)
    .join(' ')
    .slice(0, 600);
}

// ── Phase 1: Global metrics — safety-net scan before section parsing ──────────

// Re-uses the same expanded pattern as SECTION_METRIC_RE (defined with fresh RegExp
// to avoid shared lastIndex state when both are used in the same call stack).
export function extractGlobalMetrics(text) {
  if (!text) return [];
  const GLOBAL_METRIC_RE = /(?:\d[\d,]*(?:[KMB])?\+?\s*(?:test\s*cases?|test\s*scripts?|automation\s*scripts?|scenarios?|endpoints?|api\s*(?:calls?|endpoints?|assertions?)|assertions?|bugs?|defects?|issues?|modules?|features?|screens?|flows?|users?|clients?|requests?|transactions?|records?)|(?:\d+%|\d+x|\d+\s*times?)\s*(?:reduction|improvement|increase|faster|coverage|efficiency|accuracy|savings?|decrease|optimization)|(?:reduced?|improved?|increased?|decreased?|saved?)\s+\w+(?:\s+\w+){0,3}\s+by\s+\d+%?|\$[\d,]+[KMB]?\s*(?:savings?|cost|revenue|value)?|\d+\+?\s*(?:hrs?|hours?)\s*(?:saved?|reduced?|automated?))/gi;
  return [...new Set((text.match(GLOBAL_METRIC_RE) ?? []).map(m => m.trim()))];
}

// ── Phase 3: Orphan bullet recovery ──────────────────────────────────────────

// Bullets that carry work-action verbs but landed in the wrong section
// (e.g. under Education because the candidate placed them after the edu header)
// are attached to the last experience entry.
const ORPHAN_WORK_ACTION_RE = /^[\-•*◦▸]\s*(built|developed|implemented|designed|architected|optimized|reduced|improved|automated|managed|created|led|delivered|deployed|launched|migrated|integrated|maintained|owned|drove|spearheaded|streamlined|coordinated|configured|resolved|mentored|achieved|increased|decreased)/i;
const ORPHAN_SECTIONS = ['education', 'certifications', '_misc'];

export function recoverOrphanBullets(parsedText, experienceEntries) {
  if (!experienceEntries?.length) return experienceEntries ?? [];

  const sections = splitIntoSections(parsedText);
  const orphanBullets = [];

  for (const key of ORPHAN_SECTIONS) {
    for (const line of (sections[key] ?? [])) {
      const t = line.trim();
      if (ORPHAN_WORK_ACTION_RE.test(t)) {
        const clean = t.replace(/^[\-•*◦▸]\s+/, '').replace(/^\d+\.\s+/, '');
        if (clean.length > 10) orphanBullets.push(clean);
      }
    }
  }

  if (!orphanBullets.length) return experienceEntries;

  const updated = [...experienceEntries];
  const last    = updated[updated.length - 1];
  const append  = orphanBullets.join(' ');
  updated[updated.length - 1] = {
    ...last,
    description: [last.description, append].filter(Boolean).join(' '),
  };
  return updated;
}

// ── Phase 1: Block extractor ──────────────────────────────────────────────────

/**
 * Split raw resume text into paragraphs without relying on section headers.
 * Each blank-line-separated block becomes { heading, content }.
 *
 * @param {string} text
 * @returns {{ heading: string, content: string }[]}
 */
export function extractBlocks(text) {
  if (!text) return [];
  const paragraphs = text.split(/\n\s*\n+/).map(p => p.trim()).filter(Boolean);
  return paragraphs.map(para => {
    const lines   = para.split('\n');
    const heading = (lines[0] || '').trim();
    const content = lines.slice(1).map(l => l.trim()).filter(Boolean).join('\n');
    return { heading, content };
  });
}

// ── Phase 6: Parse confidence scorer ─────────────────────────────────────────

/**
 * Score extraction quality 0–100. Measures how much structured data was
 * successfully recovered. Scores < 70 indicate an LLM fallback is advisable.
 *
 * Dimensions:
 *   experience entries   30 pts
 *   skills               20 pts
 *   projects with tools  20 pts
 *   education            10 pts
 *   metrics              10 pts
 *   contact info          5 pts
 *   summary               5 pts
 *
 * @param {object} parsed
 * @returns {number} 0–100
 */
export function computeParseConfidence(parsed) {
  if (!parsed) return 0;
  let score = 0;

  // Experience (30 pts)
  const expCount = (parsed.experienceEntries || []).length;
  if (expCount >= 2)     score += 30;
  else if (expCount >= 1) score += 15;

  // Skills (20 pts)
  const skillCount = (parsed.extractedSkills || []).length;
  if (skillCount >= 10)    score += 20;
  else if (skillCount >= 5) score += 10;

  // Projects (20 pts): project exists = 10, at least one has tools = +10
  const projects = parsed.projectEntries || [];
  if (projects.length >= 1) score += 10;
  if (projects.some(p => (p.tools || []).length > 0)) score += 10;

  // Education (10 pts)
  if ((parsed.educationEntries || []).length >= 1) score += 10;

  // Metrics (10 pts): globalMetrics OR any project with metrics
  const hasMetrics =
    (parsed.globalMetrics || []).length > 0 ||
    (parsed.projectEntries || []).some(p => (p.metrics || []).length > 0);
  if (hasMetrics) score += 10;

  // Contact info (5 pts)
  if (parsed.contactInfo?.email && parsed.contactInfo?.phone) score += 5;

  // Summary (5 pts)
  if ((parsed.summaryText || '').length > 20) score += 5;

  return Math.min(100, score);
}
