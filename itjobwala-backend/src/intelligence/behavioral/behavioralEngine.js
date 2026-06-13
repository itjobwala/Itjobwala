import { analyzeActionVerbs, countQuantifiedAchievements } from './actionVerbAnalyzer.js';

// ── Seniority detection from job titles ──────────────────────────────────────

const SENIORITY_LEVELS = [
  { level: 5, patterns: [/\b(vp|vice president|director|head of|principal)\b/i] },
  { level: 4, patterns: [/\b(lead|staff|architect|manager|engineering manager)\b/i] },
  { level: 3, patterns: [/\b(senior|sr\.?)\b/i] },
  { level: 2, patterns: [/\b(mid[\s-]?level|software engineer|qa engineer|sdet|developer)\b/i] },
  { level: 1, patterns: [/\b(junior|jr\.?|associate|entry|trainee)\b/i] },
  { level: 0, patterns: [/\b(intern|fresher|apprentice|graduate)\b/i] },
];

function detectSeniorityLevel(title) {
  if (!title) return 2; // assume mid-level if unknown
  for (const { level, patterns } of SENIORITY_LEVELS) {
    if (patterns.some(p => p.test(title))) return level;
  }
  return 2;
}

function computeCareerTrajectory(experienceEntries) {
  if (!experienceEntries || experienceEntries.length === 0) {
    return { score: 50, signal: 'unknown', explanation: 'No experience entries found to assess trajectory.' };
  }
  if (experienceEntries.length === 1) {
    const lvl = detectSeniorityLevel(experienceEntries[0]?.title ?? '');
    const score = lvl >= 3 ? 70 : lvl >= 2 ? 55 : 40;
    return {
      score,
      signal:      'single_role',
      explanation: 'Only one role detected — trajectory cannot be measured. Add more roles to show progression.',
    };
  }

  // Sort chronologically (newest last) — try start_date, fallback to array order
  const sorted = [...experienceEntries].sort((a, b) => {
    const da = a.start_date ? new Date(a.start_date).getTime() : 0;
    const db = b.start_date ? new Date(b.start_date).getTime() : 0;
    return da - db;
  });

  const levels  = sorted.map(e => detectSeniorityLevel(e.title ?? ''));
  const first   = levels[0];
  const last    = levels[levels.length - 1];
  const delta   = last - first;
  const upward  = levels.filter((l, i) => i > 0 && l >= levels[i - 1]).length;
  const upwardPct = Math.round((upward / (levels.length - 1)) * 100);

  let score, signal, explanation;

  if (delta >= 3) {
    score = 95; signal = 'strong_growth';
    explanation = `Clear upward trajectory — ${sorted[0].title ?? 'early role'} → ${sorted[sorted.length - 1].title ?? 'current role'} shows 3+ seniority levels of growth.`;
  } else if (delta >= 2) {
    score = 82; signal = 'good_growth';
    explanation = `Good career progression — moved up 2 seniority levels across ${sorted.length} roles.`;
  } else if (delta >= 1) {
    score = 68; signal = 'steady_growth';
    explanation = `Steady progression — one seniority level gained. ${upwardPct}% of transitions were upward moves.`;
  } else if (delta === 0 && upwardPct >= 70) {
    score = 58; signal = 'lateral';
    explanation = 'Mostly lateral moves — same seniority across roles. Breadth is good; consider seeking a senior title next.';
  } else {
    score = 42; signal = 'regression';
    explanation = 'Some downward transitions detected — ensure your resume accurately reflects your current level.';
  }

  return { score, signal, explanation };
}

// ── Leadership signals ────────────────────────────────────────────────────────

const LEADERSHIP_PATTERNS = [
  { pattern: /\b(led|leading|lead)\s+(a\s+)?team(\s+of\s+\d+)?/i,   weight: 3, label: 'Led a team'         },
  { pattern: /managed?\s+\d+\s*(engineers?|developers?|testers?)/i,  weight: 3, label: 'Managed engineers'  },
  { pattern: /\b(mentored?|coached?|trained?)\s+(junior|team|engineers?)/i, weight: 2, label: 'Mentored others' },
  { pattern: /\btechnical\s+lead\b/i,                                weight: 2, label: 'Technical Lead role' },
  { pattern: /team of\s+\d+/i,                                       weight: 2, label: 'Team size mentioned' },
  { pattern: /\b(supervised?|oversaw?|directed?)\b/i,                weight: 2, label: 'Supervised work'     },
  { pattern: /\b(onboard(ed|ing)?)\s+(new|junior)/i,                 weight: 1, label: 'Onboarded colleagues'},
  { pattern: /\bpresented?\s+(to|at)\b/i,                            weight: 1, label: 'Presented to stakeholders' },
  { pattern: /\bstakeholder/i,                                       weight: 1, label: 'Stakeholder engagement' },
  { pattern: /\bdefined?\s+(process|standard|framework|guideline)/i, weight: 1, label: 'Defined processes'   },
];

