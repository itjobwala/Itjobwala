export default function EmptyJobsState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-[#0f172a] mb-2">No jobs found</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        Try adjusting your search or filters to find more opportunities.
      </p>
      <button
        onClick={onReset}
        className="text-sm font-bold text-white bg-primary rounded-xl px-6 py-3 hover:brightness-110 transition-[filter]"
      >
        Clear all filters
      </button>
    </div>
  );
}
