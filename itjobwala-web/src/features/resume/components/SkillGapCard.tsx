'use client';

import type { SkillMetadata, SkillEvidenceItem, EvidenceLevel } from '../types/resume.types';
import InfoButton from './InfoButton';

interface Props {
  extracted:      string[];
  missing:        string[];
  suggested:      string[];
  skillMetadata?: SkillMetadata[];
  skillEvidence?: SkillEvidenceItem[];
}

const HIGH_IMPACT = new Set([
  'selenium', 'selenium webdriver', 'cypress', 'playwright', 'appium', 'webdriverio',
  'testng', 'junit', 'cucumber', 'bdd', 'jmeter', 'gatling', 'k6',
  'api testing', 'rest assured', 'automation testing', 'test automation',
  'performance testing', 'mobile testing',
]);

const NICE_TO_HAVE = new Set([
  'sql', 'jira', 'ci/cd', 'docker', 'maven', 'gradle', 'git',
  'testrail', 'zephyr', 'postman', 'soapui', 'jenkins', 'github actions',
  'page object model', 'data-driven testing', 'cross-browser testing',
]);

const GAP_INFO: Record<string, string> = {
  extracted: 'Every skill your resume mentions — in your Skills section, inside job descriptions, and within project summaries. Green chips are backed by real evidence. Amber chips are listed but not proven.',
  high:      'Skills that appear in the majority of QA job postings right now. If you are missing these, recruiters screening by keywords will not find you — even if you are qualified.',
  nice:      'Skills that make you a stronger all-round QA candidate. Not required for most roles, but they help differentiate you when two candidates have similar core skills.',
  suggested: 'The exact keywords recruiters type when searching for QA candidates. Adding these to your profile makes you more discoverable without changing your resume.',
};

function classifyMissing(skills: string[]) {
  const high: string[] = [];
  const nice: string[] = [];
  const other: string[] = [];
  for (const s of skills) {
    const lower = s.toLowerCase();
    if ([...HIGH_IMPACT].some(kw => lower.includes(kw) || kw.includes(lower))) high.push(s);
    else if ([...NICE_TO_HAVE].some(kw => lower.includes(kw) || kw.includes(lower))) nice.push(s);
    else other.push(s);
  }
  return { high, nice, other };
}

function buildEvidenceMap(
  skillMetadata: SkillMetadata[] | undefined,
  skillEvidence: SkillEvidenceItem[] | undefined,
): Map<string, EvidenceLevel> {
  const map = new Map<string, EvidenceLevel>();
  for (const m of (skillMetadata ?? [])) map.set(m.skill.toLowerCase(), m.evidence_level);
  for (const e of (skillEvidence ?? [])) {
    if (!map.has(e.skill.toLowerCase())) map.set(e.skill.toLowerCase(), e.evidence_level);
  }
  return map;
}

type ChipVariant = 'green' | 'gray' | 'amber' | 'blue' | 'red';

const CHIP_CFG: Record<ChipVariant, { bg: string; bd: string; color: string; dot: string }> = {
  green: { bg: '#15241a', bd: '#2c5238', color: '#7fcca0', dot: '#5cb085' },
  gray:  { bg: '#1b1e1f', bd: '#34393b', color: '#d2d6d9', dot: '#7b8186' },
  amber: { bg: '#271f0d', bd: '#574517', color: '#d8ad63', dot: '#c79a4f' },
  blue:  { bg: '#182337', bd: '#2e4368', color: '#9fbdf0', dot: '#5b87d6' },
  red:   { bg: '#271010', bd: '#5a2e2b', color: '#d18a84', dot: '#d18a84' },
};

function chipVariantFromEvidence(level: EvidenceLevel | undefined): ChipVariant {
  if (level === 'strong')   return 'green';
  if (level === 'moderate') return 'gray';
  if (level === 'basic')    return 'gray';
  if (level === 'weak')     return 'amber';
  return 'blue';
}

