'use client';

import type { QaScoreBreakdown } from '../types/resume.types';
import InfoButton                from './InfoButton';

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
  mobile_testing:      { label: 'Mobile Testing',        icon: '📱' },
  domain_expertise:    { label: 'Domain Expertise',      icon: '🏢' },
};

const INFO: Record<string, string> = {
  automation_testing:
    'How well your resume proves you can build and run automated tests. A high score here is the single biggest signal recruiters look for in QA roles today.',
  api_testing:
    'Shows whether you can test APIs — not just use Postman, but validate responses, handle authentication, and write assertions. Increasingly required even for non-API-focused QA roles.',
  framework_expertise:
    'Measures whether you design test frameworks, not just write test cases. Recruiters use this to distinguish junior testers from engineers who can build scalable automation infrastructure.',
  performance_testing:
    'Indicates whether you can test system stability under load. Not required for all QA roles, but opens doors to senior positions and performance-specialist tracks.',
  test_design_methodology:
    'Reflects how systematically you approach testing — whether you go beyond "happy path" and design tests that actually catch bugs. Experienced QA engineers score higher here naturally.',
  qa_experience:
    'Combines your years in QA with your familiarity with the full QA lifecycle — from test planning through defect resolution. A high score here builds recruiter confidence quickly.',
  certifications:
    'ISTQB and equivalent certifications signal commitment to the profession. Recruiters at larger companies often use this as a first-pass filter.',
  bug_tracking:
    'Proves you work within professional defect workflows — not just testing, but tracking, communicating, and resolving issues with developers. Expected at every experience level.',
  ci_cd_readiness:
    'Shows whether your automation runs in a real pipeline, not just locally. Mid-to-senior QA roles increasingly require this — it separates automation engineers from automation scripters.',
  mobile_testing:
    'Bonus: mobile testing frameworks (Appium, Detox, Maestro) boost score for mobile QA roles.',
  domain_expertise:
    'Bonus: domain-specific QA experience (fintech, healthcare, e-commerce) adds recruiter context.',
};

const HINTS: Record<string, { strong: string; mid: string; weak: string }> = {
  automation_testing:  { strong: 'Well-evidenced — multiple automation tools',      mid: 'Expand with Cypress or Playwright',       weak: 'No automation tools detected — critical gap' },
  api_testing:         { strong: 'REST API testing expertise confirmed',             mid: 'Add REST Assured or schema validation',   weak: 'No API testing tools — add Postman or REST Assured' },
  framework_expertise: { strong: 'Mature multi-framework toolchain',                mid: 'Diversify with BDD or a performance tool', weak: 'Limited framework diversity' },
  performance_testing: { strong: 'Performance engineering experience present',      mid: 'Consider JMeter or K6 for depth',         weak: 'Optional — add JMeter/K6 to differentiate' },
  qa_experience:       { strong: 'Strong QA tenure with methodology depth',         mid: 'Add measurable impact to descriptions',   weak: 'Experience years or depth unclear' },
  certifications:      { strong: 'ISTQB or equivalent — strong trust signal',       mid: 'Pursuing ISTQB would strengthen profile',  weak: 'No QA certifications detected' },
  bug_tracking:        { strong: 'JIRA/TestRail workflow confirmed',                 mid: 'Mention defect lifecycle experience',     weak: 'No bug tracking tools — add JIRA/TestRail' },
  ci_cd_readiness:     { strong: 'CI/CD pipeline integration — automation-first',   mid: 'Add GitHub Actions or Jenkins',           weak: 'No CI/CD tools — common expectation in automation roles' },
  mobile_testing:      { strong: 'Mobile testing expertise detected',               mid: 'Add mobile frameworks like Appium',       weak: '' },
  domain_expertise:    { strong: 'Domain-specific QA experience detected',          mid: 'Highlight domain context in descriptions', weak: '' },
};

const SKIP_DIMS   = new Set(['resume_quality', 'test_design_methodology']);
const BONUS_DIMS  = new Set(['mobile_testing', 'domain_expertise']);
const PENALTY_KEY = 'penalties';

function getHint(key: string, pct: number): string {
  const h = HINTS[key];
  if (!h) return '';
  if (pct >= 75) return h.strong;
  if (pct >= 40) return h.mid;
  return h.weak;
}

