import Link from 'next/link';
import Card from '@/src/components/ui/Card';

interface Props {
  skills: string[];
}

export default function SkillsSection({ skills, onEdit }: Props & { onEdit?: () => void }) {
  return (
    <Card padding="none" className="p-6 sm:p-8" overflow>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[16px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.3px' }}>Skills</h2>
        {skills.length > 0 ? (
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-400 hover:text-primary transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="
              10" /><path d="M12 8v8M8 12h8" />
            </svg>
            Edit skills
          </button>
        ) : null}
      </div>

      {skills.length === 0 ? (
        <button
          onClick={onEdit}
          className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-primary/40 hover:text-primary transition-colors"
        >
          <span className="text-[13px] font-semibold">Add your skills</span>
        </button>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {skills.map(skill => (
            <div key={skill} className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-xl px-3.5 py-2 border border-primary/20">
              <span className="text-[13px] font-semibold">{skill}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
