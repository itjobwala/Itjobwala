'use client';

import type { ResumeInsights } from '../../types/resume.types';
import EvidenceStrengthCard  from './EvidenceStrengthCard';
import SkillEvidenceMatrix   from './SkillEvidenceMatrix';
import WeakEvidenceWarnings  from './WeakEvidenceWarnings';
import ExperienceDepthCard   from './ExperienceDepthCard';
import SkillProofTimeline    from './SkillProofTimeline';
import RecruiterTrustPanel   from './RecruiterTrustPanel';

interface Props {
  insights: ResumeInsights;
}

export default function EvidenceInsightsPanel({ insights }: Props) {
  const profile    = insights.evidence_profile;
  const skillEv    = insights.skill_evidence   ?? [];
  const weakSkills = insights.weak_evidence_skills ?? [];
  const timeline   = insights.skill_timeline   ?? {};

  // Older parsed resumes won't have evidence data yet
  if (!profile) {
    return (
      <div
        className="rounded-2xl p-6 text-center space-y-3"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <p className="text-[12.5px] font-bold text-slate-300">Evidence analysis not yet generated</p>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
            Re-analyze your resume to unlock evidence-backed intelligence — proof sources, recruiter trust score, and skill verification.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 1. Recruiter trust + evidence strength */}
      <EvidenceStrengthCard profile={profile} />

      {/* 2. Recruiter perspective simulation */}
      <RecruiterTrustPanel profile={profile} />

      {/* 3. Weak evidence warnings */}
      <WeakEvidenceWarnings
        skillEvidence={skillEv}
        weakEvidenceSkills={weakSkills}
      />

      {/* 4. Skill evidence matrix */}
      {skillEv.length > 0 && (
        <SkillEvidenceMatrix skillEvidence={skillEv} />
      )}

      {/* 5. Experience depth analysis */}
      <ExperienceDepthCard profile={profile} />

      {/* 6. Skill proof timeline */}
      {Object.keys(timeline).length > 0 && (
        <SkillProofTimeline skillTimeline={timeline} />
      )}
    </div>
  );
}
