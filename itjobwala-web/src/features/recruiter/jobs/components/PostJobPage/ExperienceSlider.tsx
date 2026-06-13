'use client';

import { PRIMARY } from '@/src/lib/constants';

interface Props {
  minVal: number;
  maxVal: number;
  onChange: (min: number, max: number) => void;
}

export default function ExperienceSlider({ minVal, maxVal, onChange }: Props) {
  const minPct = (minVal / 20) * 100;
  const maxPct = (maxVal / 20) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-bold text-body-secondary">Experience required</label>
        <span className="text-sm font-bold" style={{ color: PRIMARY }}>
          {minVal === 0 ? 'Any' : `${minVal} yrs`} – {maxVal === 20 ? '20+ yrs' : `${maxVal} yrs`}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-surface-mid pointer-events-none" />
        <div className="absolute h-1.5 rounded-full pointer-events-none"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%`, background: PRIMARY }} />
        <input type="range" min={0} max={20} step={1} value={minVal}
          onChange={e => onChange(Math.min(+e.target.value, maxVal - 1), maxVal)}
          className="salary-thumb absolute w-full"
          style={{ zIndex: minVal >= maxVal - 1 ? 5 : 3 }} />
        <input type="range" min={0} max={20} step={1} value={maxVal}
          onChange={e => onChange(minVal, Math.max(+e.target.value, minVal + 1))}
          className="salary-thumb absolute w-full" style={{ zIndex: 4 }} />
      </div>
      <div className="flex justify-between mt-2 text-micro text-subtle select-none">
        <span>0</span><span>5 yrs</span><span>10 yrs</span><span>15 yrs</span><span>20 yrs</span>
      </div>
    </div>
  );
}
