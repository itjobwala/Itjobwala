import type { ReferralStatus, ReferralTimelineEntry } from '../../types/referral.types';
import { TIMELINE_STEPS, getStatusConfig } from '../../utils/referralStatus';

interface Props {
  currentStatus: ReferralStatus;
  timeline:      ReferralTimelineEntry[];
}

export default function ReferralTimeline({ currentStatus, timeline }: Props) {
  const isRejected = currentStatus === 'rejected';
  const steps      = isRejected ? [...TIMELINE_STEPS.slice(0, 1), 'rejected' as ReferralStatus] : TIMELINE_STEPS;

  const completedSet = new Set(timeline.map(t => t.status));
  const currentIdx   = steps.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, i) => {
        const done    = completedSet.has(step);
        const active  = step === currentStatus;
        const cfg     = getStatusConfig(step as ReferralStatus);
        const isLast  = i === steps.length - 1;

        return (
          <div key={step} className="flex items-center flex-1 min-w-0">
            {/* Step node */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all ${
                  done && !active
                    ? 'bg-primary border-primary text-white'
                    : active
                    ? `${cfg.bg} ${cfg.color} border-current shadow-md scale-110`
                    : 'bg-surface border-token text-subtle'
                }`}
              >
                {done && !active ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span className={`text-[9px] font-semibold text-center whitespace-nowrap ${active ? cfg.color : done ? 'text-primary' : 'text-subtle'}`}>
                {cfg.label}
              </span>
            </div>

            {/* Connector */}
            {!isLast && (
              <div className={`flex-1 h-[2px] mx-1 rounded-full transition-all ${
                i < currentIdx ? 'bg-primary' : 'bg-surface-mid'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
