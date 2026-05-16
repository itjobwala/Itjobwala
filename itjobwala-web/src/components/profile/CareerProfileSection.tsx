import type { CareerProfile } from '@/src/types/profile';

interface Props {
  careerProfile?: CareerProfile;
  expectedSalary?: number;
  onEdit?: () => void;
  onAdd?: () => void;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="block">
      <span className="block text-[12px] font-bold text-gray-500 mb-1.5">{label}</span>
      <div className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] truncate">
        {value ? value : <span className="text-gray-400">Not provided</span>}
      </div>
    </div>
  );
}

export default function CareerProfileSection({ careerProfile, expectedSalary, onEdit, onAdd }: Props) {
  const hasContent = careerProfile && Object.values(careerProfile).some(val => val) || expectedSalary != null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 relative group">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[16px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.3px' }}>Career profile</h2>
        {hasContent ? (
          <div className="absolute right-6 top-6 sm:right-8 sm:top-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-primary transition-colors" aria-label="Edit career profile">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
          </div>
        ) : null}
      </div>

      {!hasContent ? (
        <button 
          onClick={onAdd}
          className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-primary/40 hover:text-primary transition-colors"
        >
          <span className="text-[13px] font-semibold">Add career profile</span>
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
          <ReadOnlyField label="Expected salary" value={expectedSalary != null ? `₹${expectedSalary.toLocaleString()}` : ''} />
          <div className="sm:col-span-2">
            <ReadOnlyField label="Preferred work location" value={Array.isArray(careerProfile?.preferred_work_location) ? careerProfile.preferred_work_location.join(', ') : (careerProfile?.preferred_work_location || '')} />
          </div>
        </div>
      )}
    </div>
  );
}
