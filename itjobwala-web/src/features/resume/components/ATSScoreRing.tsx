'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { BandColor } from '../types/resume.types';

interface Props {
  score:    number;
  label:    string;
  color:    BandColor;
  size?:    number;
  animate?: boolean;
}

// Score-band gradient palettes
const GRADIENTS: Record<BandColor, { a: string; b: string; c: string; glow: string }> = {
  emerald: { a: '#6366f1', b: '#06b6d4', c: '#10b981', glow: 'rgba(99,102,241,0.45)' },
  green:   { a: '#4f46e5', b: '#06b6d4', c: '#10b981', glow: 'rgba(79,70,229,0.4)'  },
  blue:    { a: '#3b82f6', b: '#6366f1', c: '#8b5cf6', glow: 'rgba(59,130,246,0.4)' },
  amber:   { a: '#f59e0b', b: '#f97316', c: '#ef4444', glow: 'rgba(245,158,11,0.4)' },
  orange:  { a: '#f97316', b: '#ef4444', c: '#dc2626', glow: 'rgba(249,115,22,0.4)' },
  red:     { a: '#ef4444', b: '#f87171', c: '#fca5a5', glow: 'rgba(239,68,68,0.35)' },
};

const READINESS: Record<BandColor, string> = {
  emerald: 'Elite QA Profile',
  green:   'QA Ready',
  blue:    'Good Standing',
  amber:   'Developing',
  orange:  'Just Starting',
  red:     'Very Early Stage',
};

export default function ATSScoreRing({ score, label, color, size = 160, animate = true }: Props) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score);
  const frameRef  = useRef<number | null>(null);
  const uid       = useId().replace(/:/g, '');
  const grad      = GRADIENTS[color];
  const readiness = READINESS[color];

  const strokeW   = 11;
  const radius    = (size - strokeW * 2) / 2;
  const circ      = 2 * Math.PI * radius;
  const dash      = circ * (displayed / 100);
  const gap       = circ - dash;

  useEffect(() => {
    if (!animate) return;
    const duration = 1400;
    const start    = performance.now();

    const tick = (now: number) => {
      const t     = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplayed(Math.round(eased * score));
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [score, animate]);

  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Ambient glow behind ring */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: strokeW * 1.5,
            background: `radial-gradient(circle, ${grad.glow} 0%, transparent 70%)`,
            filter: 'blur(8px)',
          }}
        />

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90 relative z-10"
        >
          <defs>
            {/* Progress stroke gradient */}
            <linearGradient id={`g-${uid}`} x1="0" y1="0" x2={size} y2={size} gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor={grad.a} />
              <stop offset="50%"  stopColor={grad.b} />
              <stop offset="100%" stopColor={grad.c} />
            </linearGradient>
          </defs>

          {/* Track ring */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="rgba(148,163,184,0.15)"
            strokeWidth={strokeW}
          />

          {/* Progress arc */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={`url(#g-${uid})`}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            style={{ filter: `drop-shadow(0 0 7px ${grad.glow})` }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-0.5">
          <span
            className="text-[30px] font-black tabular-nums leading-none"
            style={{
              background: `linear-gradient(135deg, ${grad.a}, ${grad.c})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {displayed}%
          </span>
          <span className="text-[9px] text-subtle font-bold uppercase tracking-[0.12em]">
            QA MATCH
          </span>
        </div>
      </div>

      {/* Band label pill */}
      <div
        className="mt-2 px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
        style={{
          background: `linear-gradient(135deg, ${grad.a}22, ${grad.c}22)`,
          border: `1px solid ${grad.a}44`,
          color: grad.a,
        }}
      >
        {readiness}
      </div>
    </div>
  );
}
