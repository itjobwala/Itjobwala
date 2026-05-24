import Link from 'next/link';
import type { Education } from '@/features/candidate/profile/types/profile.types';
import Card from '@/src/components/ui/Card';
import { formatDateDisplay } from '../utils/profileDate';

interface Props {
  education: Education[];
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="block">
      <span className="block text-[12px] font-bold text-gray-500 mb-1.5">{label}</span>
      <div className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a]">
        {value || <span className="text-gray-400">Not provided</span>}
      </div>
    </div>
  );
}

export default function EducationSection({ education, onEdit, onAdd }: Props & { onEdit?: (id: string) => void; onAdd?: () => void }) {
  return (
    <Card padding="none" className="p-6 sm:p-8" overflow>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[16px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.3px' }}>Education</h2>
        {education.length > 0 ? (
          <button onClick={onAdd} className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-400 hover:text-primary transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
            </svg>
            Add education
          </button>
        ) : null}
      </div>

      {education.length === 0 ? (
        <button 
          onClick={onAdd}
          className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-primary/40 hover:text-primary transition-colors"
        >
          <span className="text-[13px] font-semibold">Add your education</span>
        </button>
      ) : (
        <div className="flex flex-col gap-4">
          {education.map(ed => (
            <div key={ed.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 hover:border-primary/20 transition-colors group relative">
              <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                <button onClick={() => onEdit?.(String(ed.id))} className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-primary transition-colors" aria-label="Edit education">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
                <ReadOnlyField label="Institution" value={ed.institution} />
                <ReadOnlyField label="Degree" value={ed.degree} />
                <ReadOnlyField label="Field of study" value={ed.field_of_study || ed.field || ''} />
                <ReadOnlyField label="Location" value={ed.location || ''} />
                <ReadOnlyField label="Grade / GPA" value={ed.grade || ''} />
                <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                  <ReadOnlyField label="Start date" value={formatDateDisplay(ed.start_date) || (ed.start_year ? String(ed.start_year) : '')} />
                  <ReadOnlyField label="End date" value={ed.is_current ? 'Pursuing' : (formatDateDisplay(ed.end_date) || (ed.end_year ? String(ed.end_year) : ''))} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
