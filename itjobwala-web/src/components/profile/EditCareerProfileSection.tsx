'use client';

export interface EditableCareerProfile {
  current_industry: string;
  department: string;
  role_category: string;
  job_role: string;
  desired_job_type: string;
  desired_employment_type: string;
  preferred_shift: string;
  preferred_work_location: string;
  expected_salary: string;
}

interface Props {
  profile: EditableCareerProfile;
  onChange: (profile: EditableCareerProfile) => void;
}

function TextField({ label, value, onChange, placeholder = '', type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-bold text-gray-500 mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none transition-colors focus:border-primary/50 placeholder:text-gray-400"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string | string[]; onChange: (value: string) => void; options: string[] }) {
  const rawValue = typeof value === 'string' ? value : (Array.isArray(value) ? value[0] || '' : '');
  const scalarValue = (rawValue && typeof rawValue === 'string' ? rawValue.trim() : '') || '';
  return (
    <label className="block">
      <span className="block text-[12px] font-bold text-gray-500 mb-1.5">{label}</span>
      <select
        value={scalarValue}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none transition-colors focus:border-primary/50"
      >
        <option value="">-- Select --</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export default function EditCareerProfileSection({ profile, onChange }: Props) {
  function update(key: keyof EditableCareerProfile, value: string) {
    onChange({ ...profile, [key]: value });
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <TextField label="Current industry" value={profile.current_industry} onChange={v => update('current_industry', v)} placeholder="e.g. IT Services & Consulting" />
        <TextField label="Department" value={profile.department} onChange={v => update('department', v)} placeholder="e.g. Engineering - Software & QA" />
        <TextField label="Role category" value={profile.role_category} onChange={v => update('role_category', v)} placeholder="e.g. Software Development" />
        <TextField label="Job role" value={profile.job_role} onChange={v => update('job_role', v)} placeholder="e.g. Software Development - Other" />
        <SelectField label="Desired job type" value={profile.desired_job_type} onChange={v => update('desired_job_type', v)} options={['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']} />
        <SelectField label="Desired employment type" value={profile.desired_employment_type} onChange={v => update('desired_employment_type', v)} options={['Permanent', 'Temporary', 'Contractual']} />
        <SelectField label="Preferred shift" value={profile.preferred_shift} onChange={v => update('preferred_shift', v)} options={['Day Shift', 'Night Shift', 'Flexible']} />
        <TextField label="Expected salary (₹)" value={profile.expected_salary} onChange={v => update('expected_salary', v)} type="number" placeholder="e.g. 100000" />
      </div>
      <SelectField label="Preferred work location" value={profile.preferred_work_location} onChange={v => update('preferred_work_location', v)} options={['Remote', 'On-site', 'Hybrid']} />
    </div>
  );
}
