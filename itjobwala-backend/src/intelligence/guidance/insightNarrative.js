/**
 * insightNarrative.js — Evidence-weighted recruiter-facing strengths/weaknesses.
 *
 * Phase 1: Evidence-aware strength generation (signals, not keyword counts)
 * Phase 2: Evidence-based weakness generation (credibility + execution quality)
 * Phase 3: Dead domain-check removed (QA gate in ats.service.js handles eligibility)
 * Phase 4: Prioritization — max 5 strengths, max 5 weaknesses
 *
 * All signals consumed here are already persisted by the backend pipeline.
 * No AI/LLM, no new DB fields, no breaking API changes.
 */

/**
 * Generate recruiter-facing strengths and weaknesses using persisted evidence signals.
 *
 * @param {object}      opts
 * @param {object}      opts.qa_score_breakdown    — dimension scores { score, max }
 * @param {number}      opts.qa_match_score        — 0–100 ATS/QA match score
 * @param {number}      opts.recruiter_trust_score — 0–100 evidence/trust quality
 * @param {number}      opts.capability_score      — 0–100 blended capability
 * @param {string}      opts.evidence_strength     — 'strong'|'moderate'|'basic'|'weak'
 * @param {string}      opts.keyword_stuffing_risk — 'none'|'low'|'moderate'|'high'
 * @param {number}      opts.section_only_ratio    — 0.0–1.0 fraction of skills listed only in skills section
 * @param {number|null} opts.shortlist_probability — from recruiter_readiness
 * @param {string}      opts.career_level          — 'fresher'|'junior'|'mid_level'|'senior'|'lead'
 * @param {string}      opts.qa_specialization     — QA specialization key
 * @param {number}      opts.experience_years      — total QA experience in years
 * @param {object|null} opts.evidence_profile      — has_quantified_impact, has_architecture_depth
 * @param {string[]}    opts.certificationEntries  — raw cert strings from parsed resume
 * @param {string[]}    opts.weak_evidence_skills  — skills flagged as weakly evidenced
 * @returns {{ strengths: string[], weaknesses: string[] }}
 */
