'use client';

import { useState } from 'react';
import { useAdminStatsQuery, useSignupAnalyticsQuery, useJobsAnalyticsQuery, useAppAnalyticsQuery } from '../hooks/useAdmin';
import type { DailySignupPoint, DailyJobPoint, DailyAppPoint } from '../types/admin.types';

const ACCENT = '#6366f1';

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
      <p className="text-3xl font-black text-white mb-1">{Number(value).toLocaleString()}</p>
      {sub && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{sub}</p>}
    </div>
  );
}

// Lightweight CSS bar chart — no external dependencies
function BarChart({
  data,
  color = ACCENT,
  height = 52,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, minWidth: 2 }} title={`${d.label}: ${d.value}`}>
          <div style={{
            height: Math.max(d.value > 0 ? 2 : 0, Math.round((d.value / max) * height)),
            background: color,
            borderRadius: '2px 2px 0 0',
          }} />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse rounded" style={{ height: 52, background: 'rgba(255,255,255,0.04)' }} />
  );
}

function ChartCard({
  title,
  total,
  sub,
  children,
}: {
  title: string;
  total?: number;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{title}</p>
        {total !== undefined && (
          <p className="text-xl font-black text-white">{total.toLocaleString()}</p>
        )}
      </div>
      {sub && <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>{sub}</p>}
      {children}
    </div>
  );
}

type Range = '7d' | '30d' | '90d';

function SignupCharts({ range }: { range: Range }) {
  const { data, isLoading } = useSignupAnalyticsQuery(range);
  if (isLoading) return <ChartSkeleton />;
  if (!data) return null;

  const totalC = data.series.reduce((s, p) => s + p.candidates, 0);
  const totalR = data.series.reduce((s, p) => s + p.recruiters, 0);

  const candData = data.series.map((p: DailySignupPoint) => ({ label: p.date, value: p.candidates }));
  const recData  = data.series.map((p: DailySignupPoint) => ({ label: p.date, value: p.recruiters }));

  return (
    <ChartCard title="New Signups" total={totalC + totalR} sub={`${totalC} candidates · ${totalR} recruiters`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <p style={{ fontSize: 10, color: '#a5b4fc', marginBottom: 6, fontWeight: 600 }}>Candidates</p>
          <BarChart data={candData} color="#6366f1" />
        </div>
        <div>
          <p style={{ fontSize: 10, color: '#d8b4fe', marginBottom: 6, fontWeight: 600 }}>Recruiters</p>
          <BarChart data={recData} color="#a855f7" />
        </div>
      </div>
    </ChartCard>
  );
}

function JobsChart({ range }: { range: Range }) {
  const { data, isLoading } = useJobsAnalyticsQuery(range);
  if (isLoading) return <ChartSkeleton />;
  if (!data) return null;

  const total   = data.series.reduce((s, p) => s + p.new_jobs, 0);
  const chartData = data.series.map((p: DailyJobPoint) => ({ label: p.date, value: p.new_jobs }));

  const statusColors: Record<string, string> = {
    active: '#22c55e', draft: '#94a3b8', pending: '#f59e0b',
    removed: '#ef4444', closed: '#474d6a', needs_changes: '#f97316',
  };

  return (
    <ChartCard title="New Jobs" total={total}>
      <BarChart data={chartData} color="#22c55e" />
      {Object.keys(data.by_status).length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: '6px 12px' }}>
          {Object.entries(data.by_status).map(([status, count]) => (
            <span key={status} style={{ fontSize: 11, color: statusColors[status] ?? '#94a3b8' }}>
              {status}: {count}
            </span>
          ))}
        </div>
      )}
    </ChartCard>
  );
}

function ApplicationsChart({ range }: { range: Range }) {
  const { data, isLoading } = useAppAnalyticsQuery(range);
  if (isLoading) return <ChartSkeleton />;
  if (!data) return null;

  const total   = data.series.reduce((s, p) => s + p.applications, 0);
  const chartData = data.series.map((p: DailyAppPoint) => ({ label: p.date, value: p.applications }));

  const funnelColors: Record<string, string> = {
    applied: '#6366f1', shortlisted: '#f59e0b', interview: '#3b82f6',
    hired: '#22c55e', rejected: '#ef4444',
  };

  return (
    <ChartCard title="Applications" total={total}>
      <BarChart data={chartData} color="#3b82f6" />
      {Object.keys(data.funnel).length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: '6px 12px' }}>
          {Object.entries(data.funnel).map(([status, count]) => (
            <span key={status} style={{ fontSize: 11, color: funnelColors[status] ?? '#94a3b8' }}>
              {status}: {count}
            </span>
          ))}
        </div>
      )}
    </ChartCard>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useAdminStatsQuery();
  const [range, setRange] = useState<Range>('30d');

  if (isLoading) {
    return (
      <div>
        <h1 className="text-h1 text-white mb-6">Dashboard</h1>
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
        <h1 className="text-h1 text-white mb-6">Dashboard</h1>
        <p className="text-red-400 text-sm">Failed to load stats. Check your connection.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h1 text-white">Dashboard</h1>
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

      {/* Quick links */}
      <div className="rounded-2xl p-5 mb-8" style={{ background: 'rgba(99,102,241,0.08)', border: `1px solid ${ACCENT}30` }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: ACCENT }}>Quick links</p>
        <div className="flex flex-wrap gap-3 text-sm">
          <a href="/admin/users?role=candidate" className="text-slate-300 hover:text-white transition-colors">Manage candidates →</a>
          <a href="/admin/users?role=recruiter" className="text-slate-300 hover:text-white transition-colors">Manage recruiters →</a>
          <a href="/admin/jobs" className="text-slate-300 hover:text-white transition-colors">Moderate jobs →</a>
        </div>
      </div>

      {/* Analytics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-h6 text-white">Analytics</h2>
            <p className="text-slate-400 text-xs mt-0.5">Daily activity trends</p>
          </div>
          <div className="flex gap-1.5">
            {(['7d', '30d', '90d'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className="px-3 py-1 rounded-lg text-xs font-semibold border-none cursor-pointer transition-all"
                style={range === r
                  ? { background: ACCENT, color: '#fff' }
                  : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)' }
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SignupCharts range={range} />
          <JobsChart range={range} />
          <ApplicationsChart range={range} />
        </div>
      </div>
    </div>
  );
}
