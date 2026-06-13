/**
 * skillEvidenceExtractor.js
 * Extracts per-skill evidence from parsed resume text + structured sections.
 * Determines WHERE each skill was mentioned and HOW it was used.
 */

import {
  IMPL_VERBS, ARCH_PATTERNS, QUANT_PATTERNS, CICD_PATTERNS,
  SKILLS_SECTION_HEADERS, EXPERIENCE_SECTION_HEADERS, PROJECT_SECTION_HEADERS,
  TRACKED_QA_SKILLS, LISTLIKE_SIGNALS, EVIDENCE_THRESHOLDS, EVIDENCE_MAP,
  EVIDENCE_FAMILIES, getEvidencePhrases,
} from './evidenceSignals.js';
import { skillMatches } from '../../utils/resume/skillMatcher.js';

const WINDOW = 280; // chars around skill mention to analyze

// ── Section boundary detection ────────────────────────────────────────────────

function detectSectionBoundaries(text) {
  const sections = [];

  const allHeaders = [
    ...SKILLS_SECTION_HEADERS.map(h => ({ name: 'skills', pattern: h })),
    ...EXPERIENCE_SECTION_HEADERS.map(h => ({ name: 'experience', pattern: h })),
    ...PROJECT_SECTION_HEADERS.map(h => ({ name: 'projects', pattern: h })),
  ];

  // Build a fast O(1) lookup: lowercase-pattern → section name.
  const patternMap = new Map(allHeaders.map(({ pattern, name }) => [pattern, name]));

  // Walk line-by-line.  A header is recognised only when the *entire trimmed line*
  // matches a known pattern (with an optional trailing colon stripped).
  //
  //   "   WORK EXPERIENCE"   → trim → "work experience"  → match  ✓
  //   "Experience:"          → bare → "experience"        → match  ✓
  //   "3 years of experience in QA" → bare → same (no match)  ✓
  //   "\texperience with Selenium"  → bare → same (no match)  ✓
  let pos = 0;
  for (const line of text.split('\n')) {
    const trimmed = line.trim().toLowerCase();
    const bare    = trimmed.endsWith(':') ? trimmed.slice(0, -1).trimEnd() : trimmed;
    if (bare) {
      const sectionName = patternMap.get(bare);
      if (sectionName !== undefined) {
        sections.push({ name: sectionName, start: pos });
      }
    }
    pos += line.length + 1; // +1 for the \n consumed by split()
  }

  return sections.sort((a, b) => a.start - b.start);
}

function getSectionAt(index, sections) {
  let current = 'unknown';
  for (const s of sections) {
    if (s.start <= index) current = s.name;
    else break;
  }
  return current;
}

// ── Context window helpers ────────────────────────────────────────────────────

function extractContext(text, start, skillLen) {
  const from = Math.max(0, start - WINDOW);
  const to   = Math.min(text.length, start + skillLen + WINDOW);
  return text.slice(from, to).toLowerCase();
}

function hasImplVerb(context) {
  return [...IMPL_VERBS].some(v => context.includes(v));
}

function hasArchitecture(context) {
  return ARCH_PATTERNS.some(p => context.includes(p));
}

function hasQuantification(context) {
  return QUANT_PATTERNS.some(p => p.test ? p.test(context) : context.includes(p));
}

function hasCICD(context) {
  return CICD_PATTERNS.some(p => context.includes(p));
}

function isListLikeContext(context) {
  const words  = context.split(/\s+/).length;
  const commas = (context.match(/,/g) || []).length;
  const verbs  = [...IMPL_VERBS].filter(v => context.includes(v)).length;
  if (words === 0) return true;
  return (commas / words > LISTLIKE_SIGNALS.highCommaDensity) &&
         (verbs  / words < LISTLIKE_SIGNALS.lowVerbDensity);
}

// ── Mapped evidence helpers ───────────────────────────────────────────────────

// getEvidencePhrases is imported from evidenceSignals.js (single source of truth).

function getAchievementPhrases(skill) {
  return EVIDENCE_MAP[skill]?.achievement_phrases ?? [];
}

/**
 * Search structured resume entries for evidence of a skill via related phrases.
 * Returns signals that can be merged into the main evidence signal set.
 */
