/**
 * Extract structured sections from raw resume text using heuristic patterns.
 * Returns: contact_info, experience_entries, education_entries,
 *          project_entries, certification_entries, summary_text
 *
 * AI-ready: each function is a pure transform — easy to swap for LLM extraction.
 */

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

const EXPERIENCE_HEADERS = /\b(work\s*experience|professional\s*experience|employment|career\s*history|experience)\b/i;
const EDUCATION_HEADERS  = /\b(education|academic|qualification|degree|studies)\b/i;
const PROJECT_HEADERS    = /\b(projects?|side\s*projects?|personal\s*projects?|portfolio)\b/i;
const CERT_HEADERS       = /\b(certifications?|certificates?|licen[sc]es?|credentials?)\b/i;
const SKILLS_HEADERS     = /^\s*(technical\s+)?skills?\s*:?\s*$/i;
const SUMMARY_SECTION_RE = /^\s*(professional\s+)?summary\s*:?\s*$|^\s*profile\s*:?\s*$|^\s*(career\s+)?objective\s*:?\s*$/i;

const SKILLS_SECTION_HEADERS = /^\s*(technical\s+)?skills?\s*:?\s*$|^\s*core\s+competenc(y|ies)\s*:?\s*$|^\s*technologies?\s*:?\s*$/i;
const LANGUAGES_HEADERS      = /^\s*(programming\s+)?languages?\s*:?\s*$|^\s*hobbies\s*:?\s*$|^\s*interests?\s*:?\s*$|^\s*references?\s*:?\s*$/i;

function splitIntoSections(text) {
  const lines  = text.split('\n');
  const result = {};
  let current  = '_preamble';
  result[current] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const wordCount = trimmed.split(/\s+/).length;
    if (EXPERIENCE_HEADERS.test(trimmed) && wordCount < 6) {
      current = 'experience'; result[current] = [];
    } else if (EDUCATION_HEADERS.test(trimmed) && wordCount < 6) {
      current = 'education'; result[current] = [];
    } else if (PROJECT_HEADERS.test(trimmed) && wordCount < 6) {
      current = 'projects'; result[current] = [];
    } else if (CERT_HEADERS.test(trimmed) && wordCount < 6) {
      current = 'certifications'; result[current] = [];
    } else if (SKILLS_SECTION_HEADERS.test(trimmed) || LANGUAGES_HEADERS.test(trimmed) || SUMMARY_SECTION_RE.test(trimmed)) {
      // Skills / Languages / Summary are section boundaries but we don't parse them structurally
      current = '_ignored'; result[current] = [];
    } else {
      result[current].push(line);
    }
  }
  return result;
}

const YEAR_RANGE = /(\b(?:19|20)\d{2}\b)[\s\-–—to]+(\b(?:19|20)\d{2}\b|present|current|now)/gi;

// Matches "Role - Company" or "Role at Company"
const ROLE_COMPANY_RE = /^(.+?)\s*(?:\s+-\s+|\s+at\s+|\s+@\s+)\s*(.+)$/;
// Lines that are clearly bullet descriptions
const BULLET_RE = /^[\-•*◦▸]\s+|^\d+\.\s+/;

function parseTitleCompany(str) {
  const rc = str.match(ROLE_COMPANY_RE);
  if (rc) return { title: rc[1].trim(), company: rc[2].trim() };
  return { title: str, company: '' };
}

