'use client';

export interface EditableLanguage {
  id:           string;
  name:         string;
  proficiency:  string;
  read:         boolean;
  write:        boolean;
  speak:        boolean;
}

export interface EditablePersonalDetails {
  gender: string;
  marital_status: string;
  date_of_birth: string;
  category: string;
  authorized_to_work_in_us: boolean;
  work_permit_other_countries: boolean;
  address: string;
  languages: EditableLanguage[];
}

interface Props {
  profile: EditablePersonalDetails;
  onChange: (profile: EditablePersonalDetails) => void;
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

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked ?? false}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/50 cursor-pointer"
      />
      <span className="text-[12px] font-medium text-[#0f172a]">{label}</span>
    </label>
  );
}

export default function EditPersonalDetailsSection({ profile, onChange }: Props) {
  function update(key: keyof EditablePersonalDetails, value: any) {
    onChange({ ...profile, [key]: value });
  }

  function addLanguage() {
    update('languages', [...profile.languages, { id: `lang-${Date.now()}`, name: '', proficiency: 'beginner', read: false, write: false, speak: false }]);
  }

  function updateLanguage(id: string, patch: Partial<EditableLanguage>) {
    update('languages', profile.languages.map(lang => lang.id === id ? { ...lang, ...patch } : lang));
  }

  function removeLanguage(id: string) {
    update('languages', profile.languages.filter(lang => lang.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <label className="block">
          <span className="block text-[12px] font-bold text-gray-500 mb-1.5">Gender</span>
          <select
            value={profile.gender}
            onChange={e => update('gender', e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none transition-colors focus:border-primary/50"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Transgender">Transgender</option>
            <option value="Rather not say">Rather not say</option>
          </select>
        </label>

        <label className="block">
          <span className="block text-[12px] font-bold text-gray-500 mb-1.5">Marital status</span>
          <select
            value={profile.marital_status}
            onChange={e => update('marital_status', e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none transition-colors focus:border-primary/50"
          >
            <option value="">Select status</option>
            <option value="Single / unmarried">Single / unmarried</option>
            <option value="Married">Married</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <TextField label="Date of birth" value={profile.date_of_birth} onChange={v => update('date_of_birth', v)} type="date" />
        
        <label className="block">
          <span className="block text-[12px] font-bold text-gray-500 mb-1.5">Category</span>
          <select
            value={profile.category}
            onChange={e => update('category', e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none transition-colors focus:border-primary/50"
          >
            <option value="">Select category</option>
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <div className="sm:col-span-2 space-y-3">
          <span className="block text-[12px] font-bold text-gray-500">Work permit</span>
          {([
            { label: 'Authorized to work in US', key: 'authorized_to_work_in_us' as const },
            { label: 'Work permit for other countries', key: 'work_permit_other_countries' as const },
          ]).map(({ label, key }) => (
            <div key={key} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <span className="text-[13px] font-medium text-[#0f172a]">{label}</span>
              <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                <button type="button" onClick={() => update(key, true)}
                  className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all ${profile[key] ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  Yes
                </button>
                <button type="button" onClick={() => update(key, false)}
                  className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all ${!profile[key] ? 'bg-red-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  No
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="sm:col-span-2">
          <TextField label="Permanent Address" value={profile.address} onChange={v => update('address', v)} placeholder="e.g. H.No 5493..." />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-extrabold text-[#0f172a]">Languages</h3>
          <button
            type="button"
            onClick={addLanguage}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-400 hover:text-primary transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
            </svg>
            Add language
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {profile.languages.map(lang => (
            <div key={lang.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 relative group">
              <button
                type="button"
                onClick={() => removeLanguage(lang.id)}
                className="absolute right-4 top-4 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remove language"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pr-8">
                <TextField label="Language" value={lang.name} onChange={v => updateLanguage(lang.id, { name: v })} placeholder="e.g. English" />
                <label className="block">
                  <span className="block text-[12px] font-bold text-gray-500 mb-1.5">Proficiency</span>
                  <select
                    value={lang.proficiency}
                    onChange={e => updateLanguage(lang.id, { proficiency: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none transition-colors focus:border-primary/50"
                  >
                    <option value="">Select proficiency</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="fluent">Fluent</option>
                  </select>
                </label>
              </div>
              <div className="mt-4 flex items-center gap-5">
                <span className="text-[12px] font-bold text-gray-500">Skills:</span>
                <Checkbox label="Read" checked={lang.read} onChange={c => updateLanguage(lang.id, { read: c })} />
                <Checkbox label="Write" checked={lang.write} onChange={c => updateLanguage(lang.id, { write: c })} />
                <Checkbox label="Speak" checked={lang.speak} onChange={c => updateLanguage(lang.id, { speak: c })} />
              </div>
            </div>
          ))}
          {profile.languages.length === 0 && (
            <p className="text-[12px] text-gray-400 font-medium text-center py-4">No languages added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