function searchEntriesForPhrases(entries, evidencePhrases, achievementPhrases) {
  const result = {
    found:                 false,
    impl_verb:             false,
    quantified_impact:     false,
    delivery_evidence:     false,
    architecture_mentions: false,
    ci_cd_usage:           false,
  };
  for (const entry of (entries || [])) {
    const text = [entry.description, entry.title, entry.name]
      .filter(Boolean).join(' ').toLowerCase();
    const hasEvidence    = evidencePhrases.some(p => text.includes(p));
    const hasAchievement = achievementPhrases.some(p => text.includes(p));
    // Either a regular evidence phrase OR a delivery phrase confirms the skill was practised
    if (!hasEvidence && !hasAchievement) continue;
    result.found = true;
    if ([...IMPL_VERBS].some(v => text.includes(v)))                         result.impl_verb             = true;
    if (ARCH_PATTERNS.some(p => text.includes(p)))                           result.architecture_mentions = true;
    if (CICD_PATTERNS.some(p => text.includes(p)))                           result.ci_cd_usage           = true;
    // Quantified impact = measurable numeric outcomes only (%, counts, deltas)
    if (QUANT_PATTERNS.some(p => p.test ? p.test(text) : text.includes(p))) result.quantified_impact     = true;
    // Delivery evidence = tool/process usage proving real QA work (not a metric)
    if (hasAchievement)                                                       result.delivery_evidence     = true;
  }
  return result;
}

// ── Per-skill evidence extraction ─────────────────────────────────────────────

