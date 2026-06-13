import Card from '@/src/components/ui/Card';

interface Props {
  skills: string[];
}

export default function SkillsTags({ skills }: Props) {
  return (
    <Card padding="none" className="p-6 sm:p-8" overflow>
      <h2 className="text-lg font-extrabold text-heading mb-4" style={{ letterSpacing: '-0.3px' }}>
        Skills required
      </h2>
      <div className="flex flex-wrap gap-2.5">
        {skills.map(skill => (
          <span
            key={skill}
            className="text-sm font-semibold rounded-xl px-4 py-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-default"
          >
            {skill}
          </span>
        ))}
      </div>
    </Card>
  );
}
