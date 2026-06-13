/**
 * skillDemandAnalyzer.js
 * Phase 2: Computes QA skill demand from two layers:
 *   1. Static industry baseline (2025 QA market data — always available)
 *   2. DB signal overlay (live platform jobs boost real demand)
 *
 * Designed to be meaningful on day 1 and progressively data-driven as jobs grow.
 */

// ── Industry baseline (2025 QA hiring market) ─────────────────────────────────
// Source: industry-wide patterns in QA/SDET job postings (2024-2025)

const BASELINE = [
  { skill: 'Selenium',       pct: 82, trend: 'stable',   category: 'automation' },
  { skill: 'Playwright',     pct: 78, trend: 'rising',   category: 'automation' },
  { skill: 'Jenkins',        pct: 72, trend: 'stable',   category: 'ci_cd'      },
  { skill: 'JIRA',           pct: 68, trend: 'stable',   category: 'tracking'   },
  { skill: 'Postman',        pct: 67, trend: 'stable',   category: 'api'        },
  { skill: 'REST Assured',   pct: 62, trend: 'stable',   category: 'api'        },
  { skill: 'TestNG',         pct: 60, trend: 'stable',   category: 'framework'  },
  { skill: 'GitHub Actions', pct: 58, trend: 'rising',   category: 'ci_cd'      },
  { skill: 'Docker',         pct: 55, trend: 'rising',   category: 'infra'      },
  { skill: 'Cucumber',       pct: 52, trend: 'stable',   category: 'bdd'        },
  { skill: 'Cypress',        pct: 46, trend: 'rising',   category: 'automation' },
  { skill: 'pytest',         pct: 45, trend: 'rising',   category: 'framework'  },
  { skill: 'JUnit',          pct: 44, trend: 'stable',   category: 'framework'  },
  { skill: 'Appium',         pct: 38, trend: 'stable',   category: 'mobile'     },
  { skill: 'JMeter',         pct: 36, trend: 'declining', category: 'performance' },
  { skill: 'K6',             pct: 28, trend: 'rising',   category: 'performance' },
  { skill: 'TestRail',       pct: 26, trend: 'stable',   category: 'tracking'   },
  { skill: 'Gatling',        pct: 18, trend: 'stable',   category: 'performance' },
  { skill: 'BrowserStack',   pct: 22, trend: 'rising',   category: 'cloud'      },
  { skill: 'Selenium Grid',  pct: 30, trend: 'declining', category: 'infra'     },
];

const DEMAND_LEVEL = pct =>
  pct >= 70 ? 'Very High' :
  pct >= 50 ? 'High'      :
  pct >= 35 ? 'Moderate'  : 'Niche';

const TREND_LABEL = {
  rising:   { label: '↑ Trending Up',   color: 'emerald' },
  stable:   { label: '→ Stable',         color: 'blue'    },
  declining:{ label: '↓ Declining',      color: 'amber'   },
};

/**
 * @param {string[]} dbSkillsFlat - All skills from active DB jobs (already normalized/flat)
 * @returns {SkillDemandEntry[]}
 */
export function computeSkillDemand(dbSkillsFlat = []) {
  // Count DB occurrences per skill (case-insensitive)
  const dbCounts = {};
  for (const s of dbSkillsFlat) {
    const key = s.toLowerCase().trim();
    dbCounts[key] = (dbCounts[key] ?? 0) + 1;
  }

  const totalDbJobs = Math.max(1, dbSkillsFlat.length / 5); // rough job count estimate

  return BASELINE.map(entry => {
    const key      = entry.skill.toLowerCase();
    const dbCount  = dbCounts[key] ?? 0;
    const dbBoost  = Math.min(15, Math.round((dbCount / totalDbJobs) * 30)); // up to +15 from real data
    const final_pct = Math.min(99, entry.pct + dbBoost);

    return {
      skill:         entry.skill,
      demand_pct:    final_pct,
      demand_level:  DEMAND_LEVEL(final_pct),
      trend:         entry.trend,
      trend_label:   TREND_LABEL[entry.trend].label,
      trend_color:   TREND_LABEL[entry.trend].color,
      category:      entry.category,
      db_signal:     dbCount > 0, // true = confirmed in live platform jobs
    };
  }).sort((a, b) => b.demand_pct - a.demand_pct);
}
