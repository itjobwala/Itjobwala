'use client';

import type { ResumeInsights } from '../types/resume.types';

// QA signal skills — only these are shown in "Detected From"
const QA_SIGNAL = new Set([
  'selenium', 'selenium webdriver', 'cypress', 'playwright', 'appium', 'webdriverio',
  'testng', 'junit', 'cucumber', 'bdd', 'jmeter', 'gatling', 'k6', 'locust',
  'postman', 'rest assured', 'soapui', 'api testing', 'automation testing',
  'performance testing', 'mobile testing', 'regression testing', 'maven',
  'page object model', 'data-driven testing', 'testrail', 'zephyr', 'ci/cd',
]);

// Per-specialization sub-description
const SPEC_DESC: Record<string, string> = {
  'QA Automation Engineer':    'Selenium · Cypress · CI/CD Automation Specialist',
  'API Test Engineer':         'REST API · Postman · Integration Testing Expert',
  'Performance Test Engineer': 'JMeter · Load Testing · Scalability Analyst',
  'Mobile QA Engineer':        'Appium · Cross-platform Device Testing',
  'Manual QA Analyst':         'Functional · Regression · Exploratory Testing',
  'QA / Test Engineer':        'End-to-End Quality Assurance Professional',
  'Software Engineer':         'Software Quality & Testing Professional',
};

interface Props {
  insights:     ResumeInsights;
  onReanalyze:  () => void;
  onViewSkills: () => void;
}

