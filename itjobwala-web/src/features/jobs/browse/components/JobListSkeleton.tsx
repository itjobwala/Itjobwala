function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-token p-5 sm:p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-surface-mid shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="h-3 w-16 bg-surface-mid rounded-full mb-2" />
              <div className="h-4 w-48 bg-surface-mid rounded-full mb-1.5" />
              <div className="h-3 w-24 bg-surface-mid rounded-full" />
            </div>
            <div className="w-8 h-8 rounded-full bg-surface-mid shrink-0" />
          </div>
          <div className="flex gap-4 mt-3">
            <div className="h-3 w-20 bg-surface-mid rounded-full" />
            <div className="h-3 w-16 bg-surface-mid rounded-full" />
            <div className="h-3 w-20 bg-surface-mid rounded-full" />
          </div>
          <div className="flex gap-2 mt-3">
            <div className="h-6 w-16 bg-surface-mid rounded-full" />
            <div className="h-6 w-16 bg-surface-mid rounded-full" />
            <div className="h-6 w-20 bg-surface-mid rounded-full" />
            <div className="h-6 w-14 bg-surface-mid rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-token">
        <div className="h-3 w-20 bg-surface-mid rounded-full" />
        <div className="h-8 w-24 bg-surface-mid rounded-lg" />
      </div>
    </div>
  );
}

export default function JobListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
