/**
 * contradictionDetector.js — Phase 4: Evidence Contradiction Detection
 *
 * Detects cases where resume claims are not supported by corresponding evidence.
 * Contradictions are used to inform recruiter_trust_score adjustments and
 * recruiter-facing warnings. They do NOT affect qa_match_score (capability lane).
 *
 * Contradiction types:
 *   unverified_skill          — tool listed but no implementation context found
 *   career_claim_mismatch     — seniority claimed via title but years don't support it
 *   architecture_claim_unverified — architecture phrases but no architecture evidence
 *   sdet_claim_unverified     — SDET title mentioned but evidence groups insufficient
 *   volume_credibility_gap    — high skill count with low overall evidence density
 */

const SENIORITY_THRESHOLDS = {
  senior:    6,   // years required for senior
  lead:      10,  // years required for lead
  architect: 8,   // years required for architect
  principal: 8,
  staff:     8,
};

const SENIORITY_CLAIM_PATTERNS = [
  [/senior\s+qa|senior\s+sdet|senior\s+automation/i,    'senior',    6],
  [/sr\.?\s+qa|sr\.?\s+sdet/i,                          'senior',    6],
  [/qa\s+lead|test\s+lead|lead\s+qa/i,                  'lead',      10],
  [/qa\s+architect|automation\s+architect/i,             'architect', 8],
  [/principal\s+qa/i,                                    'principal', 8],
  [/staff\s+qa|staff\s+sdet/i,                          'staff',     8],
];

const ARCHITECTURE_CLAIM_PHRASES = [
  'framework architect', 'automation architect', 'framework from scratch',
  'designed test architecture', 'built automation framework', 'automation strategy',
  'test infrastructure', 'designed the framework', 'automation infrastructure',
];

const SDET_CLAIM_PHRASES = [
  'sdet', 'software development engineer in test', 'software development engineer',
];

/**
 * @param {object} params
 * @param {object} parsed           — parsed resume
 * @param {object} evidenceResult   — from analyzeEvidence()
 * @param {object} evidence_profile — from recruiterTrustEngine
 * @param {number} experienceYears
 * @param {string} qa_specialization — detected specialization
 * @param {object} sdet_evidence    — from getSdetEvidenceSummary()
 * @returns {{ contradictions: object[], contradiction_severity: string }}
 */
export function detectContradictions({
  parsed,
  evidenceResult,
  evidence_profile,
  experienceYears,
  qa_specialization,
  sdet_evidence = null,
}) {
  const text         = (parsed?.parsedText || '').toLowerCase();
  const skills       = (parsed?.extractedSkills || []).map(s => s.toLowerCase());
  const skill_evidence = evidenceResult?.skill_evidence || [];

  const contradictions = [];

  // ── 1. Unverified skills (listed but no project/experience context) ─────────
  const unverifiedSkills = skill_evidence
    .filter(s => s.proof_sources.length === 1 && s.proof_sources[0] === 'skills_section_only')
    .map(s => s.skill);

  if (unverifiedSkills.length >= 3) {
    contradictions.push({
      type:             'unverified_skill',
      severity:         unverifiedSkills.length >= 6 ? 'high' : 'medium',
      description:      `${unverifiedSkills.length} skills listed with no implementation context.`,
      flagged_skills:   unverifiedSkills.slice(0, 5),
      evidence_against: ['No project or experience entry mentions these tools in context'],
      action:           'Add experience bullets that describe HOW each tool was used.',
    });
  }

  // ── 2. Career claim mismatch (title says senior/lead, years don't support it) ─
  for (const [pattern, level, requiredYears] of SENIORITY_CLAIM_PATTERNS) {
    if (pattern.test(text) && experienceYears < requiredYears) {
      contradictions.push({
        type:             'career_claim_mismatch',
        severity:         experienceYears < requiredYears - 3 ? 'high' : 'medium',
        description:      `Resume mentions ${level}-level title but experience is ${experienceYears} year(s) (${requiredYears}+ required).`,
        claimed_level:    level,
        actual_years:     experienceYears,
        required_years:   requiredYears,
        evidence_against: [`${experienceYears} years is below the ${requiredYears}-year threshold for ${level}`],
        action:           'Ensure job titles reflect verified tenure, or add portfolio projects that demonstrate impact.',
      });
      break; // one career mismatch flag is enough
    }
  }

  // ── 3. Architecture claim without evidence ─────────────────────────────────
  const claimsArchitecture = ARCHITECTURE_CLAIM_PHRASES.some(p => text.includes(p));
  const hasArchEvidence    = evidence_profile?.has_architecture_depth ?? false;

  if (claimsArchitecture && !hasArchEvidence) {
    contradictions.push({
      type:             'architecture_claim_unverified',
      severity:         'high',
      description:      'Architecture or framework ownership is mentioned but no implementation-level evidence detected.',
      evidence_against: [
        'Architecture phrases found in resume text',
        'No architecture-level signals detected in experience descriptions (no framework design verbs, no scalability patterns)',
      ],
      action:           'Describe what you built: the framework structure, patterns used (POM, data-driven), and measurable impact.',
    });
  }

  // ── 4. SDET claim without evidence ────────────────────────────────────────
  const claimsSdet = SDET_CLAIM_PHRASES.some(p => text.includes(p)) || qa_specialization === 'sdet';

  if (claimsSdet && sdet_evidence && !sdet_evidence.is_qualified) {
    const missingGroups = Object.entries(sdet_evidence.groups)
      .filter(([, v]) => !v)
      .map(([k]) => k.replace(/_/g, ' '));

    contradictions.push({
      type:             'sdet_claim_unverified',
      severity:         sdet_evidence.groups_satisfied <= 1 ? 'high' : 'medium',
      description:      `SDET claimed but only ${sdet_evidence.groups_satisfied}/${sdet_evidence.groups_required} evidence groups satisfied.`,
      missing_groups:   missingGroups,
      evidence_against: [
        `Coding evidence: ${sdet_evidence.groups.coding ? 'found' : 'NOT found'}`,
        `Framework ownership: ${sdet_evidence.groups.framework_ownership ? 'found' : 'NOT found'}`,
        `CI/CD integration: ${sdet_evidence.groups.cicd_integration ? 'found' : 'NOT found'}`,
      ],
      action:           'Add: coding language in project descriptions, framework architecture verbs, and CI/CD pipeline references.',
    });
  }

  // ── 5. Volume/credibility gap (many skills, very low evidence density) ─────
  const evidenceDensity = evidence_profile?.evidence_density ?? 50;
  const skillCount      = skills.length;

  if (skillCount >= 15 && evidenceDensity < 20) {
    contradictions.push({
      type:             'volume_credibility_gap',
      severity:         'medium',
      description:      `${skillCount} skills listed but overall evidence density is only ${evidenceDensity}% — most tools lack implementation context.`,
      evidence_against: ['High skill count with low evidence density indicates aspirational skill listing'],
      action:           'Reduce the skills list to tools you have demonstrably used. Add project bullets for each key tool.',
    });
  }

  // ── Overall severity ───────────────────────────────────────────────────────
  const SEVERITY_RANK = { high: 3, medium: 2, low: 1 };
  const maxSeverity = contradictions.length > 0
    ? contradictions.reduce((max, c) => {
        return (SEVERITY_RANK[c.severity] ?? 0) > (SEVERITY_RANK[max] ?? 0) ? c.severity : max;
      }, 'low')
    : 'none';

  return {
    contradictions,
    contradiction_count:    contradictions.length,
    contradiction_severity: maxSeverity,
  };
}
