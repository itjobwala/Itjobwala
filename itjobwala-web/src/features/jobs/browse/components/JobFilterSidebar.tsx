'use client';

import { useState } from 'react';
import type { FilterState } from '../../shared/types';
import Card from '@/src/components/ui/Card';
import SalaryRangeSlider from '@/src/components/ui/SalaryRangeSlider';
import { validateSkill } from '@/src/lib/skillValidation';
import { useSkillSuggestions } from '@/src/hooks/useSkillSuggestions';
import { validateSkillsRemote } from '@/features/jobs/shared';

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
      <p className="text-caption font-bold text-subtle uppercase tracking-wider mb-3">{title}</p>
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
          checked ? 'bg-primary border-primary' : 'border-token group-hover:border-primary/50'
        }`}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M2 6l3 3 5-5" />
          </svg>
        )}
      </span>
      <span className={`text-sm transition-colors ${checked ? 'text-heading font-semibold' : 'text-body-secondary group-hover:text-heading'}`}>
        {label}
      </span>
    </label>
  );
}

function toggleArr(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

export default function JobFilterSidebar({ filters, onChange, onReset, activeCount }: Props) {
  const [skillInput, setSkillInput] = useState('');
  const [skillError, setSkillError] = useState('');
  const skillSuggestions = useSkillSuggestions(skillInput, filters.skills || []);

  async function addSkillFromFilter(override?: string, fromSuggestion = false) {
    const skill = (override ?? skillInput).trim();
    if (!skill) return;
    const error = validateSkill(skill);
    if (error) { setSkillError(error); return; }
    const currentSkills = filters.skills || [];
    if (currentSkills.includes(skill)) { setSkillError('Skill already added'); return; }
    if (!fromSuggestion) {
      try {
        const result = await validateSkillsRemote([skill]);
        if (!result.valid) {
          setSkillError('Not a recognised skill — please select from suggestions');
          return;
        }
      } catch { /* network error — allow through */ }
    }
    onChange({ ...filters, skills: [...currentSkills, skill] });
    setSkillInput('');
    setSkillError('');
  }

  return (
    <Card as="aside" overflow>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <span className="font-bold text-md text-heading">Filters</span>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="text-caption font-semibold text-primary hover:underline"
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

        <div className="h-px bg-token" />

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

        <div className="h-px bg-token" />

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

        <div className="h-px bg-token" />

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

        <div className="h-px bg-token" />

        {/* Salary Range */}
        <FilterGroup title="Salary Range">
          <SalaryRangeSlider
            minLpa={filters.salaryMin ? Math.round(filters.salaryMin / 100000) : 0}
            maxLpa={filters.salaryMax ? Math.round(filters.salaryMax / 100000) : 50}
            onChange={(minLpa, maxLpa) => onChange({
              ...filters,
              salaryMin: minLpa > 0 ? minLpa * 100000 : undefined,
              salaryMax: maxLpa < 50 ? maxLpa * 100000 : undefined,
            })}
          />
        </FilterGroup>

        <div className="h-px bg-token" />

        {/* Skills */}
        <FilterGroup title="Skills">
          <input
            type="text"
            value={skillInput}
            placeholder="Type to search skills…"
            onChange={e => { setSkillInput(e.target.value); setSkillError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkillFromFilter(); } }}
            className={`w-full px-2.5 py-2 text-caption border rounded-lg focus:outline-none ${skillError ? 'border-danger' : 'border-token focus:border-primary'}`}
          />
          {skillError && <p className="text-micro text-danger mt-1">{skillError}</p>}
          {skillSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {skillSuggestions.map(s => (
                <button key={s} type="button"
                  onClick={() => addSkillFromFilter(s, true)}
                  className="px-2 py-1 rounded-md text-micro font-semibold bg-surface-hover text-muted hover:bg-primary/10 hover:text-primary transition-colors">
                  + {s}
                </button>
              ))}
            </div>
          )}
          {filters.skills && filters.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.skills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-1.5 text-micro font-semibold text-primary"
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
    </Card>
  );
}
