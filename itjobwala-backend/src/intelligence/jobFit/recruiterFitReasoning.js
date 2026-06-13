/**
 * recruiterFitReasoning.js
 * Generates human-readable recruiter perspective on this specific job fit.
 * Simulates what a recruiter would say when reviewing this candidate for THIS job.
 */

const SPEC_LABEL = {
  sdet:           'SDET',
  automation_qa:  'Automation QA',
  api_testing:         'API QA',
  hybrid_qa:      'Hybrid QA',
  performance_testing: 'Performance QA',
  mobile_testing:      'Mobile QA',
  manual_qa:      'Manual QA',
};

const SENIORITY_LABEL = {
  fresher:   'fresher',
  junior:    'junior',
  mid_level: 'mid-level',
  senior:    'senior',
  lead:      'lead',
};

function buildFitSummary({
  job_fit_score,
  fit_level,
  candidateSpec,
  jobSpec,
  candidateSeniority,
  jobSeniority,
  high_impact_missing_skills,
  tool_overlap_pct,
  jobTitle,
}) {
  const cSpecLabel = SPEC_LABEL[candidateSpec] ?? 'QA';
  const jSpecLabel = SPEC_LABEL[jobSpec]       ?? 'QA';
  const cSenLabel  = SENIORITY_LABEL[candidateSeniority] ?? 'QA';
  const jSenLabel  = SENIORITY_LABEL[jobSeniority]       ?? 'suitable';

  let summary = '';

  if (fit_level === 'Excellent Fit') {
    summary = `This candidate is an excellent match for the ${jobTitle} role. Their ${cSpecLabel} specialization directly aligns with what the job requires, and the tool overlap is strong at ${tool_overlap_pct}%.`;
  } else if (fit_level === 'Strong Fit') {
    summary = `Strong candidate for ${jobTitle}. Their ${cSpecLabel} background covers most role requirements. ${
      high_impact_missing_skills.length > 0
        ? `Adding ${high_impact_missing_skills[0]} would make them a near-perfect fit.`
        : 'Minor gaps are unlikely to block shortlisting.'
    }`;
  } else if (fit_level === 'Partial Fit') {
    const gapText = high_impact_missing_skills.length > 0
      ? `Missing: ${high_impact_missing_skills.slice(0, 2).join(', ')}.`
      : 'Some tool gaps present.';
    summary = `Partial match for ${jobTitle}. The candidate has a ${cSpecLabel} background, but ${
      candidateSpec !== jobSpec
        ? `the role targets ${jSpecLabel} — there is a specialization gap.`
        : `tool coverage needs improvement. ${gapText}`
    }`;
  } else if (fit_level === 'Weak Fit') {
    summary = `Weak match for ${jobTitle}. The candidate's ${cSpecLabel} profile and tool set do not closely align with this ${jSpecLabel} role's requirements. Significant upskilling needed before applying.`;
  } else {
    summary = `This role is not a good fit at this time. The ${jobTitle} requires a ${jSpecLabel} background, and the candidate's current profile does not meet the core requirements.`;
  }

  return summary;
}

function buildRejectionRisks({
  fit_level,
  candidateSpec,
  jobSpec,
  candidateSeniority,
  jobSeniority,
  high_impact_missing_skills,
  recruiter_confidence,
}) {
  const risks = [];

  if (candidateSpec !== jobSpec && candidateSpec && jobSpec) {
    risks.push(`Specialization mismatch: candidate is ${SPEC_LABEL[candidateSpec] ?? candidateSpec}, role expects ${SPEC_LABEL[jobSpec] ?? jobSpec}`);
  }

  if (high_impact_missing_skills.length > 0) {
    risks.push(`Missing key tools: ${high_impact_missing_skills.join(', ')} — likely ATS filter triggers`);
  }

  if (recruiter_confidence === 'low') {
    risks.push('Low recruiter confidence score — experience descriptions lack measurable impact');
  }

  if (jobSeniority && candidateSeniority) {
    const SENIORITY_ORDER = { fresher: 0, junior: 1, mid_level: 2, senior: 3, lead: 4 };
    const diff = (SENIORITY_ORDER[jobSeniority] ?? 1) - (SENIORITY_ORDER[candidateSeniority] ?? 1);
    if (diff >= 2) {
      risks.push(`Seniority gap: role expects ${SENIORITY_LABEL[jobSeniority]} level, candidate is ${SENIORITY_LABEL[candidateSeniority]}`);
    }
  }

  return risks.slice(0, 3);
}

function buildShortlistPrediction(job_fit_score, qa_match_score) {
  const combined = Math.round(job_fit_score * 0.6 + (qa_match_score ?? 0) * 0.4);
  if (combined >= 80) return 'High — strong shortlist candidate for this specific role';
  if (combined >= 65) return 'Moderate — competitive but with addressable gaps';
  if (combined >= 45) return 'Low-Moderate — significant improvements needed before applying';
  return 'Low — role requirements not yet met';
}

/**
 * Generate recruiter-perspective reasoning for this specific job fit.
 */
export function generateRecruiterFitReasoning({
  job_fit_score,
  fit_level,
  resumeInsight,
  job,
  inferred_job_spec,
  inferred_job_seniority,
  high_impact_missing_skills,
  tool_overlap_pct,
}) {
  const candidateSpec       = resumeInsight.qa_specialization;
  const candidateSeniority  = resumeInsight.qa_seniority;
  const recruiter_confidence = resumeInsight.recruiter_confidence;
  const qa_match_score      = resumeInsight.qa_match_score;

  const recruiter_fit_summary = buildFitSummary({
    job_fit_score,
    fit_level,
    candidateSpec,
    jobSpec:       inferred_job_spec,
    candidateSeniority,
    jobSeniority:  inferred_job_seniority,
    high_impact_missing_skills,
    tool_overlap_pct,
    jobTitle:      job.title,
  });

  const rejection_risks = buildRejectionRisks({
    fit_level,
    candidateSpec,
    jobSpec:           inferred_job_spec,
    candidateSeniority,
    jobSeniority:      inferred_job_seniority,
    high_impact_missing_skills,
    recruiter_confidence,
  });

  const shortlist_prediction = buildShortlistPrediction(job_fit_score, qa_match_score);

  return {
    recruiter_fit_summary,
    rejection_risks,
    shortlist_prediction,
  };
}
