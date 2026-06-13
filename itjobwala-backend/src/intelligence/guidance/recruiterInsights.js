/**
 * recruiterInsights.js
 * Generates recruiter-perspective coaching: what recruiters will think, best-fit roles, concerns.
 * Simulates a recruiter reading the resume and gives the candidate that perspective.
 */

const ROLE_MAP = {
  sdet: [
    'SDET (Software Development Engineer in Test)',
    'Senior QA Automation Engineer',
    'Test Automation Lead',
    'Quality Engineering Lead',
  ],
  automation_qa: [
    'QA Automation Engineer',
    'Test Automation Engineer',
    'Automation QA Analyst',
    'SDET (entry path)',
  ],
  api_testing: [
    'API QA Engineer',
    'Backend QA Engineer',
    'Integration Test Engineer',
    'QA Automation Engineer (API focus)',
  ],
  hybrid_qa: [
    'QA Automation Engineer',
    'Full-Stack QA Engineer',
    'Senior QA Automation Engineer',
    'SDET',
  ],
  performance_testing: [
    'Performance QA Engineer',
    'Load Test Engineer',
    'Site Reliability QA',
    'Performance SDET',
  ],
  mobile_testing: [
    'Mobile QA Engineer',
    'Mobile Automation Engineer',
    'iOS/Android QA Engineer',
    'Mobile SDET',
  ],
  manual_qa: [
    'QA Analyst',
    'Manual QA Engineer',
    'QA Tester',
    'Software QA Analyst',
  ],
};

const CONCERN_SIGNALS = {
  no_automation:    'Profile lacks automation tooling — may be filtered by ATS before human review',
  no_api_testing:   'No API testing exposure — limits eligibility for mid-to-senior roles',
  no_cicd:          'No CI/CD integration — enterprise QA roles increasingly require pipeline experience',
  no_certification: 'No QA certifications — soft filter at enterprise employers using ISTQB screening',
  low_confidence:   'Experience descriptions lack ownership signals — recruiter confidence is low',
  manual_only:      'Manual-only profile in an automation-first market — high screening risk',
  shallow_exp:      'Shallow experience descriptions reduce measurable impact evidence',
};

function buildRecruiterSummary({ qa_specialization, recruiter_confidence, qa_match_score, qa_seniority, experienceYears, weak_evidence_skills = [], evidence_profile = null }) {
  // Capability phrase — based on score alone, not evidence
  const capabilityPhrase =
    qa_match_score >= 70 ? 'strong foundational QA capability' :
    qa_match_score >= 50 ? 'moderate QA capability' :
    qa_match_score >= 30 ? 'developing QA capability' :
    'limited QA capability signals';

  const specLabels = {
    sdet:           'SDET',
    automation_qa:  'Automation QA',
    api_testing:         'API QA',
    hybrid_qa:      'Hybrid QA',
    performance_testing: 'Performance QA',
    mobile_testing:      'Mobile QA',
    manual_qa:      'Manual QA',
  };
  const specLabel = specLabels[qa_specialization] ?? 'QA';

  // Tools phrase: list tools seen in profile (from weak_evidence_skills as proxy for detected tools)
  let toolsPhrase = '';
  if (weak_evidence_skills.length > 0) {
    const named = weak_evidence_skills.slice(0, 3).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ');
    toolsPhrase = ` with tools including ${named}`;
  }

  // Credibility phrase — entirely separated from capability language
  const hasNoProof = evidence_profile &&
    !evidence_profile.has_architecture_depth &&
    !evidence_profile.has_quantified_impact;

  const credPhrase =
    recruiter_confidence === 'high'
      ? 'Implementation evidence is strong — recruiter confidence is high.'
      : recruiter_confidence === 'medium'
      ? 'Some implementation context detected, but experience descriptions could be stronger — recruiter confidence is moderate.'
      : (recruiter_confidence === 'very_low' || hasNoProof)
      ? 'Implementation evidence is extremely limited, significantly reducing recruiter confidence and shortlist probability.'
      : 'Thin description depth limits implementation verification — recruiter confidence is low.';

  return `Candidate shows ${capabilityPhrase} as a ${specLabel}${toolsPhrase}. ${credPhrase}`;
}

