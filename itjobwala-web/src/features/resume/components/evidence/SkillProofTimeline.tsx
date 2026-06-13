'use client';

interface Props {
  skillTimeline: Record<string, string[]>;
}

const ROLE_COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f472b6', '#38bdf8', '#a78bfa'];

export default function SkillProofTimeline({ skillTimeline }: Props) {
  const entries = Object.entries(skillTimeline);

  if (entries.length === 0) {
    return (
      <div
        className="rounded-2xl p-4 text-center"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-[11px] text-slate-500">
          No skill-to-experience mapping found. Re-analyze to generate timeline.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 px-4 pt-3 pb-2">
        Skill Proof Timeline
      </p>

      <div className="px-4 pb-4 space-y-4">
        {entries.map(([role, skills], i) => {
          const color = ROLE_COLORS[i % ROLE_COLORS.length];
          const parts = role.split(' — ');
          const roleName = parts[0];
          const rest     = parts.slice(1).join(' — ');

          return (
            <div key={role} className="flex gap-3">
              {/* Timeline dot + line */}
              <div className="flex flex-col items-center">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                  style={{ background: color, boxShadow: `0 0 6px ${color}60` }}
                />
                {i < entries.length - 1 && (
                  <div className="w-px flex-1 mt-1" style={{ background: 'rgba(255,255,255,0.06)', minHeight: '20px' }} />
                )}
              </div>

              {/* Role content */}
              <div className="flex-1 pb-1">
                <p className="text-[11.5px] font-bold text-slate-200 leading-snug">{roleName}</p>
                {rest && <p className="text-[10px] text-slate-500 mb-1.5">{rest}</p>}

                <div className="flex flex-wrap gap-1">
                  {skills.slice(0, 8).map(skill => (
                    <span
                      key={skill}
                      className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded capitalize"
                      style={{
                        background: `${color}15`,
                        border:     `1px solid ${color}30`,
                        color,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                  {skills.length > 8 && (
                    <span className="text-[9.5px] text-slate-600 px-1 py-0.5">+{skills.length - 8} more</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
