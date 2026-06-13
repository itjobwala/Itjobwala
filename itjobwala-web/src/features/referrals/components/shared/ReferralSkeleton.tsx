export default function ReferralSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface rounded-3xl p-6 shadow-sm border border-token animate-pulse">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-hover" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-surface-hover rounded-full w-3/4" />
              <div className="h-3 bg-surface-hover rounded-full w-1/2" />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-surface-hover rounded-full w-full" />
            <div className="h-3 bg-surface-hover rounded-full w-5/6" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-surface-hover rounded-full w-16" />
            <div className="h-6 bg-surface-hover rounded-full w-16" />
          </div>
          <div className="mt-4 h-9 bg-surface-hover rounded-xl w-full" />
        </div>
      ))}
    </div>
  );
}
