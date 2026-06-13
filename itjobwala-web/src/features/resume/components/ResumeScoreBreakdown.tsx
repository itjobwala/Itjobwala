'use client';

import type { QaScoreBreakdown } from '../types/resume.types';

interface Props {
  breakdown: QaScoreBreakdown;
}

const QA_LABELS: Record<string, { label: string; icon: string }> = {
  automation_testing:  { label: 'Automation Testing',   icon: '⚡' },
  api_testing:         { label: 'API Testing',           icon: '🔗' },
  framework_expertise: { label: 'Framework Expertise',   icon: '🧰' },
  performance_testing: { label: 'Performance Testing',   icon: '📊' },
  qa_experience:       { label: 'QA Experience',         icon: '📋' },
  certifications:      { label: 'QA Certifications',     icon: '✅' },
  bug_tracking:        { label: 'Bug Tracking',          icon: '🐛' },
  ci_cd_readiness:     { label: 'CI/CD Readiness',       icon: '⚙️' },
};

const HINTS: Record<string, { strong: string; mid: string; weak: string }> = {
  automation_testing:  { strong: 'Well-evidenced — multiple automation tools', mid: 'Expand with Cypress or Playwright', weak: 'No automation tools detected — critical gap' },
  api_testing:         { strong: 'REST API testing expertise confirmed',        mid: 'Add REST Assured or schema validation',    weak: 'No API testing tools — add Postman or REST Assured' },
  framework_expertise: { strong: 'Mature multi-framework toolchain',            mid: 'Diversify with BDD or a performance tool', weak: 'Limited framework diversity' },
  performance_testing: { strong: 'Performance engineering experience present',  mid: 'Consider JMeter or K6 for depth',          weak: 'Optional — add JMeter/K6 to differentiate' },
  qa_experience:       { strong: 'Strong QA tenure with methodology depth',     mid: 'Add measurable impact to descriptions',    weak: 'Experience years or depth unclear' },
  certifications:      { strong: 'ISTQB or equivalent — strong trust signal',   mid: 'Pursuing ISTQB would strengthen profile',  weak: 'No QA certifications detected' },
  bug_tracking:        { strong: 'JIRA/TestRail workflow confirmed',             mid: 'Mention defect lifecycle experience',      weak: 'No bug tracking tools — add JIRA/TestRail' },
  ci_cd_readiness:     { strong: 'CI/CD pipeline integration — automation-first', mid: 'Add GitHub Actions or Jenkins',          weak: 'No CI/CD tools — common expectation in automation roles' },
};

function getHint(key: string, pct: number): string {
  const h = HINTS[key];
  if (!h) return '';
  if (pct >= 75) return h.strong;
  if (pct >= 40) return h.mid;
  return h.weak;
}

export default function ResumeScoreBreakdown({ breakdown }: Props) {
  const sections = Object.entries(breakdown).map(([key, val]) => ({
    key,
    meta:  QA_LABELS[key] ?? { label: key, icon: '•' },
    score: val.score,
    max:   val.max,
    pct:   Math.round((val.score / val.max) * 100),
  }));

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h4 className="text-caption font-bold text-subtle uppercase tracking-[0.1em]">
          QA Hiring Intelligence
        </h4>
        <p className="text-[10.5px] text-subtle mt-0.5">
          Score explains why each dimension ranked this way
        </p>
      </div>

      {sections.map(s => {
        const { barColor, textColor, bg } = getColors(s.pct);
        const hint = getHint(s.key, s.pct);
        return (
          <div key={s.key}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm leading-none">{s.meta.icon}</span>
                <span className="text-sm font-semibold text-body">{s.meta.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-micro font-bold ${textColor}`}>{s.pct}%</span>
                <span className="text-[10px] text-gray-300 font-medium">{s.score}/{s.max}</span>
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: bg }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${s.pct}%`, background: barColor }}
              />
            </div>
            {hint && (
              <p className="text-[10.5px] mt-1 leading-tight" style={{
                color: s.pct >= 75 ? 'var(--color-muted)' : s.pct >= 40 ? 'var(--color-muted)' : 'var(--color-subtle)',
              }}>
                {hint}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Score-band colors are intentional status indicators
function getColors(pct: number): { barColor: string; textColor: string; bg: string } {
  if (pct >= 80) return {
    barColor: 'linear-gradient(90deg, #6366f1, #06b6d4)',
    textColor: 'text-indigo-600',
    bg: '#eef2ff',
  };
  if (pct >= 60) return {
    barColor: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
    textColor: 'text-blue-600',
    bg: '#eff6ff',
  };
  if (pct >= 40) return {
    barColor: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
    textColor: 'text-amber-600',
    bg: '#fffbeb',
  };
  return {
    barColor: 'linear-gradient(90deg, #ef4444, #f87171)',
    textColor: 'text-red-500',
    bg: '#fef2f2',
  };
}
