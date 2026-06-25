/**
 * parser.service.js — orchestrates text extraction + section parsing.
 *
 * AI-ready: this layer is the adapter boundary. To swap in an LLM extractor,
 * replace the heuristic extractors while keeping the output shape identical.
 */

import { extractTextFromResumeUrl }              from '../../utils/resume/extractText.js';
import { extractSkillsFromText, extractSkillsWithConfidence } from '../../utils/resume/normalizeSkills.js';
import {
  extractContactInfo,
  extractExperienceEntries,
  extractEducationEntries,
  extractProjectEntries,
  extractCertificationEntries,
  extractAchievementEntries,
  estimateExperienceYears,
  extractSummary,
  extractGlobalMetrics,
  recoverOrphanBullets,
  computeParseConfidence,
} from '../../utils/resume/resumeSections.js';
import { normalizeResumeEntities }  from '../../utils/resume/semanticNormalizer.js';

/**
 * Parse a resume from a URL and return structured data.
 *
 * @param {string} resumeUrl - Cloudinary or direct PDF/DOCX URL
 * @returns {Promise<ParsedResume>}
 */
export async function parseResumeFromUrl(resumeUrl) {
  const parsedText = await extractTextFromResumeUrl(resumeUrl);
  return buildParsedResult(parsedText, resumeUrl);
}

/**
 * Re-parse from already-extracted text (avoids re-downloading).
 */
export function parseResumeFromText(parsedText) {
  return buildParsedResult(parsedText, null);
}

/**
 * Compact structured snapshot for profile auto-fill, skill cards, and job matching.
 * Cheaper than a full parse — skips semantic enrichment and confidence scoring.
 *
 * @param {string} parsedText
 * @returns {object|null}
 */
export function extractStructuredData(parsedText) {
  if (!parsedText) return null;

  const contactInfo                        = extractContactInfo(parsedText);
  const { extractedSkills, skillMetadata } = extractSkillsWithConfidence(parsedText);
  const experienceEntries                  = extractExperienceEntries(parsedText);
  const educationEntries                   = extractEducationEntries(parsedText);
  const certificationEntries               = extractCertificationEntries(parsedText);
  const achievementEntries                 = extractAchievementEntries(parsedText);
  const experienceYears                    = estimateExperienceYears(parsedText);
  const summaryText                        = extractSummary(parsedText);

  return {
    name:               contactInfo.name,
    email:              contactInfo.email,
    phone:              contactInfo.phone,
    location:           contactInfo.location ?? null,
    linkedin:           contactInfo.linkedin,
    github:             contactInfo.github,
    skills:             extractedSkills,
    skillMetadata,
    experienceYears,
    summaryText,
    currentTitle:       experienceEntries[0]?.title   ?? null,
    currentCompany:     experienceEntries[0]?.company ?? null,
    experienceCount:    experienceEntries.length,
    educationCount:     educationEntries.length,
    certificationCount: certificationEntries.length,
    achievements:       achievementEntries,
  };
}

function buildParsedResult(parsedText, resumeUrl) {
  const wordCount                            = parsedText.split(/\s+/).filter(Boolean).length;
  const contactInfo                          = extractContactInfo(parsedText);
  const { extractedSkills, skillMetadata }   = extractSkillsWithConfidence(parsedText);
  const achievementEntries                   = extractAchievementEntries(parsedText);
  const globalMetrics        = extractGlobalMetrics(parsedText);                         // Phase 1
  const rawExperienceEntries = extractExperienceEntries(parsedText);
  const experienceEntries    = recoverOrphanBullets(parsedText, rawExperienceEntries);   // Phase 3
  const educationEntries     = extractEducationEntries(parsedText);
  const projectEntries       = extractProjectEntries(parsedText);
  const certificationEntries = extractCertificationEntries(parsedText);
  const experienceYears      = estimateExperienceYears(parsedText);
  const summaryText          = extractSummary(parsedText);

  // ── Semantic enrichment ──────────────────────────────────────────────────────
  // Merges section projects + projects embedded in experience, anchors skills to
  // evidence, and builds nested experience hierarchy. Purely additive.
  const normalized = normalizeResumeEntities({
    parsedText,
    extractedSkills,
    experienceEntries,
    projectEntries,
  });

  const resolvedProjects = normalized.semanticProjects.length > 0
    ? normalized.semanticProjects
    : projectEntries;

  const parse_quality = wordCount < 50 ? 'failed' : wordCount < 150 ? 'poor' : wordCount < 300 ? 'fair' : wordCount < 500 ? 'good' : 'excellent';
  const parse_warning = wordCount < 150 ? 'Very little text was extracted from your resume. Some skills may not have been detected.' : null;

  const parse_confidence  = computeParseConfidence({
    experienceEntries,
    extractedSkills,
    projectEntries:   resolvedProjects,
    educationEntries,
    globalMetrics,
    contactInfo,
    summaryText,
  });
  const needs_llm_recovery = parse_confidence < 70;

  return {
    parsedText,
    resumeUrl,
    wordCount,
    contactInfo,
    extractedSkills,
    skillMetadata,
    achievementEntries,
    globalMetrics,
    experienceEntries,
    educationEntries,
    certificationEntries,
    experienceYears,
    summaryText,
    projectEntries:   resolvedProjects,
    // Enrichment fields (consumed by intelligence engines, not stored in DB directly)
    semanticProjects:  normalized.semanticProjects,
    skillEvidenceMap:  normalized.skillEvidenceMap,
    projectConfidence: normalized.projectConfidence,
    nestedExperience:  normalized.nestedExperience,
    projectStats:      normalized.projectStats,
    // Phase 6+7: parse quality signals
    parse_confidence,
    needs_llm_recovery,
    parse_quality,
    parse_warning,
  };
}
