/**
 * qaJobFitAnalyzer.js
 * Phase 1 orchestrator: Job-Aware ATS Intelligence.
 *
 * Produces a contextual fit analysis for a specific job.
 * Completely separate from the generic qa_match_score.
 */

import { calculateJobFitScore, getFitLevel }   from './fitScoreCalculator.js';
import { analyzeFitGap }                        from './fitGapAnalyzer.js';
import { generateRecruiterFitReasoning }        from './recruiterFitReasoning.js';

/**
 * @param {object} resumeInsight - Full resume_insights DB row
 * @param {object} job           - Full job DB row
 * @returns {JobFitResult}
 */
export function analyzeJobFit(resumeInsight, job) {
  const jobSkills = (job.skills || []);

  // ── 1. Fit score + contextual signals ────────────────────────────────────
  const {
    job_fit_score,
    tool_overlap_pct,
    inferred_job_spec,
    inferred_job_seniority,
  } = calculateJobFitScore(resumeInsight, job);

  const fit_level = getFitLevel(job_fit_score);

  // ── 2. Gap analysis ───────────────────────────────────────────────────────
  const {
    matched_skills,
    missing_requirements,
    high_impact_missing_skills,
    fit_strengths,
    fit_gaps,
  } = analyzeFitGap({
    resumeInsight,
    job,
    jobSkills,
    inferred_job_spec,
    inferred_job_seniority,
  });

  // ── 3. Recruiter reasoning ────────────────────────────────────────────────
  const {
    recruiter_fit_summary,
    rejection_risks,
    shortlist_prediction,
  } = generateRecruiterFitReasoning({
    job_fit_score,
    fit_level,
    resumeInsight,
    job,
    inferred_job_spec,
    inferred_job_seniority,
    high_impact_missing_skills,
    tool_overlap_pct,
  });

  return {
    // ── Scores ──────────────────────────────────────────────────────────────
    overall_qa_quality:       resumeInsight.qa_match_score ?? 0,
    job_fit_score,
    fit_level,
    tool_overlap_pct,

    // ── Job context ──────────────────────────────────────────────────────────
    inferred_job_spec,
    inferred_job_seniority,
    job_required_skills:      jobSkills,

    // ── Fit analysis ─────────────────────────────────────────────────────────
    fit_strengths,
    fit_gaps,
    matched_skills,
    missing_requirements,
    high_impact_missing_skills,

    // ── Recruiter intelligence ────────────────────────────────────────────────
    recruiter_fit_summary,
    rejection_risks,
    shortlist_prediction,
  };
}