export function generateInsightNarrative({
  qa_score_breakdown    = {},
  qa_match_score        = 0,
  recruiter_trust_score = 0,
  capability_score      = 0,
  evidence_strength     = 'weak',
  keyword_stuffing_risk = 'none',
  section_only_ratio    = 0,        // 0.0–1.0 fraction
  shortlist_probability = null,
  career_level          = 'junior',
  qa_specialization     = 'manual_qa',
  experience_years      = 0,
  evidence_profile      = null,
  certificationEntries  = [],
  weak_evidence_skills  = [],
} = {}) {
  const dim   = (key) => qa_score_breakdown[key]?.score ?? 0;
  const autoS = dim('automation_testing');
  const apiS  = dim('api_testing');
  const fwS   = dim('framework_expertise');
  const cicdS = dim('ci_cd_readiness');
  const certS = dim('certifications');
  const bugS  = dim('bug_tracking');

  const isEvidenced          = ['moderate', 'strong'].includes(evidence_strength);
  const hasQuantifiedImpact  = evidence_profile?.has_quantified_impact  ?? false;
  const hasArchitectureDepth = evidence_profile?.has_architecture_depth ?? false;
  const hasHighAtsLowTrust   = qa_match_score >= 60 && recruiter_trust_score < 35;

  // Pre-computed root-cause flag used by slot 7 to decide whether shortlist
  // probability feedback adds a new insight or merely restates visible causes.
  const hasRootCauseWeakness =
    hasHighAtsLowTrust               ||
    keyword_stuffing_risk === 'high' ||
    recruiter_trust_score < 35       ||
    section_only_ratio    >= 0.65    ||
    !hasQuantifiedImpact             ||
    weak_evidence_skills.length > 0;

  // ── STRENGTHS — P0 Fix 3: Evidence-aware classification ─────────────────────
  //
  // Each strength is classified by evidence quality:
  //   Verified Strength   — backed by project, experience, or architecture proof
  //   Potential Strength  — partial evidence (moderate level)
  //   Unverified Claim    — listed only, no implementation context
  //
  // The text label reflects this classification so recruiters can distinguish
  // a verified Playwright user from someone who only listed the tool name.
  //
  // Priority order: Quantified Impact → Architecture → Automation →
  //   API Evidence → CI/CD → Framework → Unverified Automation → Unverified API →
  //   Experience → Certification
  // After sorting, the first 5 are returned.

  const strengthCandidates = [];

  // Slot 1 — Quantified impact (always verified — requires numeric evidence)
  if (hasQuantifiedImpact) {
    strengthCandidates.push({
      slot: 1,
      text: '✓ Verified: Measurable automation outcomes backed by quantified metrics.',
    });
  }

  // Slot 2 — Architecture ownership (verified by implementation depth signals)
  if (hasArchitectureDepth) {
    strengthCandidates.push({
      slot: 2,
      text: '✓ Verified: Test framework architecture and design ownership confirmed.',
    });
  }

  // Slot 3 — Automation (strong-form = verified by evidence; weak-form = unverified claim)
  if (autoS >= 20 && recruiter_trust_score >= 45 && evidence_strength !== 'weak') {
    strengthCandidates.push({
      slot: 3,
      text: '✓ Verified: Automation framework experience confirmed in project or work-history context.',
    });
  } else if (autoS >= 14 && isEvidenced) {
    strengthCandidates.push({
      slot: 7,
      text: '~ Potential: Automation tools mentioned with partial implementation evidence — recruiter verification recommended.',
    });
  } else if (autoS > 0) {
    strengthCandidates.push({
      slot: 7,
      text: '⚠ Unverified: Automation tools listed — no project or work-history context found to confirm usage.',
    });
  }

  // Slot 4 — API testing (strong-form = verified; weak-form = unverified)
  if (apiS >= 15 && recruiter_trust_score >= 45) {
    strengthCandidates.push({
      slot: 4,
      text: '✓ Verified: API testing depth confirmed through implementation evidence.',
    });
  } else if (apiS >= 7 && isEvidenced) {
    strengthCandidates.push({
      slot: 8,
      text: '~ Potential: API testing tools detected with limited implementation context.',
    });
  } else if (apiS > 0) {
    strengthCandidates.push({
      slot: 8,
      text: '⚠ Unverified: API testing tools listed — project-level usage not confirmed.',
    });
  }

  // Slot 5 — CI/CD maturity (higher trust threshold for this claim)
  if (cicdS >= 4 && recruiter_trust_score >= 55) {
    strengthCandidates.push({
      slot: 5,
      text: '✓ Verified: CI/CD pipeline integration confirmed — strong automation maturity signal.',
    });
  }

  // Slot 6 — Framework breadth (evidence-gated)
  if (fwS >= 12 && isEvidenced) {
    strengthCandidates.push({
      slot: 6,
      text: '✓ Verified: Broad QA toolchain backed by demonstrated implementation experience.',
    });
  }

  // Slot 9 — Experience / career level
  const CAREER_STRENGTH = {
    fresher:     'Growing QA profile — early-career automation exposure emerging.',
    junior:      'Early-career QA experience with growing automation exposure.',
    mid_level:   'Several years of QA delivery experience across testing lifecycles.',
    'mid-level': 'Several years of QA delivery experience across testing lifecycles.',
    senior:      'Senior-level QA experience with ownership and delivery signals.',
    lead:        'Leadership-level QA profile with ownership and mentoring indicators.',
  };
  if (experience_years >= 1 && CAREER_STRENGTH[career_level]) {
    strengthCandidates.push({ slot: 9, text: CAREER_STRENGTH[career_level] });
  }

  // Slot 10 — Certification
  if (certS >= 3) {
    const hasIstqb = certificationEntries.some(c => /istqb/i.test(String(c)));
    strengthCandidates.push({
      slot: 10,
      text: hasIstqb
        ? '✓ Verified: ISTQB certification — recognized QA industry credential confirmed.'
        : '✓ Verified: Recognized QA certification detected.',
    });
  }

  strengthCandidates.sort((a, b) => a.slot - b.slot);
  const strengths = strengthCandidates.slice(0, 5).map(s => s.text);

  // ── WEAKNESSES ────────────────────────────────────────────────────────────────
  //
  // Phase 4 priority order: High ATS+Low Trust → Keyword Stuffing →
  //   Low Trust → Section-Only → No Quantified Impact → Weak Evidence Skills →
  //   Low Shortlist → No Automation → No API → No Bug Tracking
  // After sorting, the first 5 are returned.

  const weaknessCandidates = [];

  // Slot 1 — High ATS + Low Trust (most recruiter-impactful signal)
  if (hasHighAtsLowTrust) {
    weaknessCandidates.push({
      slot: 1,
      text: 'Strong ATS coverage but weak implementation evidence. Recruiters may view this profile as keyword-heavy.',
    });
  }

  // Slot 2 — Keyword stuffing
  if (keyword_stuffing_risk === 'high') {
    weaknessCandidates.push({
      slot: 2,
      text: 'High keyword density detected. Reduce keyword lists and provide more implementation context.',
    });
  }

  // Slot 3 — Low recruiter trust (standalone — not shown when slot 1 already covers it)
  if (recruiter_trust_score < 35 && !hasHighAtsLowTrust) {
    weaknessCandidates.push({
      slot: 3,
      text: 'Low evidence quality detected. Recruiters may struggle to verify claimed skills.',
    });
  }

  // Slot 4 — Section-only skills
  if (section_only_ratio >= 0.65) {
    weaknessCandidates.push({
      slot: 4,
      text: 'Most listed skills lack project or work-history evidence. Add implementation details for key technologies.',
    });
  }

  // Slot 5 — No quantified impact
  if (!hasQuantifiedImpact) {
    weaknessCandidates.push({
      slot: 5,
      text: 'No measurable outcomes found. Add metrics such as automation coverage, defect reduction, or execution-time improvements.',
    });
  }

  // Slot 6 — Weak evidence skills (top 3, from persisted weak_evidence_skills)
  if (weak_evidence_skills.length > 0) {
    const topSkills = weak_evidence_skills.slice(0, 3).join(', ');
    weaknessCandidates.push({
      slot: 6,
      text: `${topSkills} appear in the profile but lack implementation evidence.`,
    });
  }

  // Slot 7 — Low shortlist probability (fallback only).
  // Suppressed when root-cause weaknesses already explain the low score — showing
  // "shortlist capped at 38%" after four evidence-quality warnings is redundant.
  // Fires only when the shortlist is genuinely the clearest remaining signal.
  if (shortlist_probability != null && shortlist_probability < 45 && !hasRootCauseWeakness) {
    let driver;
    if (autoS === 0) {
      driver = 'Low automation coverage is the primary factor reducing shortlist probability.';
    } else if (recruiter_trust_score < 35) {
      driver = 'Weak evidence quality is the primary factor reducing shortlist probability.';
    } else if (apiS === 0) {
      driver = 'Missing API testing experience is reducing shortlist probability.';
    } else if (cicdS < 3) {
      driver = 'Lack of CI/CD readiness is reducing shortlist probability.';
    } else {
      driver = 'Multiple profile gaps are reducing shortlist probability. Focus on evidence quality and missing tools.';
    }
    weaknessCandidates.push({ slot: 7, text: driver });
  }

  // Slots 8–10 — ATS keyword-gap weaknesses (preserved from original scoreCalculator logic)
  if (autoS === 0) {
    weaknessCandidates.push({
      slot: 8,
      text: 'No automation frameworks detected — add Selenium or Cypress to stand out.',
    });
  }
  if (apiS === 0) {
    weaknessCandidates.push({
      slot: 9,
      text: 'No API testing tools detected — Postman or REST Assured is expected in most QA roles.',
    });
  }
  if (bugS === 0) {
    weaknessCandidates.push({
      slot: 10,
      text: 'No bug tracking tools mentioned — add JIRA or TestRail experience.',
    });
  }

  weaknessCandidates.sort((a, b) => a.slot - b.slot);
  const weaknesses = weaknessCandidates.slice(0, 5).map(w => w.text);

  return { strengths, weaknesses };
}
