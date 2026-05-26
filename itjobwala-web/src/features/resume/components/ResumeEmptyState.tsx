'use client';

interface Props {
  onAnalyze: () => void;
  isParsing: boolean;
  hasResume: boolean;
}

export default function ResumeEmptyState({ onAnalyze, isParsing, hasResume }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 gap-5">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      </div>

      <div>
        <h3 className="text-[16px] font-bold text-gray-900">Resume Intelligence</h3>
        <p className="text-[13px] text-gray-500 mt-1 max-w-xs">
          {hasResume
            ? 'Get your ATS score, skill gap analysis, and personalized suggestions to stand out to recruiters.'
            : 'Upload your resume in your profile to unlock ATS scoring and career insights.'}
        </p>
      </div>

      <div className="flex flex-col gap-2 text-left w-full max-w-xs">
        {['ATS Score Analysis', 'Skill Gap Detection', 'Improvement Suggestions', 'Job Match Score'].map(f => (
          <div key={f} className="flex items-center gap-2 text-[13px] text-gray-600">
            <span className="w-4 h-4 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0">✓</span>
            {f}
          </div>
        ))}
      </div>

      {hasResume ? (
        <button
          onClick={onAnalyze}
          disabled={isParsing}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[14px] font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-60 shadow-sm"
        >
          {isParsing ? 'Analyzing…' : 'Analyze My Resume'}
        </button>
      ) : (
        <a
          href="/candidate/profile"
          className="px-6 py-2.5 bg-gray-900 text-white text-[14px] font-semibold rounded-xl hover:bg-gray-800 transition-all"
        >
          Upload Resume
        </a>
      )}
    </div>
  );
}
