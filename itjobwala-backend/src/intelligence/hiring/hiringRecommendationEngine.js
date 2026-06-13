/**
 * hiringRecommendationEngine.js — Phase 5: Recruiter Decision Layer
 *
 * Converts candidate_readiness_score + analysis_confidence into a
 * human-readable hiring recommendation.
 *
 * Decision matrix:
 *
 * readiness ≥ 80  + confidence high    → Priority Interview
 * readiness ≥ 80  + confidence medium  → Strong Interview
 * readiness ≥ 80  + confidence low     → Interview
 * readiness 65–79 + confidence high    → Strong Interview
 * readiness 65–79 + confidence medium  → Interview
 * readiness 65–79 + confidence low     → Consider
 * readiness 50–64 + confidence high    → Interview
 * readiness 50–64 + confidence medium  → Consider
 * readiness 50–64 + confidence low     → Consider
 * readiness 35–49 + any                → Consider
 * readiness  <35  + any                → Reject
 *
 * Contradiction severity can downgrade decisions one step.
 */

const MATRIX = [
  // [minReadiness, confidence,  decision]
  [80, 'high',   'Priority Interview'],
  [80, 'medium', 'Strong Interview'  ],
  [80, 'low',    'Interview'         ],
  [65, 'high',   'Strong Interview'  ],
  [65, 'medium', 'Interview'         ],
  [65, 'low',    'Consider'          ],
  [50, 'high',   'Interview'         ],
  [50, 'medium', 'Consider'          ],
  [50, 'low',    'Consider'          ],
  [35, 'high',   'Consider'          ],
  [35, 'medium', 'Consider'          ],
  [35, 'low',    'Consider'          ],
  [0,  'high',   'Reject'            ],
  [0,  'medium', 'Reject'            ],
  [0,  'low',    'Reject'            ],
];

const DECISION_RANK = {
  'Priority Interview': 5,
  'Strong Interview':   4,
  'Interview':          3,
  'Consider':           2,
  'Reject':             1,
};

const DECISIONS_BY_RANK = Object.fromEntries(
  Object.entries(DECISION_RANK).map(([k, v]) => [v, k])
);

/**
 * Compute hiring recommendation.
 *
 * @param {object} params
 * @param {number} params.candidate_readiness_score — 0–100
 * @param {string} params.analysis_confidence       — 'low'|'medium'|'high'
 * @param {string} params.contradiction_severity    — 'none'|'low'|'medium'|'high'
 * @returns {{ hiring_recommendation, recommendation_rationale, readiness_tier }}
 */
export function computeHiringRecommendation({
  candidate_readiness_score = 0,
  analysis_confidence       = 'medium',
  contradiction_severity    = 'none',
} = {}) {
  // Find the matrix row
  let base_decision = 'Reject';
  for (const [minScore, conf, decision] of MATRIX) {
    if (candidate_readiness_score >= minScore && analysis_confidence === conf) {
      base_decision = decision;
      break;
    }
  }

  // Contradiction penalty: high severity downgrades one step; medium only affects
  // Priority Interview (high bar — contradictions matter most there).
  let final_decision = base_decision;
  const baseRank = DECISION_RANK[base_decision] ?? 1;

  if (contradiction_severity === 'high') {
    final_decision = DECISIONS_BY_RANK[Math.max(1, baseRank - 1)] ?? 'Reject';
  } else if (contradiction_severity === 'medium' && baseRank >= 5) {
    final_decision = DECISIONS_BY_RANK[baseRank - 1]; // Priority → Strong
  }

  // Readiness tier label
  const readiness_tier =
    candidate_readiness_score >= 80 ? 'Highly Ready'   :
    candidate_readiness_score >= 65 ? 'Ready'          :
    candidate_readiness_score >= 50 ? 'Developing'     :
    candidate_readiness_score >= 35 ? 'Early Stage'    :
                                      'Not Ready';

  // Human-readable rationale
  const rationale = buildRationale(final_decision, {
    candidate_readiness_score,
    analysis_confidence,
    contradiction_severity,
    downgraded: final_decision !== base_decision,
  });

  return {
    hiring_recommendation: final_decision,
    recommendation_rationale: rationale,
    readiness_tier,
  };
}

function buildRationale(decision, { candidate_readiness_score, analysis_confidence, contradiction_severity, downgraded }) {
  const parts = [];

  if (decision === 'Priority Interview') {
    parts.push('Strong readiness score with high analysis confidence — a well-evidenced, high-capability profile.');
  } else if (decision === 'Strong Interview') {
    parts.push('Good readiness with sufficient evidence quality — recommended for interview with standard screening.');
  } else if (decision === 'Interview') {
    parts.push('Candidate meets the minimum bar for interview consideration.');
    if (analysis_confidence === 'low') {
      parts.push('Analysis confidence is low — ask for additional portfolio or project evidence during screening.');
    }
  } else if (decision === 'Consider') {
    parts.push(`Readiness score of ${candidate_readiness_score} is developing — candidate may be appropriate for junior roles or roles with training support.`);
  } else {
    parts.push(`Readiness score of ${candidate_readiness_score} is below the interview threshold for mid-to-senior QA roles.`);
  }

  if (downgraded) {
    parts.push(`Decision was downgraded one step due to ${contradiction_severity}-severity contradictions in the resume.`);
  }

  return parts.join(' ');
}