function buildConcerns({ qa_score_breakdown, qa_specialization, recruiter_confidence, qa_match_score }) {
  const concerns = [];

  const autoScore  = qa_score_breakdown.automation_testing;
  const apiScore   = qa_score_breakdown.api_testing;
  const cicdScore  = qa_score_breakdown.ci_cd_readiness;
  const certScore  = qa_score_breakdown.certifications;

  const autoPct  = autoScore  ? autoScore.score / autoScore.max   : 0;
  const apiPct   = apiScore   ? apiScore.score / apiScore.max     : 0;
  const cicdPct  = cicdScore  ? cicdScore.score / cicdScore.max   : 0;
  const certPct  = certScore  ? certScore.score / certScore.max   : 0;

  if (autoPct < 0.25) concerns.push(CONCERN_SIGNALS.no_automation);
  if (apiPct  < 0.25) concerns.push(CONCERN_SIGNALS.no_api_testing);
  if (cicdPct < 0.25) concerns.push(CONCERN_SIGNALS.no_cicd);
  if (certPct < 0.25) concerns.push(CONCERN_SIGNALS.no_certification);
  if (recruiter_confidence === 'low' || recruiter_confidence === 'very_low') concerns.push(CONCERN_SIGNALS.low_confidence);
  if (qa_specialization === 'manual_qa' && qa_match_score < 55) concerns.push(CONCERN_SIGNALS.manual_only);

  const expScore = qa_score_breakdown.qa_experience;
  if (expScore && expScore.score / expScore.max < 0.4) concerns.push(CONCERN_SIGNALS.shallow_exp);

  return concerns.slice(0, 3);
}

/**
 * Generate recruiter-perspective coaching insights.
 */
export function generateRecruiterInsights({
  qa_specialization     = 'manual_qa',
  recruiter_confidence  = 'medium',
  qa_match_score        = 0,
  qa_seniority          = 'junior',
  career_level          = 'junior',
  qa_score_breakdown    = {},
  experienceYears       = 0,
  weak_evidence_skills  = [],
  evidence_profile      = null,
}) {
  const recruiter_summary = buildRecruiterSummary({
    qa_specialization,
    recruiter_confidence,
    qa_match_score,
    qa_seniority,
    experienceYears,
    weak_evidence_skills,
    evidence_profile,
  });

  const concerns = buildConcerns({
    qa_score_breakdown,
    qa_specialization,
    recruiter_confidence,
    qa_match_score,
  });

  // Inject evidence-specific concern when tracked skills have no proof
  if (weak_evidence_skills.length >= 3) {
    const named = weak_evidence_skills.slice(0, 3).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ');
    concerns.unshift(`Implementation evidence missing for: ${named}. Recruiter cannot verify these claims from resume text.`);
  }

  // Hiring risk
  let hiring_risk = 'Medium';
  if (recruiter_confidence === 'high' && qa_match_score >= 70)   hiring_risk = 'Low';
  else if (recruiter_confidence === 'very_low' || recruiter_confidence === 'low' || qa_match_score < 40) hiring_risk = 'High';

  // Best-fit roles — top 3 for their current specialization
  const best_fit_roles = (ROLE_MAP[qa_specialization] ?? ROLE_MAP.manual_qa).slice(0, 3);

  // Evidence-aware recruiter tip — specific to what the evidence engine found
  let recruiter_tip = '';
  const trust = evidence_profile?.recruiter_trust_score ?? null;
  if (weak_evidence_skills.length >= 4 && trust !== null && trust < 40) {
    const top = weak_evidence_skills.slice(0, 2).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' and ');
    recruiter_tip = `${top} are listed without implementation evidence. For each: describe the framework you built, quantify the impact (e.g. "automated 150 test cases"), and mention CI/CD integration. This is the single highest-impact change for your profile.`;
  } else if (recruiter_confidence === 'low') {
    recruiter_tip = 'Rewrite experience bullet points to lead with ownership verbs (built, designed, led, owned, delivered) and add measurable outcomes.';
  } else if (qa_specialization === 'manual_qa') {
    recruiter_tip = 'Add at least one automation tool (Playwright or Selenium) to your profile — it is the single highest-ROI change for a manual QA profile.';
  } else if (qa_match_score < 55) {
    recruiter_tip = 'Focus on filling your top 2 skill gaps — reaching a 60+ match score dramatically increases shortlist visibility.';
  } else {
    recruiter_tip = 'Your profile is competitive — add a GitHub portfolio link with a live automation framework to elevate from good to exceptional.';
  }

  return {
    recruiter_summary,
    hiring_risk,
    best_fit_roles,
    concerns,
    recruiter_tip,
  };
}
