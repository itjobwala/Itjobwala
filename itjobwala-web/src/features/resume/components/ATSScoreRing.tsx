'use client';

import { useEffect, useRef, useState } from 'react';
import { BAND_COLORS } from '../utils/scoreColor';
import type { BandColor } from '../types/resume.types';

interface Props {
  score:     number;
  label:     string;
  color:     BandColor;
  size?:     number;
  animate?:  boolean;
}

/**
 * Animated radial ATS score ring — SVG-based, no external chart lib needed.
 */
export default function ATSScoreRing({ score, label, color, size = 140, animate = true }: Props) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score);
  const frameRef = useRef<number | null>(null);
  const colors   = BAND_COLORS[color];

  const radius      = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress    = displayed / 100;
  const strokeDash  = circumference * progress;

  useEffect(() => {
    if (!animate) return;
    const duration = 1200;
    const start    = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const t       = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased   = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(eased * score));
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [score, animate]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={10}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={`${strokeDash} ${circumference}`}
            className={`${colors.ring} transition-all duration-300`}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold tabular-nums ${colors.text}`}>{displayed}</span>
          <span className="text-[11px] text-gray-400 font-medium mt-0.5">/100</span>
        </div>
      </div>
      <div className={`text-sm font-semibold px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}>
        {label}
      </div>
    </div>
  );
}
