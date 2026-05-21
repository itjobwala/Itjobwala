import Card from '@/src/components/ui/Card';

const PRIMARY = '#1557FF';

const PLAN = {
  name: 'Free',
  jobsUsed: 0,
  jobsTotal: 3,
  renewsIn: null,
  price: null,
};

export default function SubscriptionCard() {
  const jobPct = Math.round((PLAN.jobsUsed / PLAN.jobsTotal) * 100);

  return (
    <Card className="shadow-sm" overflow>
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
          <p className="text-[11px] text-gray-400 mt-1">{PLAN.jobsTotal - PLAN.jobsUsed} postings remaining on free plan</p>
        </div>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-primary/5 to-indigo-50 border border-primary/10 px-4 py-4 text-center">
        <p className="text-[13px] font-bold text-[#0f172a] mb-1">Upgrade coming soon</p>
        <p className="text-[11px] text-gray-500">Paid plans with higher limits will be available shortly.</p>
      </div>
    </Card>
  );
}
