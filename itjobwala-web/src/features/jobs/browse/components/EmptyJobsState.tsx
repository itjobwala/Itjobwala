import EmptyState from '@/src/components/ui/EmptyState';

const SearchIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-subtle">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

export default function EmptyJobsState({ onReset }: { onReset: () => void }) {
  return (
    <EmptyState
      icon={SearchIcon}
      title="No QA roles match your filters"
      description="Try removing a filter or browsing all QA roles"
      cta={{ label: 'Browse all QA roles', onClick: onReset }}
      className="py-24"
    />
  );
}
