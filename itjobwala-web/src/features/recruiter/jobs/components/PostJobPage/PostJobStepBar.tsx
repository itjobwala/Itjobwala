import { PRIMARY } from '@/src/lib/constants';
import { STEPS } from '../../schemas/postJob.schema';

export default function PostJobStepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8 justify-center">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: done ? PRIMARY : active ? '#fff' : '#f3f4f6',
                  border: `2px solid ${done || active ? PRIMARY : '#e5e7eb'}`,
                  boxShadow: active ? `0 0 0 3px ${PRIMARY}18` : 'none',
                }}>
                {done
                  ? <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                  : <span className="text-xs font-bold" style={{ color: active ? PRIMARY : '#9ca3af' }}>{i + 1}</span>
                }
              </div>
              <span className="text-[11px] whitespace-nowrap"
                style={{ fontWeight: active ? 700 : 500, color: active ? PRIMARY : done ? '#374151' : '#9ca3af' }}>
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="h-[2px] mb-4 transition-colors duration-300"
                style={{ width: 48, background: i < current ? PRIMARY : '#e5e7eb', margin: '0 10px 16px' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
