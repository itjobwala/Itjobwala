import type { PersonalDetails } from '@/features/candidate/profile/types/profile.types';
import Card from '@/src/components/ui/Card';

interface Props {
  personalDetails?: PersonalDetails;
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

const PERMIT_QUESTIONS = [
  { key: 'authorized_to_work_in_us' as const,   label: 'Authorized to work in US' },
  { key: 'work_permit_other_countries' as const, label: 'Work permit for other countries' },
];

function CheckIcon({ checked }: { checked: boolean }) {
  return checked ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export default function PersonalDetailsSection({ personalDetails, onEdit, onAdd }: Props) {
  const hasContent = personalDetails && Object.values(personalDetails).some(val => val !== null && val !== undefined && val !== '' && (!Array.isArray(val) || val.length > 0));

  return (
    <Card padding="none" className="p-6 sm:p-8 relative group" overflow>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[16px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.3px' }}>Personal details</h2>
        {hasContent ? (
          <div className="absolute right-6 top-6 sm:right-8 sm:top-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-primary transition-colors" aria-label="Edit personal details">
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
          <span className="text-[13px] font-semibold">Add personal details</span>
        </button>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Basic fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <ReadOnlyField label="Gender" value={personalDetails?.gender || ''} />
            <ReadOnlyField label="Marital status" value={personalDetails?.marital_status || ''} />
            <ReadOnlyField label="Date of birth" value={personalDetails?.date_of_birth || ''} />
            <ReadOnlyField label="Category" value={personalDetails?.category || ''} />
            <div className="sm:col-span-2">
              <ReadOnlyField label="Address" value={personalDetails?.address || ''} />
            </div>
          </div>

          {/* Work permit */}
          <div>
            <span className="block text-[12px] font-bold text-gray-500 mb-2">Work permit</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {PERMIT_QUESTIONS.map(({ key, label }) => {
                const val = personalDetails?.[key];
                return (
                  <div key={key} className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#0f172a]">{label}</span>
                    {val === undefined || val === null ? (
                      <span className="text-[12px] text-gray-400">Not specified</span>
                    ) : (
                      <span className={`text-[11px] font-bold rounded-full px-2.5 py-0.5 ${val ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
                        {val ? 'Yes' : 'No'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Languages */}
          {personalDetails?.languages && personalDetails.languages.filter(l => l.name?.trim?.() !== '').length > 0 && (
            <div>
              <h3 className="text-[13px] font-bold text-[#0f172a] mb-3">Languages</h3>
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Language</th>
                      <th className="px-4 py-2.5">Proficiency</th>
                      <th className="px-4 py-2.5 text-center">Read</th>
                      <th className="px-4 py-2.5 text-center">Write</th>
                      <th className="px-4 py-2.5 text-center">Speak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {personalDetails.languages.filter(l => l.name?.trim?.() !== '').map(lang => (
                      <tr key={lang.id} className="bg-white">
                        <td className="px-4 py-3 font-medium text-[#0f172a] capitalize">{lang.name}</td>
                        <td className="px-4 py-3 text-gray-600 capitalize">{lang.proficiency || ''}</td>
                        <td className="px-4 py-3 text-center"><div className="flex justify-center"><CheckIcon checked={lang.read || false} /></div></td>
                        <td className="px-4 py-3 text-center"><div className="flex justify-center"><CheckIcon checked={lang.write || false} /></div></td>
                        <td className="px-4 py-3 text-center"><div className="flex justify-center"><CheckIcon checked={lang.speak || false} /></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
