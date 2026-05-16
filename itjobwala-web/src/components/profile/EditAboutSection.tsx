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
        <span className={`text-[12px] font-semibold ${remaining < 0 ? 'text-red-500' : 'text-gray-400'}`}>
          {value.length}/{MAX_LENGTH}
        </span>
      </div>

      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={7}
        maxLength={MAX_LENGTH + 80}
        placeholder="Write a concise professional summary..."
        className={`w-full resize-none rounded-xl border px-4 py-3 text-[14px] leading-[1.75] text-gray-700 outline-none transition-colors placeholder:text-gray-400 ${
          remaining < 0 ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-primary/50'
        }`}
      />

      <div className="mt-2 flex items-center justify-between">
        <p className="text-[12px] text-gray-400">Keep it focused on role, strengths, and impact.</p>
        {remaining < 0 && <p className="text-[12px] font-semibold text-red-500">Too long by {Math.abs(remaining)} characters</p>}
      </div>
    </div>
  );
}