function analyzeLeadership(text) {
  if (!text) return { score: 0, indicators: [], level: 'None' };

  let totalWeight = 0;
  const found = [];

  for (const { pattern, weight, label } of LEADERSHIP_PATTERNS) {
    if (pattern.test(text)) {
      totalWeight += weight;
      found.push(label);
    }
  }

  const score = Math.min(100, Math.round((totalWeight / 10) * 100));
  const level =
    score >= 70 ? 'Strong'   :
    score >= 40 ? 'Moderate' :
    score >= 15 ? 'Basic'    :
    'None';

  return { score, indicators: found.slice(0, 5), level };
}

// ── Resume depth ─────────────────────────────────────────────────────────────

function computeDepth(insight) {
  const wordCount     = insight.word_count ?? 0;
  const projectCount  = (insight.project_entries ?? []).length;
  const certCount     = (insight.certification_entries ?? []).length;
  const expCount      = (insight.experience_entries ?? []).length;

  let score = 0;

  // Word count (0-40 pts)
  if      (wordCount >= 900) score += 40;
  else if (wordCount >= 650) score += 32;
  else if (wordCount >= 450) score += 24;
  else if (wordCount >= 300) score += 14;
  else                       score += 4;

  // Projects (0-20 pts)
  score += Math.min(20, projectCount * 7);

  // Certifications (0-20 pts)
  score += Math.min(20, certCount * 10);

  // Experience breadth (0-20 pts)
  score += Math.min(20, expCount * 5);

  return {
    score: Math.min(100, score),
    word_count: wordCount,
    project_count: projectCount,
    cert_count: certCount,
    improvement: wordCount < 450
      ? 'Your resume is too brief — aim for 500–800 words to give recruiters enough to evaluate.'
      : certCount === 0
      ? 'Add at least one QA certification to demonstrate formal credentials.'
      : projectCount === 0
      ? 'Add a QA projects section to showcase your practical automation work.'
      : null,
  };
}

// ── Hireability band ──────────────────────────────────────────────────────────

function computeBand(score) {
  if (score >= 82) return 'Exceptional';
  if (score >= 68) return 'Strong';
  if (score >= 52) return 'Competent';
  if (score >= 36) return 'Developing';
  return 'Early Career';
}

// ── Strong / weak behavior summary ───────────────────────────────────────────

function buildBehaviorSummary(verbAnalysis, quantResult, trajectory, leadership, depth) {
  const strong = [];
  const weak   = [];

  if (verbAnalysis.score >= 60)   strong.push('Uses strong ownership verbs consistently');
  else                            weak.push('Replace vague phrases ("responsible for", "helped with") with ownership verbs (built, led, delivered)');

  if (quantResult.count >= 5)     strong.push('Well-quantified achievements with measurable outcomes');
  else if (quantResult.count >= 2) strong.push('Some quantified achievements present');
  else                            weak.push('Add numbers to your bullet points — %, scale, time saved, team size');

  if (trajectory.signal === 'strong_growth' || trajectory.signal === 'good_growth')
    strong.push('Clear upward career trajectory');
  else if (trajectory.signal === 'regression')
    weak.push('Career trajectory shows downward moves — review title choices on your resume');

  if (leadership.score >= 40)     strong.push(`Leadership signals detected: ${leadership.indicators.slice(0,2).join(', ')}`);
  else if (leadership.level === 'None')
    weak.push('No leadership language found — even junior roles can mention collaboration, onboarding, or cross-team coordination');

  if (depth.score >= 60)          strong.push('Resume has good depth — sufficient length, projects, and credentials');
  else if (depth.word_count < 400) weak.push('Resume is too short — expand experience bullets and add a projects section');

  return { strong: strong.slice(0, 4), weak: weak.slice(0, 4) };
}

// ── Top coaching fix ──────────────────────────────────────────────────────────

function pickTopFix(verbScore, quantCount, leadershipScore, depthScore) {
  const gaps = [
    { gap: 100 - verbScore,     fix: 'Rewrite each bullet to start with a strong action verb (built, delivered, automated, reduced) — it takes 30 minutes and immediately improves ATS and recruiter impression.' },
    { gap: quantCount < 3 ? 80 : quantCount < 6 ? 50 : 0,
      fix: 'Add measurable outcomes to at least 5 bullet points — use %, time saved, team size, or scale numbers. Quantified resumes get 40% more callbacks.' },
    { gap: 100 - leadershipScore, fix: 'Add leadership language — even if you\'re not a manager, mentioning "collaborated with 3 engineers" or "onboarded 2 junior testers" signals team maturity.' },
    { gap: 100 - depthScore,    fix: 'Expand your resume — add a QA Projects section showcasing an automation framework, and list any relevant certifications (ISTQB is free to study).' },
  ];

  gaps.sort((a, b) => b.gap - a.gap);
  return gaps[0].fix;
}

