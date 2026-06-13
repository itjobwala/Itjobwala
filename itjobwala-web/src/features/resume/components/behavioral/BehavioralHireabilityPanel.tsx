'use client';

import { useBehavioralHireabilityQuery } from '../../hooks';
import HireabilityScoreGauge    from './HireabilityScoreGauge';
import BehavioralDimensionsChart from './BehavioralDimensionsChart';
import BehavioralSignalsCard    from './BehavioralSignalsCard';

export default function BehavioralHireabilityPanel() {
  const { data, isLoading, isError } = useBehavioralHireabilityQuery();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
      >
        <p className="text-sm text-red-300">Could not load behavioral analysis.</p>
      </div>
    );
  }

  if (!data.parsed) {
    return (
      <div
        className="rounded-2xl p-6 text-center space-y-2"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <p className="text-[13px] font-semibold text-slate-400">No resume analyzed yet</p>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Parse your resume from the Profile page to unlock behavioral hireability analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <HireabilityScoreGauge
        score={data.hireability_score}
        band={data.hireability_band}
        summary={data.hireability_summary}
      />
      <BehavioralSignalsCard
        strongBehaviors={data.strong_behaviors}
        weakBehaviors={data.weak_behaviors}
        topFix={data.top_behavioral_fix}
      />
      <BehavioralDimensionsChart dimensions={data.dimensions} />
    </div>
  );
}
