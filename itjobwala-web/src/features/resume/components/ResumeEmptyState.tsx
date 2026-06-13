'use client';

interface Props {
  onAnalyze: () => void;
  isParsing: boolean;
  hasResume: boolean;
}

const QA_FEATURES = [
  'QA Readiness Score',
  'Automation Strength Analysis',
  'Skill Gap Intelligence',
  'Recruiter Visibility Score',
];

export default function ResumeEmptyState({ onAnalyze, isParsing, hasResume }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 gap-5">

      {/* Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ background: 'linear-gradient(135deg, #4f46e5, #06b6d4)' }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      </div>

      {/* Headline */}
      <div>
        <h3 className="text-lg font-bold text-heading">QA Career Intelligence</h3>
        <p className="text-caption text-muted mt-1.5 max-w-xs leading-relaxed">
          {hasResume
            ? 'Analyze your resume to get a QA readiness score, skill gap report, and recruiter-grade insights.'
            : 'Upload your resume in your profile to unlock QA hiring intelligence.'}
        </p>
      </div>

      {/* Feature list */}
      <div className="w-full max-w-xs space-y-2 text-left">
        {QA_FEATURES.map(f => (
          <div key={f} className="flex items-center gap-2.5">
            {/* Intentional indigo brand check icon */}
            <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="3.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <span className="text-caption text-body-secondary">{f}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      {hasResume ? (
        <button
          onClick={onAnalyze}
          disabled={isParsing}
          className="px-6 py-2.5 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-60 shadow-md"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
        >
          {isParsing ? 'Analyzing…' : 'Analyze My QA Profile'}
        </button>
      ) : (
        <a
          href="/candidate/profile"
          className="px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all"
        >
          Upload Resume
        </a>
      )}
    </div>
  );
}
