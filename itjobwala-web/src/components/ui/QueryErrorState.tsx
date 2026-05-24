interface Props {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function QueryErrorState({
  message = 'Failed to load data. Please try again.',
  onRetry,
  className = '',
}: Props) {
  return (
    <div className={`flex flex-col items-center justify-center py-14 text-center ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-[14px] font-semibold text-[#0f172a] mb-1">Something went wrong</p>
      <p className="text-[13px] text-gray-500 max-w-[260px] mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-[13px] font-semibold text-primary border border-primary/25 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