export function extractExperienceEntries(text) {
  const sections  = splitIntoSections(text);
  const expLines  = sections['experience'] || [];
  const entries   = [];

  let currentEntry = null;
  let pendingTitle = '';   // holds title lines seen before the first date range

  for (const line of expLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const yearMatch = trimmed.match(YEAR_RANGE);

    if (yearMatch) {
      // Save previous entry
      if (currentEntry && (currentEntry.title || currentEntry.company)) {
        entries.push(currentEntry);
      }

      // Inline text before the year (e.g. "Engineer - Corp  2022 - Present")
      const beforeDate = trimmed.slice(0, trimmed.search(YEAR_RANGE)).replace(/[-–—]\s*$/, '').trim();
      const titleSrc   = beforeDate || pendingTitle;

      currentEntry = {
        ...(titleSrc ? parseTitleCompany(titleSrc) : { title: '', company: '' }),
        duration:    yearMatch[0],
        description: '',
      };
      pendingTitle = '';
    } else if (!currentEntry) {
      // Lines before the first date — buffer as pending title
      if (!BULLET_RE.test(trimmed) && trimmed.length < 100) {
        pendingTitle = trimmed;  // keep the most recent non-bullet short line
      }
    } else {
      // Inside a current entry
      if (BULLET_RE.test(trimmed)) {
        currentEntry.description += (currentEntry.description ? ' ' : '') + trimmed;
      } else if (!currentEntry.title && trimmed.length < 100) {
        const parsed = parseTitleCompany(trimmed);
        currentEntry.title   = parsed.title;
        currentEntry.company = parsed.company;
      } else if (!currentEntry.company && trimmed.length < 80) {
        currentEntry.company = trimmed;
      } else if (
        currentEntry.title && currentEntry.company &&
        trimmed.length < 100 &&
        ROLE_COMPANY_RE.test(trimmed)
      ) {
        // Looks like the next job title — buffer it as pending for the next date line
        pendingTitle = trimmed;
      } else {
        currentEntry.description += (currentEntry.description ? ' ' : '') + trimmed;
      }
    }
  }
  if (currentEntry && (currentEntry.title || currentEntry.company)) entries.push(currentEntry);

  return entries;
}

// ── Education ─────────────────────────────────────────────────────────────────

const DEGREE_KEYWORDS = /\b(b\.?tech|m\.?tech|b\.?e|m\.?e|b\.?sc|m\.?sc|mba|bba|phd|ph\.d|bachelor|master|doctorate|diploma|bca|mca|b\.?com|m\.?com)\b/i;

const YEAR_ONLY_RE   = /^\s*(\d{4})\s*[-–—to]+\s*(\d{4}|present|current|now)\s*$/i;
const SECTION_HDR_RE = /^(SKILLS?|EXPERIENCE|WORK|PROJECTS?|CERTIF|AWARDS?|LANGUAGES?|HOBBIES|INTERESTS?|REFERENCES?|SUMMARY|PROFILE|OBJECTIVE)\b/i;

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
      } else if (!currentEntry.institution && trimmed.length < 120 && !BULLET_RE.test(trimmed) && !SECTION_HDR_RE.test(trimmed)) {
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

export function extractProjectEntries(text) {
  const sections     = splitIntoSections(text);
  const projectLines = sections['projects'] || [];
  const entries      = [];

  let currentProject = null;
  for (const line of projectLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Short lines that look like titles (no sentence-ending punctuation and < 60 chars)
    if (trimmed.length < 60 && !/[.!?]$/.test(trimmed)) {
      if (currentProject) entries.push(currentProject);
      currentProject = { name: trimmed, description: '' };
    } else if (currentProject) {
      currentProject.description += (currentProject.description ? ' ' : '') + trimmed;
    }
  }
  if (currentProject) entries.push(currentProject);
  return entries;
}

// ── Certifications ────────────────────────────────────────────────────────────

// Artifact patterns to exclude from certifications
const CERT_ARTIFACT_RE = /^[-–—]+\s*\d+\s+of\s+\d+\s*[-–—]+$|^page\s+\d+|^\d+\s*$|^[-=_\s]{3,}$/i;

export function extractCertificationEntries(text) {
  const sections  = splitIntoSections(text);
  const certLines = sections['certifications'] || [];
  return certLines
    .map(l => l.trim())
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

const SUMMARY_HEADERS = /\b(summary|profile|objective|about\s*me|career\s*objective|professional\s*summary)\b/i;

export function extractSummary(text) {
  const lines  = text.split('\n');
  let inSummary = false;
  const summaryLines = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (SUMMARY_HEADERS.test(trimmed) && trimmed.split(' ').length < 5) {
      inSummary = true;
      continue;
    }
    if (inSummary) {
      if (/^[A-Z][A-Z\s]{4,}$/.test(trimmed) && trimmed.split(' ').length < 5) break; // next section
      summaryLines.push(trimmed);
      if (summaryLines.join(' ').length > 600) break;
    }
  }
  return summaryLines.filter(Boolean).join(' ');
}
