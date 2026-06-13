/**
 * matching.service.js — domain-aware job-to-resume match scoring.
 *
 * Upgrade: detects resume and job domains so QA resumes matching QA jobs
 * don't get polluted by React/Node gaps, and skill weights reflect what
 * actually matters for the role.
 *
 * AI-ready: add semantic/vector matching here when embeddings are available.
 */

import { normalizeSkill, computeMissingSkills } from '../../utils/resume/normalizeSkills.js';
import { detectSkillDomain }                    from '../../utils/resume/domainDetection.js';
import { getSkillWeight, filterRelevantGaps }   from '../../utils/resume/skillWeights.js';

const IS_DEV = process.env.NODE_ENV !== 'production';

/**
 * Score how well a candidate's resume matches a specific job.
 *
 * @param {object} resumeInsight  - Stored resume_insights row
 * @param {object} job            - Job row with skills[], description, title
 * @returns {JobMatchResult}
 */
export function computeJobMatch(resumeInsight, job) {
  const resumeSkills   = (resumeInsight.extracted_skills  || []).map(normalizeSkill);
  const jobSkills      = (job.skills                      || []).map(normalizeSkill);
  const jobTitle       = (job.title                       || '').toLowerCase();
  const resumeText     = (resumeInsight.parsed_text        || '').toLowerCase();

  // ── Domain detection ────────────────────────────────────────────────────
  const resumeDomain   = detectSkillDomain(resumeSkills);
  const jobDomain      = detectSkillDomain(jobSkills);
  const domainMatch    = resumeDomain.domain === jobDomain.domain;

  if (IS_DEV) {
    console.log(`[MATCH] Resume domain: ${resumeDomain.domain} | Job domain: ${jobDomain.domain} | Match: ${domainMatch}`);
  }

  // ── Weighted skill overlap ───────────────────────────────────────────────
  // Use the JOB's domain as the weighting context (we're scoring against the job)
  const matchedSkills = jobSkills.filter(s => resumeSkills.includes(s));
  const rawMissing    = computeMissingSkills(resumeSkills, jobSkills);

  // Filter out irrelevant-domain gaps (e.g. don't show React as gap for QA job)
  const missingSkills = filterRelevantGaps(rawMissing, jobDomain.domain);

  // Weighted skill score: high-weight matches count more
  const totalWeight    = jobSkills.reduce((sum, s) => sum + getSkillWeight(s, jobDomain.domain), 0) || 1;
  const matchedWeight  = matchedSkills.reduce((sum, s) => sum + getSkillWeight(s, jobDomain.domain), 0);
  const skillScore     = jobSkills.length
    ? Math.round((matchedWeight / totalWeight) * 100)
    : 50;

  // ── Title keyword match ──────────────────────────────────────────────────
  const titleWords = jobTitle.split(/\s+/).filter(w => w.length > 3);
  const titleHits  = titleWords.filter(w => resumeText.includes(w)).length;
  const titleScore = titleWords.length ? Math.round((titleHits / titleWords.length) * 100) : 50;

  // ── Experience fit ───────────────────────────────────────────────────────
  const expRequired  = job.experience_min ?? 0;
  const candidateExp = resumeInsight.experience_years ?? 0;
  const expScore     = expRequired === 0 ? 80 : Math.min(100, Math.round((candidateExp / expRequired) * 80));

  // ── Domain alignment bonus ───────────────────────────────────────────────
  // Same-domain matches get a boost; cross-domain is penalised slightly
  const domainBonus = domainMatch ? 5 : -5;

  // ── Overall (weighted composite) ─────────────────────────────────────────
  const raw     = Math.round(skillScore * 0.50 + titleScore * 0.20 + expScore * 0.30);
  const overall = Math.min(100, Math.max(0, raw + domainBonus));

  if (IS_DEV) {
    console.log(`[MATCH] skillScore=${skillScore} titleScore=${titleScore} expScore=${expScore} domainBonus=${domainBonus} → overall=${overall}`);
  }

  // ── QA-specific fit analysis ─────────────────────────────────────────────────
  const qaFit = (domainMatch && jobDomain.domain === 'qa_testing' && resumeInsight.qa_score_breakdown)
    ? computeQaFit(resumeInsight, jobSkills, jobTitle, missingSkills, overall)
    : { fit_reasons: [], matching_strengths: matchedSkills.slice(0, 5), missing_requirements: missingSkills.slice(0, 5) };

  return {
    overall_score:        overall,
    skill_score:          skillScore,
    title_score:          titleScore,
    experience_score:     expScore,
    matched_skills:       matchedSkills,
    missing_skills:       missingSkills,
    total_job_skills:     jobSkills.length,
    resume_domain:        resumeDomain.domain,
    job_domain:           jobDomain.domain,
    domain_match:         domainMatch,
    recommendation:       getMatchRecommendation(overall, missingSkills, domainMatch, jobDomain.domain),
    // QA-specific fit intelligence
    fit_score:            overall,
    fit_reasons:          qaFit.fit_reasons,
    matching_strengths:   qaFit.matching_strengths,
    missing_requirements: qaFit.missing_requirements,
  };
}

