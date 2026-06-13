/**
 * experienceDepthAnalyzer.js
 * Analyzes the QUALITY of experience entries — not just their presence.
 * Measures role relevance, description richness, impact statements, ownership.
 */

const QA_ROLE_KEYWORDS = [
  'qa', 'quality', 'test', 'sdet', 'automation', 'assurance', 'tester',
  'engineer in test', 'software testing', 'quality engineer',
];

const OWNERSHIP_PHRASES = [
  'led', 'owned', 'responsible for building', 'architected', 'drove',
  'established', 'designed', 'developed', 'built', 'created',
  'managed the', 'managed qa', 'managed testing', 'spearheaded',
  'championed', 'initiated',
];

const IMPACT_PHRASES = [
  '%', 'reduced', 'improved', 'increased', 'saved', 'from', 'to',
  'faster', 'fewer', 'eliminated', 'prevented', 'accelerated',
  'coverage', 'efficiency', 'reliability', 'stability',
];

function isQaRole(title = '') {
  const t = title.toLowerCase();
  return QA_ROLE_KEYWORDS.some(k => t.includes(k));
}

function descriptionRichness(description = '') {
  const len = description.trim().length;
  if (len >= 400) return 1.0;
  if (len >= 220) return 0.8;
  if (len >= 100) return 0.5;
  if (len >= 40)  return 0.25;
  return 0;
}

function ownershipScore(description = '') {
  const d = description.toLowerCase();
  const hits = OWNERSHIP_PHRASES.filter(p => d.includes(p)).length;
  return Math.min(hits, 4) / 4;
}

function impactScore(description = '') {
  const d = description.toLowerCase();
  const hits = IMPACT_PHRASES.filter(p => d.includes(p)).length;
  return Math.min(hits, 5) / 5;
}

export function analyzeExperienceDepth(parsed) {
  const entries = (parsed.experienceEntries || []);

  if (entries.length === 0) {
    return {
      level:               'minimal',
      score:               0,
      qa_role_consistency: 0,
      avg_richness:        0,
      ownership_depth:     0,
      quantified_roles:    0,
      total_roles:         0,
    };
  }

  let qaRoles     = 0;
  let totalRich   = 0;
  let totalOwn    = 0;
  let quantRoles  = 0;

  for (const e of entries) {
    if (isQaRole(e.title || '')) qaRoles++;

    const desc = e.description || '';
    const rich = descriptionRichness(desc);
    const own  = ownershipScore(desc);
    const imp  = impactScore(desc);

    totalRich += rich;
    totalOwn  += own;
    if (imp > 0.2) quantRoles++;
  }

  const avgRichness  = totalRich / entries.length;
  const avgOwnership = totalOwn  / entries.length;
  const qaConsistency = qaRoles / entries.length;
  const quantRatio    = quantRoles / entries.length;

  // Depth score 0-100
  let score = 0;
  score += Math.round(qaConsistency * 25);
  score += Math.round(avgRichness   * 30);
  score += Math.round(avgOwnership  * 25);
  score += Math.round(quantRatio    * 20);
  score  = Math.min(100, score);

  const level =
    score >= 75 ? 'deep'     :
    score >= 55 ? 'solid'    :
    score >= 35 ? 'moderate' :
    score >= 15 ? 'shallow'  : 'minimal';

  return {
    level,
    score,
    qa_role_consistency: Math.round(qaConsistency * 100),
    avg_richness:        Math.round(avgRichness   * 100),
    ownership_depth:     Math.round(avgOwnership  * 100),
    quantified_roles:    quantRoles,
    total_roles:         entries.length,
  };
}
