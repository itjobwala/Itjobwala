'use client';

const LPA_MIN = 0;
const LPA_MAX = 50;

interface Props {
  minLpa: number;
  maxLpa: number;
  onChange: (min: number, max: number) => void;
  error?: string;
  minAllowed?: number;
}

export default function SalaryRangeSlider({ minLpa, maxLpa, onChange, error, minAllowed = LPA_MIN }: Props) {
  const minPct = (minLpa / LPA_MAX) * 100;
  const maxPct = (maxLpa / LPA_MAX) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-bold text-gray-600">Salary range</span>
        <span className="text-[13px] font-bold text-primary">
          ₹{minLpa}L – ₹{maxLpa}L / yr
        </span>
      </div>

      <div className="relative h-5 flex items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-gray-200 pointer-events-none" />

        {/* Filled portion */}
        <div
          className="absolute h-1.5 rounded-full bg-primary pointer-events-none"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />

        {/* Min handle */}
        <input
          type="range"
          min={minAllowed}
          max={LPA_MAX}
          step={1}
          value={minLpa}
          onChange={e => onChange(Math.max(minAllowed, Math.min(Number(e.target.value), maxLpa - 1)), maxLpa)}
          className="salary-thumb absolute w-full"
          style={{ zIndex: minLpa >= maxLpa - 1 ? 5 : 3 }}
          aria-label="Minimum salary"
        />

        {/* Max handle */}
        <input
          type="range"
          min={minAllowed}
          max={LPA_MAX}
          step={1}
          value={maxLpa}
          onChange={e => onChange(minLpa, Math.max(Number(e.target.value), minLpa + 1))}
          className="salary-thumb absolute w-full"
          style={{ zIndex: 4 }}
          aria-label="Maximum salary"
        />
      </div>

      <div className="flex justify-between mt-2 text-[11px] text-gray-400 select-none">
        <span>{minAllowed > 0 ? `₹${minAllowed}L` : '₹0'}</span>
        <span>₹12L</span>
        <span>₹25L</span>
        <span>₹38L</span>
        <span>₹50L</span>
      </div>

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}
