interface Props {
  className?: string;
}

export default function VerifiedBadge({ className = '' }: Props) {
  return (
    <span
      title="Verified Employer"
      className={`inline-flex items-center gap-1 text-micro font-bold rounded-full py-[2px] px-2 bg-success-bg text-success ${className}`}
    >
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      Verified
    </span>
  );
}
