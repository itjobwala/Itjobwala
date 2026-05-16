'use client';

import type { FilterState } from './types';

const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

const WORK_MODES = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

const EXPERIENCE_OPTIONS = [
  { value: '0-2', label: '0–2 years' },
  { value: '2-5', label: '2–5 years' },
  { value: '5-10', label: '5–10 years' },
  { value: '10+', label: '10+ years' },
];

const COMPANY_TYPES = [
  { value: 'startup', label: 'Startup' },
  { value: 'mnc', label: 'MNC' },
  { value: 'product', label: 'Product' },
  { value: 'service', label: 'Service' },
];

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onReset: () => void;
  activeCount: number;
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group" onClick={onChange}>
      <span
        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
          checked ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary/50'
        }`}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M2 6l3 3 5-5" />
          </svg>
        )}
      </span>
      <span className={`text-[13px] transition-colors ${checked ? 'text-[#0f172a] font-semibold' : 'text-gray-600 group-hover:text-[#0f172a]'}`}>
        {label}
      </span>
    </label>
  );
}

function toggleArr(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

export default function JobFilterSidebar({ filters, onChange, onReset, activeCount }: Props) {
  return (
    <aside className="bg-white rounded-2xl border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <span className="font-bold text-[15px] text-[#0f172a]">Filters</span>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="text-[12px] font-semibold text-primary hover:underline"
          >
            Reset ({activeCount})
          </button>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {/* Job Type */}
        <FilterGroup title="Job Type">
          {JOB_TYPES.map(({ value, label }) => (
            <Checkbox
              key={value}
              checked={filters.jobType.includes(value)}
              onChange={() => onChange({ ...filters, jobType: toggleArr(filters.jobType, value) })}
              label={label}
            />
          ))}
        </FilterGroup>

        <div className="h-px bg-gray-100" />

        {/* Work Mode */}
        <FilterGroup title="Work Mode">
          {WORK_MODES.map(({ value, label }) => (
            <Checkbox
              key={value}
              checked={filters.workMode.includes(value)}
              onChange={() => onChange({ ...filters, workMode: toggleArr(filters.workMode, value) })}
              label={label}
            />
          ))}
        </FilterGroup>

        <div className="h-px bg-gray-100" />

        {/* Experience */}
        <FilterGroup title="Experience">
          {EXPERIENCE_OPTIONS.map(({ value, label }) => (
            <Checkbox
              key={value}
              checked={filters.experience === value}
              onChange={() => onChange({ ...filters, experience: filters.experience === value ? '' : value })}
              label={label}
            />
          ))}
        </FilterGroup>

        <div className="h-px bg-gray-100" />

        {/* Company Type */}
        <FilterGroup title="Company Type">
          {COMPANY_TYPES.map(({ value, label }) => (
            <Checkbox
              key={value}
              checked={filters.companyType.includes(value)}
              onChange={() => onChange({ ...filters, companyType: toggleArr(filters.companyType, value) })}
              label={label}
            />
          ))}
        </FilterGroup>

        <div className="h-px bg-gray-100" />

        {/* Salary Range */}
        <FilterGroup title="Salary Range">
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold text-gray-700">Min: ₹{filters.salaryMin ? (filters.salaryMin / 100000).toFixed(1) : '0'} LPA</label>
                <button
                  onClick={() => onChange({ ...filters, salaryMin: undefined })}
                  className="text-[10px] font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Reset
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="5000000"
                step="100000"
                value={filters.salaryMin || 0}
                onChange={(e) => onChange({ ...filters, salaryMin: parseInt(e.target.value) || undefined })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold text-gray-700">Max: ₹{filters.salaryMax ? (filters.salaryMax / 100000).toFixed(1) : '50'} LPA</label>
                <button
                  onClick={() => onChange({ ...filters, salaryMax: undefined })}
                  className="text-[10px] font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Reset
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="5000000"
                step="100000"
                value={filters.salaryMax || 5000000}
                onChange={(e) => onChange({ ...filters, salaryMax: parseInt(e.target.value) || undefined })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-lg px-3 py-2">
              <p className="text-[11px] text-gray-600">
                {filters.salaryMin || filters.salaryMax ? (
                  <>
                    <span className="font-semibold text-primary">
                      ₹{filters.salaryMin ? (filters.salaryMin / 100000).toFixed(1) : '0'} - ₹{filters.salaryMax ? (filters.salaryMax / 100000).toFixed(1) : '50'} LPA
                    </span>
                  </>
                ) : (
                  'Select salary range'
                )}
              </p>
            </div>
          </div>
        </FilterGroup>

        <div className="h-px bg-gray-100" />

        {/* Skills */}
        <FilterGroup title="Skills">
          <input
            type="text"
            placeholder="Add skill"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                const skill = e.currentTarget.value.trim();
                const currentSkills = filters.skills || [];
                if (!currentSkills.includes(skill)) {
                  onChange({ ...filters, skills: [...currentSkills, skill] });
                }
                e.currentTarget.value = '';
              }
            }}
            className="w-full px-2.5 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          />
          {filters.skills && filters.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.skills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-primary"
                >
                  {skill}
                  <button
                    onClick={() => onChange({ ...filters, skills: (filters.skills || []).filter(s => s !== skill) })}
                    className="text-primary hover:opacity-70"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </FilterGroup>
      </div>
    </aside>
  );
}