function extractEvidenceForSkill(skill, parsedText, sections, certificationEntries, experienceEntries, projectEntries) {
  const lower    = parsedText.toLowerCase();
  const skillLow = skill.toLowerCase();
  const signals  = {
    skills_section:       false,
    experience_section:   false,
    project_section:      false,
    impl_verb:            false,
    quantified_impact:    false,
    delivery_evidence:    false,  // tool/process usage: JIRA, UAT, defect tracking
    architecture_mentions:false,
    ci_cd_usage:          false,
    certification:        false,
    list_only:            true,   // assume list-only until proven otherwise
  };

  let idx = lower.indexOf(skillLow);
  while (idx !== -1) {
    const section = getSectionAt(idx, sections);
    const context = extractContext(lower, idx, skillLow.length);

    if (section === 'skills') signals.skills_section = true;
    if (section === 'experience') {
      signals.experience_section = true;
      signals.list_only = false;
    }
    if (section === 'projects') {
      signals.project_section = true;
      signals.list_only = false;
    }

    if (!isListLikeContext(context)) {
      signals.list_only = false;
      if (hasImplVerb(context))     signals.impl_verb             = true;
      if (hasArchitecture(context)) signals.architecture_mentions  = true;
      if (hasQuantification(context)) signals.quantified_impact    = true;
      if (hasCICD(context))         signals.ci_cd_usage            = true;
    } else if (section === 'experience' || section === 'projects') {
      // Even in experience, structured list bullets still count
      signals.list_only = false;
    }

    idx = lower.indexOf(skillLow, idx + 1);
  }

  // Certification check
  const certLower = (certificationEntries || []).map(c => c.toLowerCase());
  if (certLower.some(c => c.includes(skillLow) || skillLow.includes('istqb') && c.includes('istqb'))) {
    signals.certification = true;
  }

  // Mapped phrase search — finds evidence via related phrases in structured entries.
  // This catches skills like "manual testing" that are often described in experience
  // using synonyms ("test cases", "UAT", "defect tracking") rather than the exact skill name.
  const evidencePhrases    = getEvidencePhrases(skillLow);
  const achievementPhrases = getAchievementPhrases(skillLow);

  const expMapped  = searchEntriesForPhrases(experienceEntries, evidencePhrases, achievementPhrases);
  const projMapped = searchEntriesForPhrases(projectEntries,    evidencePhrases, achievementPhrases);

  if (expMapped.found) {
    signals.experience_section = true;
    signals.list_only          = false;
    if (expMapped.impl_verb)             signals.impl_verb             = true;
    if (expMapped.quantified_impact)     signals.quantified_impact     = true;
    if (expMapped.delivery_evidence)     signals.delivery_evidence     = true;
    if (expMapped.architecture_mentions) signals.architecture_mentions = true;
    if (expMapped.ci_cd_usage)           signals.ci_cd_usage           = true;
  }
  if (projMapped.found) {
    signals.project_section = true;
    signals.list_only       = false;
    if (projMapped.impl_verb)             signals.impl_verb             = true;
    if (projMapped.quantified_impact)     signals.quantified_impact     = true;
    if (projMapped.delivery_evidence)     signals.delivery_evidence     = true;
    if (projMapped.architecture_mentions) signals.architecture_mentions = true;
    if (projMapped.ci_cd_usage)           signals.ci_cd_usage           = true;
  }

  // Build proof sources
  const proof_sources = [];
  if (signals.experience_section)    proof_sources.push('experience');
  if (signals.project_section)       proof_sources.push('project');
  if (signals.delivery_evidence)     proof_sources.push('delivery');
  if (signals.quantified_impact)     proof_sources.push('achievement');
  if (signals.certification)         proof_sources.push('certification');
  if (signals.architecture_mentions) proof_sources.push('architecture');
  if (signals.skills_section && proof_sources.length === 0) proof_sources.push('skills_section_only');

  // Score
  let score = 0;
  if (signals.experience_section)    score += 35;
  if (signals.project_section)       score += 20;
  if (signals.impl_verb)             score += 15;
  if (signals.delivery_evidence)     score +=  2;  // credibility, not metric
  if (signals.quantified_impact)     score += 15;
  if (signals.architecture_mentions) score += 10;
  if (signals.ci_cd_usage)           score += 10;
  if (signals.certification)         score +=  8;
  if (signals.list_only)             score -= 10;
  // Combination bonus: experience with a measurable outcome → proven, measured usage
  if (signals.experience_section && signals.quantified_impact) score += 5;

  score = Math.max(0, Math.min(100, score));

  let evidence_level =
    score >= EVIDENCE_THRESHOLDS.strong   ? 'strong'   :
    score >= EVIDENCE_THRESHOLDS.moderate ? 'moderate' :
    score >= EVIDENCE_THRESHOLDS.basic    ? 'basic'    : 'weak';

  // Safety guard: any skill found in an experience or project section can never
  // be rated weak, even if section-boundary detection was imprecise.
  // (Mathematically redundant given experience_section adds +35 ≥ basic threshold,
  // but kept as an explicit contract for future scoring changes.)
  if ((signals.experience_section || signals.project_section) && evidence_level === 'weak') {
    evidence_level = 'basic';
    score = Math.max(score, EVIDENCE_THRESHOLDS.basic);
  }

  const depth_level =
    score >= 72 ? 'architected'  :
    score >= 50 ? 'production'   :
    score >= 28 ? 'applied'      :
    score >=  8 ? 'exposed'      : 'mentioned';

  return {
    skill,
    evidence_score: score,
    evidence_level,
    depth_level,
    proof_sources,
    signals: {
      project_usage:         signals.project_section,
      quantified_impact:     signals.quantified_impact,
      delivery_evidence:     signals.delivery_evidence,
      framework_depth:       signals.architecture_mentions,
      ci_cd_usage:           signals.ci_cd_usage,
      architecture_mentions: signals.architecture_mentions,
    },
  };
}

// ── Build skill-to-experience mapping for SkillProofTimeline ─────────────────

function buildSkillTimelineMap(extractedSkills, experienceEntries, parsedText) {
  const lower = parsedText.toLowerCase();
  const timeline = {};

  for (const entry of (experienceEntries || [])) {
    const label = [entry.title, entry.company, entry.duration]
      .filter(Boolean).join(' — ');
    const entryText = (entry.description || entry.title || '').toLowerCase();

    const matchedSkills = extractedSkills.filter(skill => {
      const s = skill.toLowerCase();
      return entryText.includes(s) ||
        (lower.indexOf(s) !== -1 &&
          Math.abs(lower.indexOf(s) - lower.indexOf((entry.company || entry.title || '').toLowerCase())) < 600);
    });

    if (matchedSkills.length > 0) {
      timeline[label] = matchedSkills;
    }
  }

  return timeline;
}

