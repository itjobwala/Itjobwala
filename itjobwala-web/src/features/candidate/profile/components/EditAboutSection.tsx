'use client';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const MAX_LENGTH = 700;

export default function EditAboutSection({ value, onChange }: Props) {
  const remaining = MAX_LENGTH - value.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <span className={`text-caption font-semibold ${remaining < 0 ? 'text-danger' : 'text-subtle'}`}>
          {value.length}/{MAX_LENGTH}
        </span>
      </div>

      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={7}
        maxLength={MAX_LENGTH + 80}
        placeholder="Write a concise professional summary..."
        className={`w-full resize-none rounded-xl border px-4 py-3 text-base leading-[1.75] text-body outline-none transition-colors placeholder:text-muted ${
          remaining < 0 ? 'border-danger focus:border-danger' : 'border-token focus:border-primary/50'
        }`}
      />

      <div className="mt-2 flex items-center justify-between">
        <p className="text-caption text-subtle">Keep it focused on role, strengths, and impact.</p>
        {remaining < 0 && <p className="text-caption font-semibold text-danger">Too long by {Math.abs(remaining)} characters</p>}
      </div>
    </div>
  );
}
