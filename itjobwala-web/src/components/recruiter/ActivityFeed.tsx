'use client';

const TYPE_CONFIG: Record<string, { dotColor: string; icon: React.ReactNode }> = {
  application: {
    dotColor: 'bg-blue-500',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  interview: {
    dotColor: 'bg-amber-500',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  shortlist: {
    dotColor: 'bg-violet-500',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  message: {
    dotColor: 'bg-green-500',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  job_update: {
    dotColor: 'bg-gray-400',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  default: {
    dotColor: 'bg-blue-400',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
};

function relativeTime(iso: string): string {
  const ms   = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 2)   return 'Just now';
  if (mins < 60)  return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default function ActivityFeed() {
  const feed = [
    { id: '1', type: 'application', message: 'New application from Sarah Johnson', created_at: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: '2', type: 'shortlist', message: 'Shortlisted Sarah Johnson', created_at: new Date(Date.now() - 15 * 60000).toISOString() },
    { id: '3', type: 'interview', message: 'Scheduled interview with Sarah', created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
    { id: '4', type: 'application', message: 'New application from Mike Chen', created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
    { id: '5', type: 'job_update', message: 'Posted Senior Developer job', created_at: new Date(Date.now() - 24 * 3600000).toISOString() },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="mb-5">
        <h2 className="text-[15px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.3px' }}>
          Activity Feed
        </h2>
        <p className="text-[12px] text-gray-400 mt-0.5">Your recent recruiting activity</p>
      </div>

      <div className="relative">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gray-100" />

        <div className="space-y-4">
            {feed.map(item => {
              const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.default;
              return (
                <div key={item.id} className="flex gap-4 group">
                  <div className="relative z-10 shrink-0 mt-0.5">
                    <div className={`w-[30px] h-[30px] rounded-xl ${cfg.dotColor} flex items-center justify-center text-white`}>
                      {cfg.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <p className="text-[13px] font-semibold text-[#0f172a] leading-snug group-hover:text-primary transition-colors">
                      {item.message}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1 font-medium">{relativeTime(item.created_at)}</p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <button className="w-full text-[12px] font-bold text-primary hover:text-primary/80 transition-colors text-center">
          View all activity →
        </button>
      </div>
    </div>
  );
}
