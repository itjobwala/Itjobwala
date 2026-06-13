function Pulse({ className }: { className: string }) {
  return <div className={`bg-surface-mid rounded-full animate-pulse ${className}`} />;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-surface rounded-2xl border border-token p-6 sm:p-8 animate-pulse ${className}`}>{children}</div>;
}

export default function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
      {/* Left */}
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="bg-surface rounded-2xl border border-token overflow-hidden animate-pulse">
          <div className="h-28 bg-surface-hover" />
          <div className="px-8 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-surface-mid border-4 border-surface" />
              <div className="flex gap-2 mb-1">
                <div className="h-9 w-28 bg-surface-mid rounded-xl" />
                <div className="h-9 w-32 bg-surface-mid rounded-xl" />
              </div>
            </div>
            <Pulse className="w-44 h-5 mb-2" />
            <Pulse className="w-32 h-4 mb-5" />
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[1,2,3,4].map(i => <Pulse key={i} className="h-3" />)}
            </div>
            <div className="flex gap-2">
              <div className="h-7 w-24 bg-surface-mid rounded-lg" />
              <div className="h-7 w-20 bg-surface-mid rounded-lg" />
            </div>
          </div>
        </div>

        {/* About */}
        <Card>
          <Pulse className="w-16 h-4 mb-4" />
          <div className="h-3 bg-surface-mid rounded-full w-full mb-2.5 animate-pulse" />
          <div className="h-3 bg-surface-mid rounded-full w-11/12 mb-2.5 animate-pulse" />
          <div className="h-3 bg-surface-mid rounded-full w-5/6 mb-2.5 animate-pulse" />
          <div className="h-3 bg-surface-mid rounded-full w-4/5 animate-pulse" />
        </Card>

        {/* Skills */}
        <Card>
          <Pulse className="w-16 h-4 mb-4" />
          <div className="flex flex-wrap gap-2">
            {['w-20', 'w-16', 'w-24', 'w-16', 'w-20', 'w-24', 'w-16'].map((w, i) => (
              <div key={i} className={`h-9 bg-surface-mid rounded-xl ${w}`} />
            ))}
          </div>
        </Card>

        {/* Experience */}
        <Card>
          <Pulse className="w-24 h-4 mb-6" />
          {[1,2].map(i => (
            <div key={i} className="flex gap-4 mb-5">
              <div className="w-10 h-10 bg-surface-mid rounded-xl shrink-0" />
              <div className="flex-1">
                <Pulse className="w-32 h-3.5 mb-2" />
                <Pulse className="w-24 h-3 mb-3" />
                <Pulse className="w-full h-2.5 mb-1.5" />
                <Pulse className="w-5/6 h-2.5" />
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Right */}
      <div className="flex flex-col gap-5">
        {[1, 2, 3].map(n => (
          <div key={n} className="bg-surface rounded-2xl border border-token p-5 animate-pulse">
            <Pulse className="w-28 h-3.5 mb-4" />
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-surface-mid rounded-lg shrink-0" />
                <div className="flex-1">
                  <Pulse className="w-3/4 h-2.5 mb-1.5" />
                  <Pulse className="w-1/2 h-2" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