function Chip({ label, variant }: { label: string; variant: ChipVariant }) {
  const c = CHIP_CFG[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      background: c.bg, border: `1px solid ${c.bd}`, color: c.color,
      borderRadius: 999, padding: '7px 13px', fontSize: 13.5, fontWeight: 500,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function GroupLabel({ text, dotColor, infoKey }: { text: string; dotColor: string; infoKey: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9aa0a6' }}>
        {text}
      </span>
      {GAP_INFO[infoKey] && <InfoButton text={GAP_INFO[infoKey]} />}
    </div>
  );
}

export default function SkillGapCard({ extracted, missing, suggested, skillMetadata, skillEvidence }: Props) {
  const unique  = [...new Set(extracted)];
  const gaps    = classifyMissing([...new Set(missing)]);
  const suggest = [...new Set(suggested)];
  const evMap   = buildEvidenceMap(skillMetadata, skillEvidence);

  const weakEvSkills = unique.filter(s => evMap.get(s.toLowerCase()) === 'weak');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
        {[
          { dot: '#5cb085', label: 'Proven in experience' },
          { dot: '#7b8186', label: 'Mentioned' },
          { dot: '#c79a4f', label: 'Listed only — no proof' },
          { dot: '#5b87d6', label: 'Inferred from context' },
        ].map(({ dot, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13.5, color: '#9aa0a6' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0 }} />
            {label}
          </span>
        ))}
      </div>

      {/* Weak evidence warning */}
      {weakEvSkills.length > 0 && (
        <div style={{
          display: 'flex', gap: 11, alignItems: 'flex-start',
          background: '#33290f', border: '1px solid #574517',
          borderRadius: 13, padding: '14px 16px',
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#d8ad63" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M12 3L2 20h20L12 3z"/><path d="M12 10v4m0 3v.5"/>
          </svg>
          <div style={{ fontSize: 13.5, lineHeight: 1.5, color: '#d8c39a' }}>
            <b style={{ color: '#d8ad63', fontWeight: 700 }}>
              {weakEvSkills.slice(0, 3).join(', ')}{weakEvSkills.length > 3 ? ` +${weakEvSkills.length - 3} more` : ''}
            </b>
            {' '}— listed in skills but no implementation evidence found. Add project context with measurable outcomes.
          </div>
        </div>
      )}

      {/* Detected skills */}
      <div>
        <GroupLabel text={`Skill Evidence · ${unique.length} Detected`} dotColor="#5cb085" infoKey="extracted" />
        {unique.length === 0 ? (
          <p style={{ fontSize: 13.5, color: '#6c7378' }}>
            No skills detected. Add a dedicated Skills section to your resume.
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {unique.map(s => {
              const level   = evMap.get(s.toLowerCase());
              const variant = evMap.size > 0 ? chipVariantFromEvidence(level) : 'green';
              return <Chip key={s} label={s} variant={variant} />;
            })}
          </div>
        )}
      </div>

      {/* High-impact gaps */}
      {gaps.high.length > 0 && (
        <div>
          <GroupLabel text={`High Impact Gaps · ${gaps.high.length}`} dotColor="#d18a84" infoKey="high" />
          <p style={{ fontSize: 13, color: '#6c7378', marginBottom: 10, marginTop: -4 }}>
            Critical for QA roles — add these to stand out
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {gaps.high.map(s => <Chip key={s} label={`+ ${s}`} variant="red" />)}
          </div>
        </div>
      )}

      {/* Nice-to-have gaps */}
      {gaps.nice.length > 0 && (
        <div>
          <GroupLabel text="Nice to Have" dotColor="#c79a4f" infoKey="nice" />
          <p style={{ fontSize: 13, color: '#6c7378', marginBottom: 10, marginTop: -4 }}>
            Supportive skills that strengthen your QA profile
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {gaps.nice.map(s => <Chip key={s} label={`+ ${s}`} variant="amber" />)}
          </div>
        </div>
      )}

      {/* Add to profile */}
      {suggest.length > 0 && (
        <div>
          <GroupLabel text="Add to Profile" dotColor="#5b87d6" infoKey="suggested" />
          <p style={{ fontSize: 13, color: '#6c7378', marginBottom: 10, marginTop: -4 }}>
            Keywords that boost recruiter search visibility
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {suggest.map(s => <Chip key={s} label={s} variant="blue" />)}
          </div>
        </div>
      )}

      {gaps.high.length === 0 && gaps.nice.length === 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '16px 0', gap: 10, textAlign: 'center',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 14,
            background: '#18301f', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7fcca0" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#f3f4f5' }}>Strong QA Skill Coverage</p>
          <p style={{ fontSize: 13, color: '#9aa0a6', maxWidth: 280 }}>
            Your resume covers most key QA skills. Focus on deeper expertise to stand out.
          </p>
        </div>
      )}
    </div>
  );
}
