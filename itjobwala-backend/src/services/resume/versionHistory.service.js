/**
 * versionHistory.service.js
 * Phase 4: Save lightweight snapshots + compute progress metrics.
 */

import ResumeVersionHistory from '../../models/candidate/ResumeVersionHistory.js';

// Version 2: capability-only ATS, section-only attenuation, very_low confidence tier.
// Snapshots below this threshold may show apparent improvements caused by architecture change, not resume improvement.
const SCORE_MODEL_VERSION = 2;

/**
 * Called after every successful parse — stores a metric snapshot.
 * Fire-and-forget safe: errors are caught and logged, not thrown.
 */
export async function saveVersionSnapshot(candidateId, insight, log) {
  try {
    // Compute next version number
    const last = await ResumeVersionHistory.query()
      .where({ candidate_id: candidateId })
      .max('version_number as max')
      .first();

    const version_number = ((last?.max) ?? 0) + 1;

    await ResumeVersionHistory.query().insert({
      candidate_id:             candidateId,
      version_number,
      qa_match_score:           insight.qa_match_score ?? null,
      profile_completion_score: insight.profile_completion_score ?? null,
      qa_specialization:        insight.qa_specialization ?? null,
      qa_seniority:             insight.qa_seniority ?? null,
      recruiter_confidence:     insight.recruiter_confidence ?? null,
      skills_count:             insight.total_skills_found ?? 0,
      missing_count:            (insight.missing_skills ?? []).length,
      parsed_at:                new Date().toISOString(),
    });
  } catch (err) {
    if (log) log.error({ err }, 'Failed to save version snapshot — non-fatal');
  }
}

/**
 * Returns the full version history + computed progress for a candidate.
 */
export async function getVersionHistoryWithProgress(candidateId) {
  const versions = await ResumeVersionHistory.query()
    .where({ candidate_id: candidateId })
    .orderBy('version_number', 'asc');

  if (versions.length === 0) {
    return {
      versions: [],
      progress: null,
    };
  }

  const progress = computeProgress(versions);

  return { versions, progress };
}

// ── Progress computation ──────────────────────────────────────────────────────

function computeProgress(versions) {
  const latest   = versions[versions.length - 1];
  const previous = versions.length >= 2 ? versions[versions.length - 2] : null;
  const first    = versions[0];

  const score_delta    = previous ? (latest.qa_match_score ?? 0) - (previous.qa_match_score ?? 0) : 0;
  const skills_delta   = previous ? (latest.skills_count  ?? 0) - (previous.skills_count  ?? 0) : 0;
  const best_score     = Math.max(...versions.map(v => v.qa_match_score ?? 0));
  const total_parses   = versions.length;

  const firstDate      = new Date(first.parsed_at);
  const now            = new Date();
  const days_since_first = Math.floor((now - firstDate) / (1000 * 60 * 60 * 24));

  // Trend: compare last 3 scores if available
  const recent = versions.slice(-3).map(v => v.qa_match_score ?? 0);
  let trend = 'stable';
  if (recent.length >= 2) {
    const avg_change = (recent[recent.length - 1] - recent[0]) / (recent.length - 1);
    if (avg_change > 2)  trend = 'improving';
    if (avg_change < -2) trend = 'declining';
  }

  // Specialization change
  const spec_changed = previous &&
    previous.qa_specialization &&
    latest.qa_specialization &&
    previous.qa_specialization !== latest.qa_specialization;

  const milestone = deriveMilestone(latest.qa_match_score ?? 0, score_delta, total_parses, skills_delta);

  return {
    current_score:            latest.qa_match_score ?? 0,
    previous_score:           previous?.qa_match_score ?? null,
    score_delta,
    skills_delta,
    best_score,
    total_parses,
    days_since_first,
    trend,
    spec_changed: spec_changed ?? false,
    previous_specialization:  spec_changed ? previous.qa_specialization : null,
    current_specialization:   latest.qa_specialization ?? null,
    milestone,
  };
}

function deriveMilestone(score, delta, parses, skillsDelta = 0) {
  if (score >= 90) return 'Top 10% QA profile — enterprise-ready';
  if (score >= 70 && delta > 0) return 'Strong improvement — approaching senior-level screening threshold';
  if (score >= 55) return 'Solid QA profile — passing most ATS filters';

  // Guard: large delta with no skill change = likely architecture recalibration, not real progress
  if (delta >= 8 && skillsDelta <= 1 && parses > 1) {
    return 'Scores recalibrated under the new ATS model. Comparisons with older versions may not reflect actual resume improvements.';
  }
  if (delta >= 5 && parses > 1) return `Score improved +${delta} points since last analysis`;
  if (delta > 0 && parses > 1) return `Score improved +${delta} points since last analysis`;
  if (parses === 1) return 'First analysis complete — baseline established';
  return 'Keep iterating — each update moves the needle';
}
