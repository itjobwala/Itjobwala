/**
 * feedbackSignal.service.js
 * Phase 5: Recruiter Feedback Learning Loop.
 *
 * Captures recruiter hiring decisions as ATS feedback signals.
 * Aggregates them into candidate-facing insights (anonymized).
 */

import RecruiterFeedbackSignal from '../../models/candidate/RecruiterFeedbackSignal.js';
import ResumeInsight           from '../../models/candidate/ResumeInsight.js';

const SIGNAL_OUTCOMES = new Set(['shortlisted', 'interview', 'hired', 'rejected']);

/**
 * Auto-called on every recruiter status change — fire-and-forget safe.
 * Deduplicates: one signal per application_id per outcome.
 */
export async function saveFeedbackSignal({ candidateId, jobId, recruiterId, applicationId, outcome, log }) {
  if (!SIGNAL_OUTCOMES.has(outcome)) return; // skip non-signal statuses

  try {
    // Avoid duplicate signals for same application + outcome
    const exists = await RecruiterFeedbackSignal.query()
      .findOne({ application_id: applicationId, outcome })
      .select('id');
    if (exists) return;

    // Fetch candidate's current ATS data for enrichment
    const insight = await ResumeInsight.query()
      .findOne({ candidate_id: candidateId })
      .select('qa_match_score', 'qa_specialization', 'qa_seniority');

    await RecruiterFeedbackSignal.query().insert({
      candidate_id:     candidateId,
      job_id:           jobId,
      recruiter_id:     recruiterId,
      application_id:   applicationId,
      outcome,
      qa_score_at_time: insight?.qa_match_score   ?? null,
      qa_specialization: insight?.qa_specialization ?? null,
      qa_seniority:     insight?.qa_seniority      ?? null,
    });
  } catch (err) {
    if (log) log.error({ err }, 'saveFeedbackSignal failed — non-fatal');
  }
}

/**
 * Called by recruiter when submitting an optional feedback note.
 * Upserts the note on the most recent signal for this application.
 */
export async function saveFeedbackNote({ applicationId, recruiterId, note }) {
  await RecruiterFeedbackSignal.query()
    .where({ application_id: applicationId, recruiter_id: recruiterId })
    .orderBy('created_at', 'desc')
    .limit(1)
    .patch({ feedback_note: note.trim().slice(0, 500) });
}

/**
 * Returns all signals for a candidate + computed hiring intelligence.
 * Recruiter identity is never exposed to the candidate.
 */
export async function getCandidateHiringSignals(candidateId) {
  const signals = await RecruiterFeedbackSignal.query()
    .where({ candidate_id: candidateId })
    .orderBy('created_at', 'desc')
    .select('id', 'outcome', 'qa_score_at_time', 'qa_specialization', 'qa_seniority', 'feedback_note', 'created_at');

  if (signals.length === 0) {
    return { signals: [], summary: null };
  }

  const summary = computeSignalSummary(signals);

  // Anonymize for candidate: strip recruiter_id, job_id, application_id
  const safeSignals = signals.map(s => ({
    id:               s.id,
    outcome:          s.outcome,
    qa_score_at_time: s.qa_score_at_time,
    qa_specialization: s.qa_specialization,
    qa_seniority:     s.qa_seniority,
    feedback_note:    s.feedback_note ?? null,
    created_at:       s.created_at,
  }));

  return { signals: safeSignals, summary };
}

// ── Summary computation ───────────────────────────────────────────────────────

function computeSignalSummary(signals) {
  const counts = { shortlisted: 0, interview: 0, hired: 0, rejected: 0 };
  const scores = { positive: [], negative: [] };

  for (const s of signals) {
    counts[s.outcome] = (counts[s.outcome] ?? 0) + 1;
    if (s.qa_score_at_time != null) {
      if (s.outcome === 'rejected') {
        scores.negative.push(s.qa_score_at_time);
      } else {
        scores.positive.push(s.qa_score_at_time);
      }
    }
  }

  const total            = signals.length;
  const positive_total   = counts.shortlisted + counts.interview + counts.hired;
  const shortlist_rate   = Math.round((positive_total / total) * 100);

  const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
  const avg_positive_score = avg(scores.positive);
  const avg_rejection_score = avg(scores.negative);

  const notes = signals.filter(s => s.feedback_note).map(s => s.feedback_note);

  const insight = deriveInsight({ shortlist_rate, avg_positive_score, avg_rejection_score, positive_total, counts });

  return {
    total_signals:         total,
    shortlist_count:       counts.shortlisted,
    interview_count:       counts.interview,
    hired_count:           counts.hired,
    rejected_count:        counts.rejected,
    shortlist_rate,
    avg_positive_score,
    avg_rejection_score,
    recruiter_notes:       notes,
    has_notes:             notes.length > 0,
    insight,
  };
}

function deriveInsight({ shortlist_rate, avg_positive_score, avg_rejection_score, positive_total, counts }) {
  if (counts.hired > 0) {
    return `You've been hired through this platform — a top-tier outcome. Keep your profile current.`;
  }
  if (counts.interview > 0 && shortlist_rate >= 50) {
    return `Strong pipeline performance: ${shortlist_rate}% of recruiter decisions were positive. You're converting well.`;
  }
  if (avg_positive_score != null && avg_rejection_score != null && avg_positive_score - avg_rejection_score > 10) {
    return `Your ATS score is a strong predictor — you were shortlisted at avg ${avg_positive_score} vs rejected at avg ${avg_rejection_score}. Improving your score from ${avg_rejection_score} toward ${avg_positive_score} is your highest-leverage action.`;
  }
  if (shortlist_rate >= 40) {
    return `${shortlist_rate}% shortlist rate — you're in a solid position. A few more skill additions could push you above 50%.`;
  }
  if (shortlist_rate > 0) {
    return `You've been shortlisted ${positive_total} time${positive_total !== 1 ? 's' : ''}. Focus on the Coach tab recommendations to convert more applications.`;
  }
  return `No shortlists yet. Your Coach tab has specific actions that can increase recruiter visibility and ATS score.`;
}
