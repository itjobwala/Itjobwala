'use client';

import type { ImprovementPriorities, PrioritySkill } from '../types/resume.types';
import InfoButton from './InfoButton';

const SECTION_INFO = {
  strengths:
    'Things recruiters will notice and trust about your profile. These are backed by evidence from your experience and project descriptions — not just listed in your Skills section.',
  weaknesses:
    'Skills you have listed but cannot prove. Recruiters are trained to spot this. A skill with no project context or outcome attached is treated as a claim, not a qualification.',
  suggestions:
    'The most impactful changes you can make right now. Ordered by how much each one will move your score and your visibility to recruiters.',
};

interface Props {
  improvement_priorities: ImprovementPriorities | null;
  weaknesses:             string[];
  suggestions:            string[];
}

const DIMENSION_LABEL: Record<string, string> = {
  automation_testing:  'Automation',
  api_testing:         'API Testing',
  framework_expertise: 'Frameworks',
  performance_testing: 'Performance',
  qa_experience:       'QA Experience',
  certifications:      'Certifications',
  bug_tracking:        'Bug Tracking',
  ci_cd_readiness:     'CI/CD',
};

function dimLabel(dimension: string): string {
  return DIMENSION_LABEL[dimension] ?? dimension.replace(/_/g, ' ');
}

interface PrioBadge { bg: string; color: string; label: string }

function getPrioBadge(level: 'high' | 'medium', score: number): PrioBadge {
  if (level === 'high' && score >= 70) return { bg: '#18301f', color: '#7fcca0', label: 'Very High' };
  if (level === 'high')                return { bg: '#1c2940', color: '#9fbdf0', label: 'High'      };
  return                                      { bg: '#33290f', color: '#d8ad63', label: 'Medium'    };
}

function RecCard({ item, level }: { item: PrioritySkill; level: 'high' | 'medium' }) {
  const badge = getPrioBadge(level, item.score);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      border: '1px solid #2a2e30', borderRadius: 13, padding: '16px 18px', marginBottom: 10,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#f3f4f5', textTransform: 'capitalize' }}>
          {item.skill}
        </div>
        {item.reason && (
          <div style={{ fontSize: 13.5, color: '#9aa0a6', marginTop: 4, lineHeight: 1.5 }}>
            {item.reason}
          </div>
        )}
        <span style={{
          display: 'inline-block', marginTop: 6,
          fontSize: 11, fontWeight: 600, padding: '3px 8px',
          background: '#202324', color: '#6c7378',
          borderRadius: 6,
        }}>
          {dimLabel(item.dimension)}
        </span>
      </div>
      <span style={{
        background: badge.bg, color: badge.color,
        borderRadius: 999, padding: '6px 13px',
        fontSize: 12.5, fontWeight: 700, flexShrink: 0,
      }}>
        {badge.label}
      </span>
    </div>
  );
}

export default function ResumeSuggestions({ improvement_priorities, weaknesses, suggestions }: Props) {
  const hasPriorities = !!(
    improvement_priorities?.high_priority?.length ||
    improvement_priorities?.medium_priority?.length
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.8px', textTransform: 'uppercase', color: '#6c7378' }}>
          What To Learn Next
        </p>
        <InfoButton text="Missing skills sorted by recruiter impact for your specialization. Priority order changes per candidate based on existing skills. Different QA specializations get different top recommendations." />
      </div>

      {/* High priority */}
      {improvement_priorities?.high_priority && improvement_priorities.high_priority.length > 0 && (
        <>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: '#d18a84', letterSpacing: '1px', textTransform: 'uppercase', margin: '18px 0 12px' }}>
            HIGH IMPACT — add these to stand out
          </p>
          {improvement_priorities.high_priority.map((p, i) => (
            <RecCard key={i} item={p} level="high" />
          ))}
        </>
      )}

      {/* Medium priority */}
      {improvement_priorities?.medium_priority && improvement_priorities.medium_priority.length > 0 && (
        <>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: '#d8ad63', letterSpacing: '1px', textTransform: 'uppercase', margin: '18px 0 12px' }}>
            MEDIUM — strengthens your profile
          </p>
          {improvement_priorities.medium_priority.map((p, i) => (
            <RecCard key={i} item={p} level="medium" />
          ))}
        </>
      )}

      {/* Weak evidence alerts */}
      {weaknesses.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '18px 0 12px' }}>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: '#d8ad63', letterSpacing: '1px', textTransform: 'uppercase' }}>
              WEAK EVIDENCE ALERTS
            </p>
            <InfoButton text={SECTION_INFO.weaknesses} />
          </div>
          <div style={{
            background: '#33290f', border: '1px solid #574517',
            borderRadius: 13, padding: '14px 16px', marginBottom: 12,
          }}>
            {weaknesses.map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: i < weaknesses.length - 1 ? 8 : 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d8ad63" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span style={{ fontSize: 13.5, color: '#d8c39a', lineHeight: 1.5 }}>{w}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Action items */}
      {suggestions.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '18px 0 12px' }}>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: '#9fbdf0', letterSpacing: '1px', textTransform: 'uppercase' }}>
              ACTION ITEMS
            </p>
            <InfoButton text={SECTION_INFO.suggestions} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {suggestions.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#1c2940', border: '1px solid #2e4368',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
                }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#9fbdf0" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
                <span style={{ fontSize: 13.5, color: '#f3f4f5', lineHeight: 1.6 }}>{s}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {!hasPriorities && weaknesses.length === 0 && suggestions.length === 0 && (
        <p style={{ fontSize: 13.5, color: '#6c7378', textAlign: 'center', padding: '24px 0' }}>
          Re-analyze your resume to see personalized QA insights.
        </p>
      )}
    </div>
  );
}
