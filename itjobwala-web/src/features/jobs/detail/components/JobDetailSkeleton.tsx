function Block({ w, h = 'h-4' }: { w: string; h?: string }) {
  return <div className={`${w} ${h} bg-gray-200 rounded-full animate-pulse`} />;
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">{children}</div>;
}

export default function JobDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 animate-pulse">
      {/* Left column */}
      <div className="flex flex-col gap-5">
        <Card>
          <Block w="w-24" h="h-3" />
          <div className="flex gap-4 mt-5">
            <div className="w-16 h-16 bg-gray-200 rounded-2xl shrink-0" />
            <div className="flex-1 flex flex-col gap-3">
              <Block w="w-56" h="h-5" />
              <Block w="w-36" h="h-3" />
              <div className="flex gap-2">
                {[80, 64, 72, 80].map((w, i) => (
                  <div key={i} className="h-6 bg-gray-200 rounded-full" style={{ width: w }} />
                ))}
              </div>
              <div className="flex gap-3 mt-2">
                <div className="h-10 w-32 bg-gray-200 rounded-xl" />
                <div className="h-10 w-20 bg-gray-200 rounded-xl" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <Block w="w-32" h="h-5" />
          <div className="flex flex-col gap-3 mt-5">
            {[100, 90, 95, 85, 88, 92].map((w, i) => (
              <div key={i} className={`h-3 bg-gray-200 rounded-full`} style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="h-px bg-gray-100 my-6" />
          <Block w="w-40" h="h-5" />
          <div className="flex flex-col gap-3 mt-5">
            {[95, 88, 92, 85, 90].map((w, i) => (
              <div key={i} className="h-3 bg-gray-200 rounded-full" style={{ width: `${w}%` }} />
            ))}
          </div>
        </Card>
      </div>

      {/* Right sidebar */}
      <div className="flex flex-col gap-5">
        {[1, 2, 3].map(n => (
          <div key={n} className="bg-white rounded-2xl border border-gray-100 p-5">
            <Block w="w-32" h="h-4" />
            <div className="flex flex-col gap-3 mt-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-200 rounded-lg shrink-0" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="h-3 bg-gray-200 rounded-full w-3/4" />
                    <div className="h-2.5 bg-gray-200 rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
