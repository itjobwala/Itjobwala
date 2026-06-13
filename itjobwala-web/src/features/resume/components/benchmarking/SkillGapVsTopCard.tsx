'use client';

interface Props {
  skills: string[];
}

export default function SkillGapVsTopCard({ skills }: Props) {
  if (skills.length === 0) return null;

  return (
    <div
      className="rounded-2xl px-4 py-4 space-y-3"
      style={{
        background: 'rgba(245,158,11,0.05)',
        border: '1px solid rgba(245,158,11,0.15)',
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(245,158,11,0.15)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div>
          <p className="text-[11px] font-black text-amber-300">Skills Top Performers Have</p>
          <p className="text-[9.5px] text-slate-500">Seen in top-quartile profiles — not yet on yours</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <div
            key={skill}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
            style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
            }}
          >
            <span
              className="text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shrink-0"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}
            >
              {i + 1}
            </span>
            <span className="text-[11px] font-semibold text-amber-200">{skill}</span>
          </div>
        ))}
      </div>

      <p className="text-[10.5px] text-slate-500 leading-relaxed">
        Adding these to your resume — with project evidence — closes the skill gap between you and the top quartile.
      </p>
    </div>
  );
}
