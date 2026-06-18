import type { CareerProfile } from '@/features/candidate/profile/types/profile.types';
import Card from '@/src/components/ui/Card';
import Button from '@/src/components/ui/Button';
import { formatLpa } from '@/src/lib/utils/format';

interface Props {
  careerProfile?: CareerProfile;
  expectedSalary?: number;
  onEdit?: () => void;
  onAdd?: () => void;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="block">
      <span className="block text-caption font-bold text-muted mb-1.5">{label}</span>
      <div className="w-full rounded-xl border border-token bg-surface px-3.5 py-2.5 text-sm font-medium text-heading truncate">
        {value ? value : <span className="text-subtle">Not provided</span>}
      </div>
    </div>
  );
}

export default function CareerProfileSection({ careerProfile, expectedSalary, onEdit, onAdd }: Props) {
  const hasContent = careerProfile && Object.values(careerProfile).some(val => val) || expectedSalary != null;

  return (
    <Card padding="none" className="p-6 sm:p-8 relative group" overflow>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-extrabold text-heading" style={{ letterSpacing: '-0.3px' }}>Career profile</h2>
        {hasContent ? (
          <div className="absolute right-6 top-6 sm:right-8 sm:top-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              }
              onClick={onEdit}
              aria-label="Edit career profile"
            >
              Edit
            </Button>
          </div>
        ) : null}
      </div>

      {!hasContent ? (
        <button
          onClick={onAdd}
          className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-token rounded-xl text-subtle hover:border-primary/40 hover:text-primary transition-colors"
        >
          <span className="text-sm font-semibold">Add career profile</span>
        </button>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <ReadOnlyField label="Current industry" value={careerProfile?.current_industry || ''} />
          <ReadOnlyField label="Department" value={careerProfile?.department || ''} />
          <ReadOnlyField label="Role category" value={careerProfile?.role_category || ''} />
          <ReadOnlyField label="Job role" value={careerProfile?.job_role || ''} />
          <ReadOnlyField label="Desired job type" value={careerProfile?.desired_job_type || ''} />
          <ReadOnlyField label="Desired employment type" value={careerProfile?.desired_employment_type || ''} />
          <ReadOnlyField label="Preferred shift" value={careerProfile?.preferred_shift || ''} />
          <ReadOnlyField label="Expected salary" value={expectedSalary != null ? `${formatLpa(expectedSalary / 100000)} LPA` : ''} />
          <div className="sm:col-span-2">
            <ReadOnlyField label="Preferred work location" value={Array.isArray(careerProfile?.preferred_work_location) ? careerProfile.preferred_work_location.join(', ') : (careerProfile?.preferred_work_location || '')} />
          </div>
        </div>
      )}
    </Card>
  );
}