export default function QAIdentityPanel({ insights, onReanalyze, onViewSkills }: Props) {
  const specLabel  = insights.domain_label || 'QA Professional';
  const specDesc   = SPEC_DESC[specLabel] ?? 'Quality Assurance Professional';
  const confidence = insights.domain_confidence ?? 0;
  const hasDetection = insights.detected_domain && insights.detected_domain !== 'general' && confidence >= 45;

  const keySkills = (insights.extracted_skills || [])
    .filter(s => [...QA_SIGNAL].some(k => s.toLowerCase().includes(k) || k.includes(s.toLowerCase())))
    .slice(0, 7);

  return (
    <>
      {/* Animation keyframes */}
      <style>{`
        @keyframes qa-radar {
          0%   { transform: scale(0.55); opacity: 0.55; }
          100% { transform: scale(2.4);  opacity: 0;    }
        }
        @keyframes qa-float {
          0%, 100% { transform: translateY(0px)  scale(1);    }
          50%       { transform: translateY(-7px) scale(1.02); }
        }
        @keyframes qa-glow-pulse {
          0%, 100% { box-shadow: 0 0 22px rgba(99,102,241,0.38), 0 0 60px rgba(99,102,241,0.1);  }
          50%       { box-shadow: 0 0 40px rgba(99,102,241,0.60), 0 0 90px rgba(6,182,212,0.14); }
        }
        @keyframes qa-scan {
          0%   { top: -20%; }
          100% { top: 120%; }
        }
        @keyframes qa-dot-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
        @keyframes qa-particle {
          0%, 100% { transform: translateY(0)   opacity: 0.5; }
          50%       { transform: translateY(-12px); opacity: 1; }
        }
      `}</style>

      <div
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: 'linear-gradient(155deg, #080d1c 0%, #0d1535 45%, #0b1a3b 75%, #080d1c 100%)',
          minHeight: '280px',
        }}
      >
        {/* Dot-grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(99,102,241,0.18) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            opacity: 0.6,
          }}
        />

        {/* Slow horizontal scan beam */}
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            height: '60px',
            background: 'linear-gradient(transparent, rgba(99,102,241,0.05), transparent)',
            animation: 'qa-scan 5s linear infinite',
          }}
        />

        {/* Ambient glow blobs */}
        <div
          className="absolute top-2 right-4 w-36 h-36 pointer-events-none rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
        <div
          className="absolute bottom-6 left-2 w-28 h-28 pointer-events-none rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)',
            filter: 'blur(16px)',
          }}
        />

        {/* Radar rings — centered horizontally, ~40% down */}
        <div
          className="absolute pointer-events-none"
          style={{ top: '38%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 100, height: 100,
                top: -50, left: -50,
                border: '1px solid rgba(99,102,241,0.22)',
                animation: `qa-radar 3.2s ease-out ${i * 1.06}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Floating particles */}
        {[
          { top: '12%', left: '14%', delay: '0s',    size: 3, color: 'rgba(99,102,241,0.4)'  },
          { top: '20%', left: '82%', delay: '0.8s',  size: 2, color: 'rgba(6,182,212,0.45)'  },
          { top: '72%', left: '10%', delay: '1.5s',  size: 2, color: 'rgba(139,92,246,0.4)'  },
          { top: '65%', left: '88%', delay: '0.4s',  size: 3, color: 'rgba(99,102,241,0.35)' },
          { top: '45%', left: '5%',  delay: '2.1s',  size: 2, color: 'rgba(6,182,212,0.3)'   },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              top: p.top, left: p.left,
              width: p.size, height: p.size,
              background: p.color,
              animation: `qa-float ${3 + i * 0.4}s ease-in-out ${p.delay} infinite`,
            }}
          />
        ))}

        {/* ── Main content ─────────────────────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center text-center px-5 pt-8 pb-7 gap-4">

          {/* Eyebrow label */}
          <p
            className="text-[9.5px] font-black uppercase tracking-[0.22em]"
            style={{ color: 'rgba(129,140,248,0.7)' }}
          >
            QA Specialization Detected
          </p>

          {/* Floating badge icon */}
          <div style={{ animation: 'qa-glow-pulse 3s ease-in-out infinite, qa-float 4.5s ease-in-out infinite' }}>
            <div
              className="relative w-[68px] h-[68px] rounded-[20px] flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.28) 0%, rgba(6,182,212,0.18) 100%)',
                border: '1px solid rgba(99,102,241,0.4)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#818cf8" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M2 17l10 5 10-5" stroke="#06b6d4" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M2 12l10 5 10-5" stroke="#a78bfa" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              {/* Ping indicator */}
              <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-50" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500" />
              </span>
            </div>
          </div>

          {/* Specialization identity */}
          <div className="space-y-1.5">
            <h2
              className="text-[22px] font-black leading-snug"
              style={{
                background: 'linear-gradient(135deg, #f0f4ff 0%, #c7d2fe 55%, #a5b4fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {specLabel}
            </h2>
            <p className="text-[11.5px] font-medium" style={{ color: 'rgba(148,163,184,0.9)' }}>
              {specDesc}
            </p>
          </div>

          {/* Confidence pill */}
          {hasDetection && (
            <div
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full"
              style={{
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.25)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background: '#34d399',
                  animation: 'qa-dot-blink 1.8s ease-in-out infinite',
                }}
              />
              <span className="text-[11px] font-bold" style={{ color: '#a5b4fc' }}>
                {confidence}% confidence match
              </span>
            </div>
          )}

          {/* Detected from skills */}
          {keySkills.length > 0 && (
            <div className="w-full">
              <p
                className="text-[9px] font-black uppercase tracking-[0.18em] mb-2"
                style={{ color: 'rgba(100,116,139,0.8)' }}
              >
                Detected From
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {keySkills.map(s => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg text-[10.5px] font-semibold capitalize"
                    style={{
                      background: 'rgba(99,102,241,0.1)',
                      border: '1px solid rgba(99,102,241,0.2)',
                      color: '#a5b4fc',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={onReanalyze}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11.5px] font-semibold transition-all active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(203,213,225,0.7)',
              }}
            >
              <span className="text-base leading-none">↺</span>
              <span>Re-analyze</span>
            </button>
            <button
              onClick={onViewSkills}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11.5px] font-bold transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(6,182,212,0.18))',
                border: '1px solid rgba(99,102,241,0.35)',
                color: '#c7d2fe',
              }}
            >
              <span>View Skills</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
