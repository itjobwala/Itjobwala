/**
 * enterpriseScoringProfiles.js — Phase 4 Fix 7
 * Five company-type scoring profiles with custom weight distributions.
 * Used to show candidates how they'd score in different hiring contexts.
 */

const PROFILES = {
  startup: {
    label:   'Startup / Scale-up',
    weights: {
      automation_testing: 28,
      api_testing:        20,
      framework_expertise:16,
      performance_testing: 8,
      qa_experience:      18,
      certifications:      3,
      bug_tracking:        4,
      ci_cd_readiness:     8,
    },
    description: 'Startups want automation-first engineers who move fast and build pipelines.',
  },
  enterprise: {
    label:   'Enterprise',
    weights: {
      automation_testing: 22,
      api_testing:        18,
      framework_expertise:14,
      performance_testing: 8,
      qa_experience:      18,
      certifications:      8,
      bug_tracking:        6,
      ci_cd_readiness:     6,
    },
    description: 'Enterprise values process rigor, certifications, and broad QA experience.',
  },
  fintech: {
    label:   'Fintech / Banking',
    weights: {
      automation_testing: 20,
      api_testing:        28,
      framework_expertise:12,
      performance_testing:14,
      qa_experience:      16,
      certifications:      5,
      bug_tracking:        5,
      ci_cd_readiness:     5,
    },
    description: 'Fintech demands rigorous API and performance testing for compliance-critical flows.',
  },
  product_company: {
    label:   'Product Company',
    weights: {
      automation_testing: 24,
      api_testing:        20,
      framework_expertise:18,
      performance_testing: 8,
      qa_experience:      14,
      certifications:      4,
      bug_tracking:        5,
      ci_cd_readiness:     7,
    },
    description: 'Product companies want framework depth and strong automation coverage.',
  },
  outsourcing: {
    label:   'Outsourcing / Consultancy',
    weights: {
      automation_testing: 20,
      api_testing:        16,
      framework_expertise:20,
      performance_testing: 8,
      qa_experience:      18,
      certifications:      8,
      bug_tracking:        6,
      ci_cd_readiness:     4,
    },
    description: 'Outsourcing values certifications, adaptability, and broad tool expertise.',
  },
};

// Dimension key → qa_score_breakdown key mapping
const DIM_MAP = {
  automation_testing:  'automation_testing',
  api_testing:         'api_testing',
  framework_expertise: 'framework_expertise',
  performance_testing: 'performance_testing',
  qa_experience:       'qa_experience',
  certifications:      'certifications',
  bug_tracking:        'bug_tracking',
  ci_cd_readiness:     'ci_cd_readiness',
};

/**
 * @param {object|null} breakdown - qa_score_breakdown from DB
 * @returns {{ profiles, best_fit, best_label, best_score }}
 */
export function computeEnterpriseProfileScores(breakdown) {
  if (!breakdown) {
    return { profiles: null, best_fit: null, best_label: null, best_score: null };
  }

  const profiles = {};
  let best_fit   = null;
  let best_score = -1;

  for (const [key, profile] of Object.entries(PROFILES)) {
    let total = 0;
    for (const [dim, weight] of Object.entries(profile.weights)) {
      const bkd = breakdown[DIM_MAP[dim]];
      if (!bkd) continue;
      const pct = bkd.max > 0 ? bkd.score / bkd.max : 0;
      total += pct * weight;
    }
    const score = Math.min(100, Math.round(total));

    profiles[key] = {
      label:       profile.label,
      score,
      description: profile.description,
    };

    if (score > best_score) {
      best_score = score;
      best_fit   = key;
    }
  }

  return {
    profiles,
    best_fit,
    best_label: best_fit ? PROFILES[best_fit].label : null,
    best_score,
  };
}
