/**
 * recruiterReadiness.js
 * Predicts shortlist likelihood and generates backend-driven market readiness metrics.
 * Replaces the weak frontend-computed metric cards with recruiter-grade intelligence.
 */

// ── Shortlist probability ─────────────────────────────────────────────────────

export function computeRecruiterReadiness({
  recruiter_confidence  = 'medium',
  qa_specialization     = 'manual_qa',
  qa_seniority          = 'junior',
  career_level          = 'junior',
  qa_match_score        = 0,
  qa_score_breakdown    = {},
  experienceYears       = 0,
  evidence_profile      = null,
}) {
  // ── Shortlist probability ─────────────────────────────────────────────────
  let prob = 35;

  const CONFIDENCE_BOOST = { high: 26, medium: 12, low: -12, very_low: -22 };
  prob += CONFIDENCE_BOOST[recruiter_confidence] ?? 0;

  if (qa_match_score >= 85)      prob += 22;
  else if (qa_match_score >= 70) prob += 14;
  else if (qa_match_score >= 55) prob += 6;
  else if (qa_match_score < 35)  prob -= 12;

  const SPEC_BOOST = { sdet: 10, automation_qa: 6, hybrid_qa: 7, api_testing: 4, performance_testing: 5, mobile_testing: 6, manual_qa: -5 };
  prob += SPEC_BOOST[qa_specialization] ?? 0;

  // Phase 1 audit fix: experienceYears removed from shortlist_probability.
  // Years already contribute to qa_match_score via the qa_experience dimension,
  // which then flows into prob via the qa_match_score boost block above.
  // Adding years here a second time was double-counting the same signal.

  const raw_prob = Math.min(96, Math.max(8, Math.round(prob)));
  // ATS skill coverage is a hard constraint on shortlist probability.
  // High recruiter confidence cannot compensate for weak technical skill coverage —
  // a hiring manager will not shortlist a candidate who lacks domain skills regardless
  // of how authentic or senior their descriptions appear.
  const shortlist_probability =
    qa_match_score <= 40 ? Math.min(raw_prob, 45) :
    qa_match_score <  55 ? Math.min(raw_prob, 65) :
    raw_prob;

  // ── Enterprise readiness ──────────────────────────────────────────────────
  const cicdScore = qa_score_breakdown.ci_cd_readiness;
  const autoScore = qa_score_breakdown.automation_testing;
  const cicdPct   = cicdScore ? cicdScore.score / cicdScore.max : 0;
  const autoPct   = autoScore ? autoScore.score / autoScore.max : 0;
  const enterpriseSignal = (cicdPct + autoPct) / 2;

  let enterprise_readiness = 'Developing';
  if (enterpriseSignal >= 0.75 && (qa_specialization === 'sdet' || qa_specialization === 'automation_qa')) enterprise_readiness = 'Strong';
  else if (enterpriseSignal >= 0.50) enterprise_readiness = 'Moderate';
  else if (enterpriseSignal < 0.25)  enterprise_readiness = 'Basic';
  else enterprise_readiness = 'Developing';

  // ── Automation maturity ───────────────────────────────────────────────────
  const fwScore  = qa_score_breakdown.framework_expertise;
  const fwPct    = fwScore ? fwScore.score / fwScore.max : 0;
  const maturitySignal = (autoPct * 0.6 + fwPct * 0.4);

  let automation_maturity = 'Beginner';
  if (maturitySignal >= 0.82)      automation_maturity = 'Expert';
  else if (maturitySignal >= 0.65) automation_maturity = 'Advanced';
  else if (maturitySignal >= 0.45) automation_maturity = 'Intermediate';
  else if (maturitySignal >= 0.25) automation_maturity = 'Developing';

  // ── Recruiter visibility ──────────────────────────────────────────────────
  let recruiter_visibility = 'Low';
  if (shortlist_probability >= 72)      recruiter_visibility = 'High';
  else if (shortlist_probability >= 52) recruiter_visibility = 'Moderate';
  else if (shortlist_probability >= 38) recruiter_visibility = 'Limited';

  // ── Career growth potential ───────────────────────────────────────────────
  let career_growth_potential = 'Moderate';
  if (qa_specialization === 'sdet' && qa_seniority === 'senior')                        career_growth_potential = 'Architect Track';
  else if (['sdet', 'automation_qa', 'hybrid_qa'].includes(qa_specialization))          career_growth_potential = 'High';
  else if (['api_testing', 'performance_testing', 'mobile_testing'].includes(qa_specialization))       career_growth_potential = 'Specialty Track';
  else if (qa_specialization === 'manual_qa' && qa_match_score >= 50)                   career_growth_potential = 'Transition Ready';
  else                                                                                   career_growth_potential = 'Developing';

  // ── Evidence caps on automation maturity and enterprise readiness (Fix 9) ─
  // No quantified impact AND no architecture depth = implementation unproven
  const hasQuantifiedImpact = evidence_profile?.has_quantified_impact ?? false;
  const hasArchDepth        = evidence_profile?.has_architecture_depth ?? false;
  if (!hasQuantifiedImpact && !hasArchDepth) {
    if (['Expert', 'Advanced', 'Intermediate'].includes(automation_maturity)) {
      automation_maturity = 'Foundational';
    }
    if (['Strong', 'Moderate'].includes(enterprise_readiness)) {
      enterprise_readiness = 'Low';
    }
  }

  // ── Hiring risk ───────────────────────────────────────────────────────────
  let hiring_risk = 'Medium';
  if (recruiter_confidence === 'high' && qa_match_score >= 70)  hiring_risk = 'Low';
  else if (recruiter_confidence === 'very_low' || recruiter_confidence === 'low' || qa_match_score < 40) hiring_risk = 'High';

  // ── Market readiness label ────────────────────────────────────────────────
  let market_readiness = 'Developing';
  if (shortlist_probability >= 72)      market_readiness = 'Strong';
  else if (shortlist_probability >= 55) market_readiness = 'Competitive';
  else if (shortlist_probability >= 38) market_readiness = 'Moderate';

  return {
    shortlist_probability,
    market_readiness,
    recruiter_visibility,
    hiring_risk,
    enterprise_readiness,
    automation_maturity,
    career_growth_potential,
  };
}