// ── Evidence inheritance ──────────────────────────────────────────────────────

const LEVEL_RANK  = { weak: 0, basic: 1, moderate: 2, strong: 3 };
const LEVEL_SCORE = { weak: 0, basic: EVIDENCE_THRESHOLDS.basic,
                      moderate: EVIDENCE_THRESHOLDS.moderate,
                      strong:   EVIDENCE_THRESHOLDS.strong };

function scoreToDepthLevel(s) {
  if (s >= 72) return 'architected';
  if (s >= 50) return 'production';
  if (s >= 28) return 'applied';
  if (s >=  8) return 'exposed';
  return 'mentioned';
}

/**
 * Promote category skill evidence based on proven child skill evidence.
 *
 * A parent skill that was only mentioned in the skills section (weak) can be
 * promoted when multiple child skills in the same family have strong evidence,
 * because the child evidence proves the parent capability was genuinely used.
 *
 * Rules:
 *   ≥2 strong children  → parent → strong
 *   1  strong child      → parent → moderate (at most)
 *   ≥1 moderate/basic    → parent → basic (at most)
 *   no evidence children → parent unchanged
 *
 * Inheritance only promotes, never demotes.
 */
function applyEvidenceInheritance(skill_evidence) {
  const bySkill = new Map(skill_evidence.map(e => [e.skill, e]));

  for (const [parent, children] of Object.entries(EVIDENCE_FAMILIES)) {
    const parentEntry = bySkill.get(parent);
    if (!parentEntry) continue;

    const childEntries = children.map(c => bySkill.get(c)).filter(Boolean);
    if (childEntries.length === 0) continue;

    const strongCount = childEntries.filter(c => c.evidence_level === 'strong').length;
    const modCount    = childEntries.filter(c => c.evidence_level === 'moderate').length;
    const basicCount  = childEntries.filter(c => c.evidence_level === 'basic').length;

    let promoted;
    if      (strongCount >= 2)                  promoted = 'strong';
    else if (strongCount === 1)                  promoted = 'moderate';
    else if (modCount >= 1 || basicCount >= 1)   promoted = 'basic';
    else continue;

    // Only ever promote — never demote a parent with stronger direct evidence
    if ((LEVEL_RANK[promoted] ?? 0) <= (LEVEL_RANK[parentEntry.evidence_level] ?? 0)) continue;

    parentEntry.evidence_level = promoted;
    parentEntry.evidence_score = Math.max(parentEntry.evidence_score, LEVEL_SCORE[promoted]);
    parentEntry.depth_level    = scoreToDepthLevel(parentEntry.evidence_score);
    if (!parentEntry.proof_sources.includes('inherited')) {
      parentEntry.proof_sources = [...parentEntry.proof_sources, 'inherited'];
    }
  }

  return skill_evidence;
}

// ── Main export ───────────────────────────────────────────────────────────────

export function extractSkillEvidence(parsed) {
  const {
    parsedText           = '',
    extractedSkills      = [],
    experienceEntries    = [],
    projectEntries       = [],
    certificationEntries = [],
  } = parsed;

  const sections = detectSectionBoundaries(parsedText);

  // Only track QA-relevant skills that are actually in the resume
  const qaSkillsInResume = extractedSkills
    .map(s => s.toLowerCase())
    .filter(s => TRACKED_QA_SKILLS.some(t => skillMatches(s, t)));

  // Deduplicate
  const tracked = [...new Set(qaSkillsInResume)];

  const skill_evidence = tracked.map(skill =>
    extractEvidenceForSkill(skill, parsedText, sections, certificationEntries, experienceEntries, projectEntries)
  );

  // Promote category skills (e.g. 'automation testing') whose evidence is weak
  // but whose child skills (selenium, playwright, …) have strong direct evidence.
  applyEvidenceInheritance(skill_evidence);

  const skill_timeline = buildSkillTimelineMap(
    extractedSkills,
    experienceEntries,
    parsedText,
  );

  return { skill_evidence, skill_timeline };
}
