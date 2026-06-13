'use client';

import { useAdminStatsQuery } from '../hooks/useAdmin';

const ACCENT = '#6366f1';

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
      <p className="text-3xl font-black text-white mb-1">{value.toLocaleString()}</p>
      {sub && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useAdminStatsQuery();

  if (isLoading) {
    return (
      <div>
        <h1 className="text-white font-bold text-2xl mb-6">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl h-24 animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div>
        <h1 className="text-white font-bold text-2xl mb-6">Dashboard</h1>
        <p className="text-red-400 text-sm">Failed to load stats. Check your connection.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-white font-bold text-2xl">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Platform overview — live data</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Candidates"   value={data.total_candidates}   sub={`+${data.new_candidates_7d} this week`} />
        <StatCard label="Recruiters"   value={data.total_recruiters}   sub={`+${data.new_recruiters_7d} this week`} />
        <StatCard label="Total Jobs"   value={data.total_jobs}         sub={`${data.active_jobs} active`} />
        <StatCard label="Applications" value={data.total_applications} />
        <StatCard label="Interviews"   value={data.total_interviews} />
        <StatCard label="Active Jobs"  value={data.active_jobs} />
        <StatCard label="New Candidates (7d)" value={data.new_candidates_7d} />
        <StatCard label="New Recruiters (7d)" value={data.new_recruiters_7d} />
      </div>

      <div className="rounded-2xl p-5" style={{ background: 'rgba(99,102,241,0.08)', border: `1px solid ${ACCENT}30` }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: ACCENT }}>Quick links</p>
        <div className="flex flex-wrap gap-3 text-sm">
          <a href="/admin/users?role=candidate" className="text-slate-300 hover:text-white transition-colors">Manage candidates →</a>
          <a href="/admin/users?role=recruiter" className="text-slate-300 hover:text-white transition-colors">Manage recruiters →</a>
          <a href="/admin/jobs" className="text-slate-300 hover:text-white transition-colors">Moderate jobs →</a>
        </div>
      </div>
    </div>
  );
}
