import { STOP_WORDS, QA_SYNONYMS, QA_THEMES } from './qaVocabulary.js';

// ── Text preprocessing ────────────────────────────────────────────────────────

function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-\/]/g, ' ')  // keep hyphens and slashes (e.g. ci/cd, rest-assured)
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

// Build bigrams from tokens to capture multi-word phrases (e.g. "rest assured")
function buildBigrams(tokens) {
  const bigrams = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return bigrams;
}

// Build term frequency map (normalised by total tokens)
function buildTFVector(tokens) {
  const tf = {};
  const total = tokens.length || 1;
  for (const t of tokens) {
    tf[t] = (tf[t] ?? 0) + 1;
  }
  for (const t in tf) {
    tf[t] /= total;
  }
  return tf;
}

// ── Similarity ────────────────────────────────────────────────────────────────

function cosineSimilarity(tf1, tf2) {
  const vocab = new Set([...Object.keys(tf1), ...Object.keys(tf2)]);
  let dot = 0, norm1 = 0, norm2 = 0;
  for (const term of vocab) {
    const a = tf1[term] ?? 0;
    const b = tf2[term] ?? 0;
    dot   += a * b;
    norm1 += a * a;
    norm2 += b * b;
  }
  if (norm1 === 0 || norm2 === 0) return 0;
  return dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

// ── Synonym expansion ─────────────────────────────────────────────────────────

// Returns a Set of all terms covered when synonyms are applied
function expandTerms(termSet) {
  const expanded = new Set(termSet);
  for (const [canonical, synonyms] of Object.entries(QA_SYNONYMS)) {
    const allForms = [canonical, ...synonyms];
    // If any form of this group is present, add all forms
    if (allForms.some(f => termSet.has(f))) {
      for (const f of allForms) expanded.add(f);
    }
  }
  return expanded;
}

// Find hidden matches: job uses term A, resume uses synonym B (or vice versa)
function findHiddenMatches(resumeTermSet, jobTermSet) {
  const matches = [];
  for (const [canonical, synonyms] of Object.entries(QA_SYNONYMS)) {
    const allForms = [canonical, ...synonyms];
    const resumeForms = allForms.filter(f => resumeTermSet.has(f));
    const jobForms    = allForms.filter(f => jobTermSet.has(f));

    // Hidden match: job has a form that resume doesn't (direct overlap), but resume has a synonym
    if (resumeForms.length > 0 && jobForms.length > 0) {
      // Check if there's NO direct term overlap (that would just be a normal match)
      const hasDirectOverlap = resumeForms.some(r => jobForms.includes(r));
      if (!hasDirectOverlap) {
        matches.push({
          resume_term: resumeForms[0],
          job_term:    jobForms[0],
        });
      }
    }
  }
  return matches;
}

// Find semantic gaps: important job terms not covered by resume (even after expansion)
function findSemanticGaps(jobTermSet, resumeExpandedTermSet) {
  const gaps = [];
  for (const [canonical, synonyms] of Object.entries(QA_SYNONYMS)) {
    const allForms = [canonical, ...synonyms];
    const jobHas    = allForms.some(f => jobTermSet.has(f));
    const resumeHas = allForms.some(f => resumeExpandedTermSet.has(f));
    if (jobHas && !resumeHas) {
      gaps.push(canonical);
    }
  }
  // De-dupe and cap at 8
  return [...new Set(gaps)].slice(0, 8);
}

// ── Theme alignment ───────────────────────────────────────────────────────────

function computeThemeAlignment(resumeAllTokens, jobAllTokens) {
  const resumeSet = new Set(resumeAllTokens);
  const jobSet    = new Set(jobAllTokens);

  return QA_THEMES.map(theme => {
    // Terms from this theme that appear in the job description
    const jobThemeTerms    = [...theme.terms].filter(t => jobSet.has(t));
    // Terms from this theme that appear in BOTH job and resume (actual coverage)
    const coveredByResume  = jobThemeTerms.filter(t => resumeSet.has(t));

    // job_weight: how strongly this theme is represented in the job (0-100)
    const jobWeight      = Math.round((jobThemeTerms.length / theme.terms.size) * 100);
    // resume_coverage: how many of the job's theme terms the resume also contains (0-100)
    const resumeCoverage = jobThemeTerms.length > 0
      ? Math.round((coveredByResume.length / jobThemeTerms.length) * 100)
      : 0;

    return {
      id:               theme.id,
      label:            theme.label,
      job_weight:       jobWeight,
      resume_coverage:  resumeCoverage,
      aligned:          jobWeight > 10 && resumeCoverage >= 50,
    };
  }).filter(t => t.job_weight > 0); // only include themes present in the job
}

// ── Semantic summary ──────────────────────────────────────────────────────────

function buildSemanticSummary(score, hiddenMatches, gaps, themes) {
  const topTheme  = themes.find(t => t.job_weight > 0 && t.resume_coverage >= 70);
  const weakTheme = themes.find(t => t.job_weight > 15 && t.resume_coverage < 30);

  if (score >= 75) {
    return `Strong semantic alignment — your resume language closely mirrors what this job is looking for${topTheme ? `, especially in ${topTheme.label}` : ''}.`;
  }
  if (score >= 55) {
    const hiddenNote = hiddenMatches.length > 0
      ? ` We found ${hiddenMatches.length} hidden match${hiddenMatches.length > 1 ? 'es' : ''} where your experience maps to job requirements using different terminology.`
      : '';
    return `Moderate semantic match.${hiddenNote}${weakTheme ? ` Consider adding more ${weakTheme.label} language to your resume.` : ''}`;
  }
  return `Limited semantic overlap — this role expects significant emphasis on ${weakTheme ? weakTheme.label : (gaps[0] ?? 'core QA concepts')} that your resume does not yet reflect.`;
}

// ── Main orchestrator ─────────────────────────────────────────────────────────

/**
 * computeSemanticMatch(insight, job)
 *
 * insight — ResumeInsight model instance (has parsed_text, extracted_skills, strengths, experience_entries)
 * job     — Job model instance (has description, required_skills, responsibilities, requirements, title)
 */
export function computeSemanticMatch(insight, job) {
  // ── Build resume corpus ───────────────────────────────────────────────────
  const resumeParts = [
    insight.parsed_text ?? '',
    (insight.extracted_skills ?? []).join(' '),
    (insight.strengths ?? []).join(' '),
    ((insight.experience_entries ?? []).map(e => `${e.title ?? ''} ${e.description ?? ''}`)).join(' '),
  ];
  const resumeText = resumeParts.join(' ');

  // ── Build job corpus ──────────────────────────────────────────────────────
  const jobParts = [
    job.title ?? '',
    job.description ?? '',
    (Array.isArray(job.required_skills) ? job.required_skills : []).join(' '),
    (Array.isArray(job.responsibilities) ? job.responsibilities : []).join(' '),
    (Array.isArray(job.requirements)     ? job.requirements     : []).join(' '),
    (Array.isArray(job.nice_to_have)     ? job.nice_to_have     : []).join(' '),
  ];
  const jobText = jobParts.join(' ');

  // ── Tokenise (unigrams + bigrams) ─────────────────────────────────────────
  const resumeUnigrams = tokenize(resumeText);
  const jobUnigrams    = tokenize(jobText);
  const resumeBigrams  = buildBigrams(resumeUnigrams);
  const jobBigrams     = buildBigrams(jobUnigrams);

  const resumeAllTokens = [...resumeUnigrams, ...resumeBigrams];
  const jobAllTokens    = [...jobUnigrams,    ...jobBigrams];

  const resumeTermSet = new Set(resumeAllTokens);
  const jobTermSet    = new Set(jobAllTokens);

  // ── Cosine similarity on TF vectors ──────────────────────────────────────
  const resumeTF = buildTFVector(resumeAllTokens);
  const jobTF    = buildTFVector(jobAllTokens);
  const rawSim   = cosineSimilarity(resumeTF, jobTF);
  const rawSimilarity = Math.round(rawSim * 100);

  // ── Synonym expansion ─────────────────────────────────────────────────────
  const resumeExpanded = expandTerms(resumeTermSet);
  const jobExpanded    = expandTerms(jobTermSet);

  // Skills coverage: fraction of job's expanded term set covered by resume's expanded set
  const jobExpandedArr    = [...jobExpanded];
  const coveredCount      = jobExpandedArr.filter(t => resumeExpanded.has(t)).length;
  const skillsCoverage    = jobExpandedArr.length > 0
    ? Math.round((coveredCount / jobExpandedArr.length) * 100)
    : 0;

  // ── Hidden matches & gaps ─────────────────────────────────────────────────
  const hiddenMatches = findHiddenMatches(resumeTermSet, jobTermSet);
  const semanticGaps  = findSemanticGaps(jobTermSet, resumeExpanded);

  // ── Theme alignment ───────────────────────────────────────────────────────
  const themeAlignment = computeThemeAlignment(resumeAllTokens, jobAllTokens);

  const topTheme  = [...themeAlignment].sort((a, b) => b.resume_coverage - a.resume_coverage)[0] ?? null;
  const gapTheme  = themeAlignment
    .filter(t => t.job_weight > 15 && t.resume_coverage < 40)
    .sort((a, b) => b.job_weight - a.job_weight)[0] ?? null;

  // ── Composite semantic score ──────────────────────────────────────────────
  // Weights: 35% raw similarity, 35% skills coverage (with synonym expansion), 30% theme alignment avg
  const alignedThemes      = themeAlignment.filter(t => t.job_weight > 0);
  const avgThemeCoverage   = alignedThemes.length > 0
    ? alignedThemes.reduce((s, t) => s + t.resume_coverage, 0) / alignedThemes.length
    : 0;

  const raw = (rawSimilarity * 0.35) + (skillsCoverage * 0.35) + (avgThemeCoverage * 0.30);
  // Boost for hidden matches (each adds up to 1 point, max 5)
  const hiddenBoost = Math.min(hiddenMatches.length, 5);
  const semanticScore = Math.min(100, Math.round(raw + hiddenBoost));

  const summary = buildSemanticSummary(semanticScore, hiddenMatches, semanticGaps, themeAlignment);

  return {
    semantic_score:   semanticScore,
    raw_similarity:   rawSimilarity,
    skills_coverage:  skillsCoverage,
    hidden_matches:   hiddenMatches,
    semantic_gaps:    semanticGaps,
    theme_alignment:  themeAlignment,
    top_theme:        topTheme?.id   ?? null,
    gap_theme:        gapTheme?.id   ?? null,
    semantic_summary: summary,
  };
}
