/**
 * parser.service.js — orchestrates text extraction + section parsing.
 *
 * AI-ready: this layer is the adapter boundary. To swap in an LLM extractor,
 * replace the heuristic extractors while keeping the output shape identical.
 */

import { extractTextFromResumeUrl } from '../../utils/resume/extractText.js';
import { extractSkillsFromText }    from '../../utils/resume/normalizeSkills.js';
import {
  extractContactInfo,
  extractExperienceEntries,
  extractEducationEntries,
  extractProjectEntries,
  extractCertificationEntries,
  estimateExperienceYears,
  extractSummary,
} from '../../utils/resume/resumeSections.js';

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

function buildParsedResult(parsedText, resumeUrl) {
  const wordCount             = parsedText.split(/\s+/).filter(Boolean).length;
  const contactInfo           = extractContactInfo(parsedText);
  const extractedSkills       = extractSkillsFromText(parsedText);
  const experienceEntries     = extractExperienceEntries(parsedText);
  const educationEntries      = extractEducationEntries(parsedText);
  const projectEntries        = extractProjectEntries(parsedText);
  const certificationEntries  = extractCertificationEntries(parsedText);
  const experienceYears       = estimateExperienceYears(parsedText);
  const summaryText           = extractSummary(parsedText);

  return {
    parsedText,
    resumeUrl,
    wordCount,
    contactInfo,
    extractedSkills,
    experienceEntries,
    educationEntries,
    projectEntries,
    certificationEntries,
    experienceYears,
    summaryText,
  };
}