function getBarColor(pct: number): string {
  if (pct >= 70) return '#5cb085';
  if (pct >= 40) return '#5b87d6';
  if (pct >= 20) return '#c79a4f';
  return '#d18a84';
}

interface SectionItem {
  key:     string;
  meta:    { label: string; icon: string };
  score:   number;
  max:     number;
  pct:     number;
  isBonus: boolean;
}

function ScoreRow({ s }: { s: SectionItem }) {
  const barColor = getBarColor(s.pct);
  const pctColor = s.pct >= 70 ? '#7fcca0' : s.pct >= 40 ? '#9fbdf0' : s.pct >= 20 ? '#d8ad63' : '#d18a84';
  const hint     = getHint(s.key, s.pct);
  const info     = INFO[s.key];

  return (
    <div style={{ padding: '16px 0', borderTop: '1px solid #2a2e30' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>{s.meta.icon}</span>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#f3f4f5', flex: 1 }}>{s.meta.label}</span>
        {info && <InfoButton text={info} />}
        <span style={{ fontSize: 16, fontWeight: 700, color: pctColor }}>
          {s.score}<span style={{ color: '#6c7378', fontWeight: 600 }}>/{s.max}</span>
        </span>
      </div>
      <div style={{ height: 7, borderRadius: 6, background: '#26292b', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 6, background: barColor,
          width: `${s.pct}%`, transition: 'width 0.7s ease',
        }} />
      </div>
      {hint && (
        <p style={{ fontSize: 13.5, color: '#9aa0a6', marginTop: 8, lineHeight: 1.5 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function GroupLabel({ text }: { text: string }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
      color: '#6c7378', margin: '6px 0 0',
    }}>
      {text}
    </p>
  );
}

export default function ResumeScoreBreakdown({ breakdown }: Props) {
  const sections = Object.entries(breakdown)
    .filter(([key]) => !SKIP_DIMS.has(key) && key !== PENALTY_KEY)
    .map(([key, val]) => ({
      key,
      isBonus: BONUS_DIMS.has(key),
      meta:  QA_LABELS[key] ?? { label: key.replace(/_/g, ' '), icon: '•' },
      score: val.score,
      max:   val.max,
      pct:   val.max > 0 ? Math.round((val.score / val.max) * 100) : 0,
    }));

  const penalty      = (breakdown as unknown as Record<string, { score: number; max: number }>)[PENALTY_KEY];
  const penaltyScore = penalty?.score ?? 0;

  const strong  = sections.filter(s => !s.isBonus && s.pct >= 70).sort((a, b) => b.pct - a.pct);
  const gaps    = sections.filter(s => !s.isBonus && s.pct < 70).sort((a, b) => a.pct - b.pct);
  const bonuses = sections.filter(s => s.isBonus && s.score > 0);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.8px', textTransform: 'uppercase', color: '#6c7378' }}>
            Score Breakdown
          </p>
          <InfoButton text="Shows exactly where your resume is strong and where recruiters might hesitate. Strong dimensions help you pass ATS filters. Gap dimensions are where you're losing points — fix these to rank higher." />
        </div>
        <p style={{ fontSize: 13, color: '#6c7378', marginTop: 4 }}>
          Score explains why each dimension ranked this way
        </p>
      </div>

      {strong.length > 0 && (
        <>
          <GroupLabel text={`Strong Dimensions · ${strong.length}`} />
          {strong.map(s => <ScoreRow key={s.key} s={s} />)}
        </>
      )}

      {gaps.length > 0 && (
        <>
          <GroupLabel text={`Gaps · ${gaps.length}`} />
          {gaps.map(s => <ScoreRow key={s.key} s={s} />)}
        </>
      )}

      {bonuses.length > 0 && (
        <>
          <GroupLabel text="Bonuses" />
          {bonuses.map(s => <ScoreRow key={s.key} s={s} />)}
        </>
      )}

      {penaltyScore < 0 && (
        <div style={{
          marginTop: 14, background: '#361c1b', border: '1px solid #5a2e2b',
          borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 14 }}>⚠️</span>
          <span style={{ fontSize: 13, color: '#d18a84', fontWeight: 500 }}>
            Penalty applied: {penaltyScore} pts — evidence concerns detected
          </span>
        </div>
      )}
    </div>
  );
}
