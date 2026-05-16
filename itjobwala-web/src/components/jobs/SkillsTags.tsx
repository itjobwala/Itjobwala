interface Props {
  skills: string[];
}

export default function SkillsTags({ skills }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
      <h2 className="text-[16px] font-extrabold text-[#0f172a] mb-4" style={{ letterSpacing: '-0.3px' }}>
        Skills required
      </h2>
      <div className="flex flex-wrap gap-2.5">
        {skills.map(skill => (
          <span
            key={skill}
            className="text-[13px] font-semibold rounded-xl px-4 py-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-default"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