function computeQaFit(resumeInsight, jobSkills, jobTitle, missingSkills, overallScore) {
  const bd         = resumeInsight.qa_score_breakdown || {};
  const seniority  = resumeInsight.qa_seniority;
  const specialization = resumeInsight.qa_specialization;

  const fit_reasons = [];

  // Automation strength
  const autoRatio = bd.automation_testing ? bd.automation_testing.score / bd.automation_testing.max : 0;
  if (autoRatio >= 0.8) fit_reasons.push('Strong automation framework coverage — high fit for this role');
  else if (autoRatio >= 0.5) fit_reasons.push('Moderate automation coverage — meets basic requirements');

  // API testing strength
  const apiRatio = bd.api_testing ? bd.api_testing.score / bd.api_testing.max : 0;
  if (apiRatio >= 0.75) fit_reasons.push('Solid REST/API testing expertise matching job requirements');

  // Framework maturity
  const fwRatio = bd.framework_expertise ? bd.framework_expertise.score / bd.framework_expertise.max : 0;
  if (fwRatio >= 0.75) fit_reasons.push('Mature QA toolchain — broad framework coverage');

  // CI/CD for automation-heavy roles
  const cicdRatio = bd.ci_cd_readiness ? bd.ci_cd_readiness.score / bd.ci_cd_readiness.max : 0;
  if (cicdRatio >= 0.7 && /automation|sdet|devops/i.test(jobTitle)) {
    fit_reasons.push('CI/CD integration experience — strong fit for pipeline-driven QA role');
  }

  // Seniority match with job title
  if (seniority === 'senior' && /senior|lead|sr\.?/i.test(jobTitle)) {
    fit_reasons.push('Seniority level aligns with role expectations');
  }

  // Specialization match
  if (specialization === 'sdet' && /sdet|automation|engineer in test/i.test(jobTitle)) {
    fit_reasons.push('SDET profile — ideal specialization for this engineering-focused QA role');
  }

  // Matching strengths = top 5 matched skills (capitalised)
  const matching_strengths = (resumeInsight.extracted_skills || [])
    .filter(s => jobSkills.includes(normalizeSkill(s)))
    .slice(0, 5);

  // Missing requirements = top gaps
  const missing_requirements = missingSkills.slice(0, 5);

  if (fit_reasons.length === 0) {
    if (overallScore >= 60) fit_reasons.push('Good overall skill alignment with the job requirements');
    else fit_reasons.push('Some QA skills match — consider upskilling in the listed gaps');
  }

  return { fit_reasons, matching_strengths, missing_requirements };
}

function getMatchRecommendation(score, missing, domainMatch, jobDomain) {
  const topGaps = missing.slice(0, 3).join(', ');

  if (!domainMatch && score < 60) {
    return 'This role targets a different skill domain. Focus on domain-aligned jobs for best results.';
  }
  if (score >= 80) return 'Strong match — apply with confidence!';
  if (score >= 60) return topGaps
    ? `Good match. Consider adding: ${topGaps}.`
    : 'Good match for this role.';
  if (score >= 40) return topGaps
    ? `Partial match. Upskill in: ${topGaps}.`
    : 'Partial match — review the job requirements.';
  return 'Low match — focus on skill gaps before applying.';
}
