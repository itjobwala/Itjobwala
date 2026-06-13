'use client';

const STEPS = [
  { label: 'Downloading resume…',    delay: 0    },
  { label: 'Extracting text…',       delay: 800  },
  { label: 'Parsing sections…',      delay: 1800 },
  { label: 'Detecting skills…',      delay: 2600 },
  { label: 'Calculating ATS score…', delay: 3400 },
];

import { useEffect, useState } from 'react';

export default function ResumeParsingLoader() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((s, i) =>
      setTimeout(() => setStep(i), s.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-6">
      {/* Animated brain icon */}
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26C17.81 13.47 19 11.38 19 9c0-3.87-3.13-7-7-7z"/>
            <path d="M9 21h6M10 17v4M14 17v4"/>
          </svg>
        </div>
        <div className="absolute inset-0 rounded-2xl bg-blue-400/30 animate-ping" />
      </div>

      <div className="text-center">
        <p className="text-md font-semibold text-heading">Analyzing Your Resume</p>
        <p className="text-sm text-muted mt-1">Smart analysis in progress…</p>
      </div>

      {/* Steps */}
      <div className="w-full max-w-xs space-y-2">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-2.5 text-sm transition-all duration-300 ${
              i <= step ? 'text-heading' : 'text-gray-300'
            }`}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold transition-all duration-300 ${
              i < step   ? 'bg-emerald-500 text-white' :
              i === step ? 'bg-blue-500 text-white animate-pulse' :
              'bg-surface-hover text-subtle'
            }`}>
              {i < step ? '✓' : i + 1}
            </span>
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
