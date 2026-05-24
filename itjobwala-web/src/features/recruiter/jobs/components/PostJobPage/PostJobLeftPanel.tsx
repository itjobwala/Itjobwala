import { PRIMARY } from '@/src/lib/constants';
import { PERKS } from '../../schemas/postJob.schema';

export default function PostJobLeftPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between relative overflow-hidden shrink-0 w-[420px]"
      style={{ background: `linear-gradient(160deg, ${PRIMARY} 0%, #4338ca 100%)`, padding: '52px 44px' }}>
      <div className="absolute pointer-events-none" style={{ top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: -80, left: -40, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

      <div className="relative" style={{ zIndex: 1 }}>
        <div className="inline-flex items-center gap-2 rounded-full mb-8"
          style={{ background: 'rgba(255,255,255,0.12)', padding: '6px 14px', border: '1px solid rgba(255,255,255,0.18)' }}>
          <span className="inline-block rounded-full" style={{ width: 7, height: 7, background: '#4ade80' }} />
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>Free to post — no credit card needed</span>
        </div>

        <h2 className="font-extrabold text-white mb-4" style={{ fontSize: 34, lineHeight: 1.15, letterSpacing: -1.5 }}>
          Hire IT talent<br />the smart way.
        </h2>
        <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
          Post jobs and connect directly with skilled IT professionals — no middlemen, no noise.
        </p>

        <div>
          {PERKS.map(p => (
            <div key={p.title} className="flex gap-3.5 mb-5">
              <div className="shrink-0 flex items-center justify-center rounded-[10px]"
                style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.12)', fontSize: 17 }}>
                {p.icon}
              </div>
              <div>
                <div className="text-sm font-bold text-white mb-0.5">{p.title}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{p.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex gap-5 pt-6" style={{ zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        {[
          { v: '4,000+', l: 'Active IT candidates' },
          { v: '500+',   l: 'Companies hiring' },
          { v: '92%',    l: 'Response rate' },
        ].map(s => (
          <div key={s.l}>
            <div className="font-extrabold text-white" style={{ fontSize: 20, letterSpacing: -0.5 }}>{s.v}</div>
            <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