// ── Main orchestrator ─────────────────────────────────────────────────────────

export function computeBehavioralHireability(insight) {
  const fullText = [
    insight.parsed_text ?? '',
    ((insight.experience_entries ?? []).map(e => `${e.title ?? ''} ${e.description ?? ''} ${(e.bullets ?? []).join(' ')}`)).join(' '),
  ].join(' ');

  const verbAnalysis  = analyzeActionVerbs(fullText);
  const quantResult   = countQuantifiedAchievements(fullText);
  const trajectory    = computeCareerTrajectory(insight.experience_entries ?? []);
  const leadership    = analyzeLeadership(fullText);
  const depth         = computeDepth(insight);

  // Quantification score: map count to 0-100
  const quantScore =
    quantResult.count >= 10 ? 100 :
    quantResult.count >= 6  ? 85  :
    quantResult.count >= 3  ? 65  :
    quantResult.count >= 1  ? 40  : 10;

  // Composite weighted score
  const rawScore =
    (verbAnalysis.score * 0.25) +
    (quantScore       * 0.25) +
    (trajectory.score * 0.20) +
    (leadership.score * 0.20) +
    (depth.score      * 0.10);

  const hireabilityScore = Math.min(100, Math.round(rawScore));
  const hireabilityBand  = computeBand(hireabilityScore);

  const { strong, weak } = buildBehaviorSummary(verbAnalysis, quantResult, trajectory, leadership, depth);
  const topFix = pickTopFix(verbAnalysis.score, quantResult.count, leadership.score, depth.score);

  return {
    hireability_score: hireabilityScore,
    hireability_band:  hireabilityBand,

    dimensions: {
      action_strength: {
        score:       verbAnalysis.score,
        examples:    verbAnalysis.strong,
        weak_flags:  verbAnalysis.weak,
        improvement: verbAnalysis.score < 50
          ? 'Start each bullet with a strong verb — replace "responsible for testing" with "automated 200+ test cases using Selenium".'
          : verbAnalysis.score < 70
          ? 'Good start — strengthen the remaining weak bullets with ownership verbs.'
          : null,
      },
      quantification: {
        score:       quantScore,
        count:       quantResult.count,
        examples:    quantResult.examples,
        improvement: quantResult.count < 3
          ? 'Add numbers to your experience — e.g., "reduced regression time by 40%", "automated 300 test cases", "team of 4 engineers".'
          : quantResult.count < 6
          ? 'Good quantification — aim for at least one metric per role.'
          : null,
      },
      career_trajectory: {
        score:       trajectory.score,
        signal:      trajectory.signal,
        explanation: trajectory.explanation,
        improvement: trajectory.signal === 'lateral'
          ? 'Seek a senior title in your next role to demonstrate vertical growth.'
          : trajectory.signal === 'single_role'
          ? 'Add earlier roles or freelance projects to show career context.'
          : null,
      },
      leadership: {
        score:       leadership.score,
        level:       leadership.level,
        indicators:  leadership.indicators,
        improvement: leadership.level === 'None'
          ? 'Add any cross-team work: "Collaborated with 3 frontend developers", "Onboarded 2 junior QA engineers", "Presented test reports to stakeholders".'
          : leadership.level === 'Basic'
          ? 'Amplify leadership — add team size numbers and outcomes to your leadership claims.'
          : null,
      },
      resume_depth: {
        score:        depth.score,
        word_count:   depth.word_count,
        project_count: depth.project_count,
        cert_count:   depth.cert_count,
        improvement:  depth.improvement,
      },
    },

    strong_behaviors: strong,
    weak_behaviors:   weak,
    top_behavioral_fix: topFix,
    hireability_summary: buildHireabilitySummary(hireabilityScore, hireabilityBand, strong, weak),
  };
}

function buildHireabilitySummary(score, band, strong, weak) {
  if (score >= 80) {
    return `${band} behavioral profile — your resume demonstrates clear ownership, measurable impact, and career growth. Recruiters will notice the quality difference.`;
  }
  if (score >= 60) {
    return `${band} profile with clear strengths${strong[0] ? ` (${strong[0]})` : ''}. ${weak[0] ?? 'Focus on adding measurable outcomes to elevate to the next tier.'} `;
  }
  if (score >= 40) {
    return `${band} profile — the content is there but needs stronger framing. ${weak[0] ?? 'Action verbs and quantified results are the two fastest wins.'}`;
  }
  return `Early-stage behavioral profile. Focus first on: strong action verbs, at least 3 quantified achievements, and expanding your experience entries with specific outcomes.`;
}
