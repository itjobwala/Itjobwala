'use client';

interface Props {
  extracted:  string[];
  missing:    string[];
  suggested:  string[];
}

// High-impact QA skills — critical for recruiter visibility
const HIGH_IMPACT = new Set([
  'selenium', 'selenium webdriver', 'cypress', 'playwright', 'appium', 'webdriverio',
  'testng', 'junit', 'cucumber', 'bdd', 'jmeter', 'gatling', 'k6',
  'api testing', 'rest assured', 'automation testing', 'test automation',
  'performance testing', 'mobile testing',
]);

// Supporting QA skills — nice to have
const NICE_TO_HAVE = new Set([
  'sql', 'jira', 'ci/cd', 'docker', 'maven', 'gradle', 'git',
  'testrail', 'zephyr', 'postman', 'soapui', 'jenkins', 'github actions',
  'page object model', 'data-driven testing', 'cross-browser testing',
]);

function classifyMissing(skills: string[]) {
  const high: string[] = [];
  const nice: string[] = [];
  const other: string[] = [];

  for (const s of skills) {
    const lower = s.toLowerCase();
    if ([...HIGH_IMPACT].some(kw => lower.includes(kw) || kw.includes(lower))) {
      high.push(s);
    } else if ([...NICE_TO_HAVE].some(kw => lower.includes(kw) || kw.includes(lower))) {
      nice.push(s);
    } else {
      other.push(s);
    }
  }
  return { high, nice, other };
}

export default function SkillGapCard({ extracted, missing, suggested }: Props) {
  const unique  = [...new Set(extracted)];
  const gaps    = classifyMissing([...new Set(missing)]);
  const suggest = [...new Set(suggested)];

  return (
    <div className="space-y-5">

      {/* Detected skills */}
      <div>
        <GroupLabel text={`Detected in Resume · ${unique.length} skills`} color="emerald" />
        {unique.length === 0 ? (
          <p className="text-sm text-subtle mt-2">
            No skills detected. Add a dedicated Skills section to your resume.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {unique.map(s => (
              <Chip key={s} label={s} variant="emerald" />
            ))}
          </div>
        )}
      </div>

      {/* High-impact gaps */}
      {gaps.high.length > 0 && (
        <div>
          <GroupLabel text={`High Impact Gaps · ${gaps.high.length}`} color="red" />
          <p className="text-[10.5px] text-subtle mt-0.5 mb-2">
            Critical for QA roles — add these to stand out
          </p>
          <div className="flex flex-wrap gap-1.5">
            {gaps.high.map(s => (
              <Chip key={s} label={`+ ${s}`} variant="red" />
            ))}
          </div>
        </div>
      )}

      {/* Nice to have gaps */}
      {gaps.nice.length > 0 && (
        <div>
          <GroupLabel text="Nice to Have" color="amber" />
          <p className="text-[10.5px] text-subtle mt-0.5 mb-2">
            Supportive skills that strengthen your QA profile
          </p>
          <div className="flex flex-wrap gap-1.5">
            {gaps.nice.map(s => (
              <Chip key={s} label={`+ ${s}`} variant="amber" />
            ))}
          </div>
        </div>
      )}

      {/* Add to profile */}
      {suggest.length > 0 && (
        <div>
          <GroupLabel text="Add to Your Profile" color="indigo" />
          <p className="text-[10.5px] text-subtle mt-0.5 mb-2">
            Keywords that boost recruiter search visibility
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggest.map(s => (
              <Chip key={s} label={s} variant="indigo" />
            ))}
          </div>
        </div>
      )}

      {gaps.high.length === 0 && gaps.nice.length === 0 && (
        <div className="flex flex-col items-center py-4 gap-2 text-center">
          {/* Intentional emerald success state */}
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-heading">Strong QA Skill Coverage</p>
          <p className="text-caption text-subtle max-w-xs">
            Your resume covers most key QA skills. Focus on deeper expertise to stand out.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Small components ──────────────────────────────────────────────────────────

// Chip colors are intentional semantic skill-gap indicators
type ChipVariant = 'emerald' | 'red' | 'amber' | 'indigo';

const CHIP_STYLES: Record<ChipVariant, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  red:     'bg-red-50 text-red-600 border border-red-200',
  amber:   'bg-amber-50 text-amber-700 border border-amber-200',
  indigo:  'bg-indigo-50 text-indigo-700 border border-indigo-200',
};

function Chip({ label, variant }: { label: string; variant: ChipVariant }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-caption font-semibold capitalize ${CHIP_STYLES[variant]}`}>
      {label}
    </span>
  );
}

type LabelColor = 'emerald' | 'red' | 'amber' | 'indigo';

const LABEL_STYLES: Record<LabelColor, string> = {
  emerald: 'text-emerald-600',
  red:     'text-red-500',
  amber:   'text-amber-600',
  indigo:  'text-indigo-600',
};

function GroupLabel({ text, color }: { text: string; color: LabelColor }) {
  return (
    <h4 className={`text-micro font-bold uppercase tracking-[0.1em] ${LABEL_STYLES[color]}`}>
      {text}
    </h4>
  );
}
