import Link from 'next/link';

const PRIMARY = '#1557FF';

const PLAN = {
  name: 'Pro',
  jobsUsed: 3,
  jobsTotal: 10,
  candidateViews: 120,
  candidateViewsTotal: 500,
  renewsIn: '22 days',
  price: '₹2,999/mo',
};

export default function SubscriptionCard() {
  const jobPct  = Math.round((PLAN.jobsUsed / PLAN.jobsTotal) * 100);
  const viewPct = Math.round((PLAN.candidateViews / PLAN.candidateViewsTotal) * 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.3px' }}>
          Subscription
        </h2>
        <span
          className="text-[11px] font-extrabold px-2.5 py-1 rounded-full text-white"
          style={{ background: PRIMARY }}
        >
          {PLAN.name}
        </span>
      </div>

      {/* Usage bars */}
      <div className="space-y-4 mb-5">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-semibold text-gray-600">Job Postings</span>
            <span className="text-[12px] font-bold text-[#0f172a]">
              {PLAN.jobsUsed} / {PLAN.jobsTotal}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${jobPct}%`, background: PRIMARY }}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">{PLAN.jobsTotal - PLAN.jobsUsed} postings remaining</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-semibold text-gray-600">Candidate Views</span>
            <span className="text-[12px] font-bold text-[#0f172a]">
              {PLAN.candidateViews} / {PLAN.candidateViewsTotal}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-700"
              style={{ width: `${viewPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Plan details */}
      <div className="rounded-xl bg-gray-50 px-3.5 py-3 mb-4 flex items-center justify-between">
        <div>
          <p className="text-[12px] font-semibold text-gray-600">{PLAN.price}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Renews in {PLAN.renewsIn}</p>
        </div>
        <Link
          href="/recruiter/billing"
          className="text-[12px] font-bold text-gray-500 hover:text-[#0f172a] transition-colors"
        >
          Manage →
        </Link>
      </div>

      {/* Upgrade CTA */}
      <Link
        href="/recruiter/billing?upgrade=true"
        className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-[13px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
        style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #4338ca 100%)`, boxShadow: `0 4px 14px ${PRIMARY}33` }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
        Upgrade to Enterprise
      </Link>
    </div>
  );
}
