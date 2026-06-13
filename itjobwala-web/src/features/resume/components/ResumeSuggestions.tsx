'use client';

interface Props {
  strengths:   string[];
  weaknesses:  string[];
  suggestions: string[];
}

export default function ResumeSuggestions({ strengths, weaknesses, suggestions }: Props) {
  return (
    <div className="space-y-5">

      {strengths.length > 0 && (
        <Section
          title="Recruiter Strengths"
          subtitle="What hiring managers will notice"
          items={strengths}
          variant="strength"
        />
      )}

      {weaknesses.length > 0 && (
        <Section
          title="Weak Points"
          subtitle="Address these before applying"
          items={weaknesses}
          variant="weakness"
        />
      )}

      {suggestions.length > 0 && (
        <Section
          title="Action Items"
          subtitle="Improvements to boost your QA hiring score"
          items={suggestions}
          variant="action"
        />
      )}

      {strengths.length === 0 && weaknesses.length === 0 && suggestions.length === 0 && (
        <p className="text-sm text-subtle text-center py-6">
          Re-analyze your resume to see personalized QA insights.
        </p>
      )}
    </div>
  );
}

// ── Section component ─────────────────────────────────────────────────────────

type Variant = 'strength' | 'weakness' | 'action';

// Section header and icon border colors are intentional semantic indicators
const CONFIG: Record<Variant, {
  headerColor: string;
  iconBg: string;
  icon: React.ReactNode;
  itemColor: string;
}> = {
  strength: {
    headerColor: 'text-emerald-700',
    iconBg: 'bg-emerald-50 border border-emerald-200',
    icon: <CheckIcon />,
    itemColor: 'text-body',
  },
  weakness: {
    headerColor: 'text-red-600',
    iconBg: 'bg-red-50 border border-red-200',
    icon: <AlertIcon />,
    itemColor: 'text-body',
  },
  action: {
    headerColor: 'text-indigo-700',
    iconBg: 'bg-indigo-50 border border-indigo-200',
    icon: <ArrowIcon />,
    itemColor: 'text-body',
  },
};

function Section({
  title, subtitle, items, variant,
}: {
  title:    string;
  subtitle: string;
  items:    string[];
  variant:  Variant;
}) {
  const cfg = CONFIG[variant];

  return (
    <div>
      <div className="mb-2.5">
        <h4 className={`text-caption font-bold uppercase tracking-[0.1em] ${cfg.headerColor}`}>
          {title}
        </h4>
        <p className="text-[10.5px] text-subtle mt-0.5">{subtitle}</p>
      </div>

      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 items-start">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-px ${cfg.iconBg}`}>
              {cfg.icon}
            </div>
            <span className={`text-sm leading-relaxed ${cfg.itemColor}`}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Icons — intentional semantic status stroke colors ─────────────────────────

function CheckIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3">
      <line x1="12" y1="5" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="3">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}
