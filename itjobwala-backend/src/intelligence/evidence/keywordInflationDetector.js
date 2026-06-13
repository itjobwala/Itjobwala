/**
 * keywordInflationDetector.js — Evidence v2 Keyword Inflation Detection
 * More sophisticated than existing detectKeywordStuffing().
 * Detects impossible fresher breadth, architecture claims without depth,
 * and skills listed with no experience context.
 */

const ADVANCED_TOOLS = new Set([
  'kubernetes', 'k8s', 'docker', 'jenkins', 'github actions', 'gitlab ci',
  'selenium grid', 'browserstack', 'lambdatest', 'testcontainers',
  'gatling', 'k6', 'contract testing', 'pact', 'graphql testing',
  'appium', 'espresso', 'xcuitest', 'aws', 'azure devops',
  'allure', 'extent reports', 'sonarqube', 'artifactory',
]);

const ARCHITECTURE_CLAIMS = [
  'framework architecture', 'automation architecture', 'test infrastructure',
  'from scratch', 'designed the framework', 'built the framework',
  'automation strategy', 'qa strategy', 'led qa team', 'qa lead',
  'qa architect', 'test architect',
];

const FRESHER_SIGNALS = [
  'intern', 'trainee', 'fresher', 'recent graduate', 'entry level',
  'entry-level', '0 years', '0-1 years', 'no experience',
  'looking for opportunity', 'seeking first', 'newly graduated',
];

export function detectKeywordInflation(parsed, skill_evidence) {
  const text           = (parsed.parsedText || '').toLowerCase();
  const expYears       = parsed.experienceYears || 0;
  const expEntries     = parsed.experienceEntries || [];
  const extractedSkills = parsed.extractedSkills || [];

  let inflationScore = 0;
  const flags = [];

  // 1. Skills with zero evidence context (listed but never mentioned in experience/projects)
  const contextlessSkills = skill_evidence.filter(s =>
    s.proof_sources.length === 1 && s.proof_sources[0] === 'skills_section_only'
  );
  const contextlessRatio = skill_evidence.length > 0
    ? contextlessSkills.length / skill_evidence.length : 0;

  if (contextlessRatio > 0.6) {
    inflationScore += 4;
    flags.push('high_contextless_skills');
  } else if (contextlessRatio > 0.4) {
    inflationScore += 2;
    flags.push('moderate_contextless_skills');
  }

  // 2. Fresher with impossible advanced tool breadth
  const isFresher = expYears <= 1 ||
    FRESHER_SIGNALS.some(s => text.includes(s));

  if (isFresher) {
    const advancedHits = [...ADVANCED_TOOLS].filter(t =>
      extractedSkills.some(s => s.toLowerCase().includes(t))
    ).length;

    if (advancedHits >= 6) {
      inflationScore += 5;
      flags.push('impossible_fresher_breadth');
    } else if (advancedHits >= 4) {
      inflationScore += 3;
      flags.push('broad_fresher_toolset');
    }
  }

  // 3. Architecture claims without implementation depth
  const archClaims = ARCHITECTURE_CLAIMS.filter(c => text.includes(c)).length;
  const hasRealArch = skill_evidence.some(s => s.signals.architecture_mentions);

  if (archClaims >= 2 && !hasRealArch && expYears <= 2) {
    inflationScore += 4;
    flags.push('architecture_claim_without_depth');
  }

  // 4. Many skills but thin experience descriptions
  const avgDescLen = expEntries.length > 0
    ? expEntries.reduce((sum, e) => sum + (e.description || '').length, 0) / expEntries.length
    : 0;

  if (extractedSkills.length > 20 && avgDescLen < 60 && expEntries.length > 0) {
    inflationScore += 3;
    flags.push('skill_heavy_experience_light');
  } else if (extractedSkills.length > 15 && avgDescLen < 40 && expEntries.length > 0) {
    inflationScore += 2;
    flags.push('low_description_depth');
  }

  // 5. No experience entries at all but many skills
  if (expEntries.length === 0 && extractedSkills.length > 12) {
    inflationScore += 4;
    flags.push('skills_without_experience');
  }

  // 6. Weak evidence rate — most tracked skills have no proof
  const weakEvidenceRate = skill_evidence.length > 0
    ? skill_evidence.filter(s => s.evidence_level === 'weak').length / skill_evidence.length
    : 0;

  if (weakEvidenceRate > 0.7) {
    inflationScore += 3;
    flags.push('high_weak_evidence_rate');
  } else if (weakEvidenceRate > 0.5) {
    inflationScore += 2;
    flags.push('moderate_weak_evidence_rate');
  }

  const risk =
    inflationScore >= 8  ? 'high'     :
    inflationScore >= 5  ? 'moderate' :
    inflationScore >= 2  ? 'low'      : 'none';

  return {
    risk,
    inflation_score: inflationScore,
    flags,
    contextless_skill_count: contextlessSkills.length,
    contextless_ratio:        Math.round(contextlessRatio * 100),
    weak_evidence_rate:       Math.round(weakEvidenceRate * 100),
  };
}
