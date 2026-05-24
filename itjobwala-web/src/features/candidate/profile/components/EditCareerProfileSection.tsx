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

function TextField({ label, value, onChange, placeholder = '', type = 'text', error = '' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; error?: string }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-bold text-gray-500 mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none transition-colors focus:border-primary/50 placeholder:text-gray-400 ${error ? 'border-red-400' : 'border-gray-200'}`}
      />
      {error && <p className="text-[11px] text-red-500 mt-1 font-medium">{error}</p>}
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
        <label className="block">
          <span className="block text-[12px] font-bold text-gray-500 mb-1.5">Expected salary (₹)</span>
          <input
            type="number"
            min="1"
            value={profile.expected_salary}
            onChange={e => update('expected_salary', e.target.value)}
            placeholder="e.g. 100000"
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none transition-colors placeholder:text-gray-400 ${
              profile.expected_salary !== '' && profile.expected_salary != null && Number(profile.expected_salary) <= 0
                ? 'border-red-300 focus:border-red-400'
                : 'border-gray-200 focus:border-primary/50'
            }`}
          />
          {profile.expected_salary !== '' && profile.expected_salary != null && Number(profile.expected_salary) <= 0 && (
            <span className="mt-1 block text-[11px] font-semibold text-red-500">Expected salary must be greater than 0</span>
          )}
        </label>
      </div>
      <SelectField label="Preferred work location" value={profile.preferred_work_location} onChange={v => update('preferred_work_location', v)} options={['Remote', 'On-site', 'Hybrid']} />
    </div>
  );
}
