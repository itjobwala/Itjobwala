import Link from 'next/link';
import Card from '@/src/components/ui/Card';

interface Props {
  trendingSkills: string[];
  currentSkills: string[];
}

export default function RecommendedSkillsCard({ trendingSkills, currentSkills, onEdit }: Props & { onEdit?: () => void }) {
  const suggestions = trendingSkills.filter(s => !currentSkills.includes(s));

  return (
    <Card overflow>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[14px] font-extrabold text-[#0f172a]">Trending skills</h3>
        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 rounded-full px-2 py-0.5">Trending</span>
      </div>
      <p className="text-[12px] text-gray-400 mb-4">Based on jobs you&apos;ve viewed</p>

      <div className="flex flex-wrap gap-2">
        {suggestions.map(skill => (
          <button
            key={skill}
            onClick={onEdit}
            className="flex items-center gap-1.5 text-[12px] font-semibold rounded-xl px-3 py-1.5 border bg-gray-50 text-gray-600 border-gray-200 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {skill}
          </button>
        ))}
      </div>
    </Card>
  );
}
