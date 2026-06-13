/**
 * specializationTrendAnalyzer.js
 * Phase 2: Computes QA specialization demand from baseline + live DB signals.
 */

// ── 2025 QA specialization demand baseline ────────────────────────────────────

const SPEC_BASELINE = [
  {
    spec:        'sdet',
    label:       'SDET',
    pct:         35,
    trend:       'rising',
    insight:     'SDET is the fastest-growing QA role — demand up 40% YoY in enterprise tech',
    salary_band: '₹12L–₹28L',
    competition: 'High',
  },
  {
    spec:        'automation_qa',
    label:       'Automation QA',
    pct:         28,
    trend:       'rising',
    insight:     'Automation QA demand is accelerating — manual-only profiles face ATS filtering',
    salary_band: '₹8L–₹20L',
    competition: 'High',
  },
  {
    spec:        'api_testing',
    label:       'API QA',
    pct:         15,
    trend:       'rising',
    insight:     'API QA is a fast-growing segment driven by microservices and API-first architectures',
    salary_band: '₹9L–₹18L',
    competition: 'Moderate',
  },
  {
    spec:        'hybrid_qa',
    label:       'Hybrid QA',
    pct:         10,
    trend:       'rising',
    insight:     'Hybrid QA engineers (API + UI) are in top 20% hiring demand across QA verticals',
    salary_band: '₹10L–₹22L',
    competition: 'Moderate',
  },
  {
    spec:        'manual_qa',
    label:       'Manual QA',
    pct:         12,
    trend:       'declining',
    insight:     'Manual-only QA is declining — recruiters increasingly filter for at least basic automation',
    salary_band: '₹3L–₹8L',
    competition: 'Very High',
  },
  {
    spec:        'performance_testing',
    label:       'Performance QA',
    pct:         6,
    trend:       'stable',
    insight:     'Performance QA is a specialized niche — high pay, lower competition, steady demand',
    salary_band: '₹10L–₹24L',
    competition: 'Low',
  },
  {
    spec:        'mobile_testing',
    label:       'Mobile QA',
    pct:         5,
    trend:       'stable',
    insight:     'Mobile QA demand is driven by fintech and consumer app growth — niche but well-paid',
    salary_band: '₹10L–₹22L',
    competition: 'Low',
  },
];

// Title keywords to detect specialization in DB job titles
const SPEC_PATTERNS = [
  { spec: 'sdet',           patterns: [/\bsdet\b/i, /engineer.{0,8}test/i, /test.{0,8}engineer/i, /quality.{0,8}engineer/i] },
  { spec: 'automation_qa', patterns: [/automation.{0,8}(qa|test|engineer)/i, /\bselenium\b/i, /\bplaywright\b/i] },
  { spec: 'api_testing',        patterns: [/api.{0,8}(qa|test)/i, /backend.{0,8}(qa|test)/i] },
  { spec: 'performance_testing',patterns: [/performance.{0,8}test/i, /load.{0,8}test/i] },
  { spec: 'mobile_testing',     patterns: [/mobile.{0,8}(qa|test)/i, /\bappium\b/i] },
  { spec: 'manual_qa',     patterns: [/manual.{0,8}(qa|test)/i, /\btester\b/i] },
];

function inferSpecFromTitle(title) {
  for (const { spec, patterns } of SPEC_PATTERNS) {
    if (patterns.some(p => p.test(title))) return spec;
  }
  return null;
}

/**
 * @param {string[]} dbTitles - Job titles from active DB rows
 * @returns {SpecDemandEntry[]}
 */
export function computeSpecializationDemand(dbTitles = []) {
  // Count DB specialization signals
  const dbCounts = { sdet: 0, automation_qa: 0, api_testing: 0, hybrid_qa: 0, manual_qa: 0, performance_testing: 0, mobile_testing: 0 };
  for (const t of dbTitles) {
    const spec = inferSpecFromTitle(t);
    if (spec && spec in dbCounts) dbCounts[spec]++;
  }
  const totalDbQaJobs = Object.values(dbCounts).reduce((a, b) => a + b, 0) || 1;

  return SPEC_BASELINE.map(entry => {
    const dbCount  = dbCounts[entry.spec] ?? 0;
    const dbBoost  = Math.min(10, Math.round((dbCount / totalDbQaJobs) * 20));
    const final_pct = Math.min(99, entry.pct + dbBoost);

    return {
      ...entry,
      demand_pct:  final_pct,
      db_signal:   dbCount > 0,
    };
  }).sort((a, b) => b.demand_pct - a.demand_pct);
}
