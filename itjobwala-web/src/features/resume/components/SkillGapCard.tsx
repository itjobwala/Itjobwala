'use client';

import Badge from '@/src/components/ui/Badge';

interface Props {
  extracted:  string[];
  missing:    string[];
  suggested:  string[];
}

export default function SkillGapCard({ extracted, missing, suggested }: Props) {
  const uniqueExtracted = [...new Set(extracted)];
  const uniqueMissing   = [...new Set(missing)];
  const uniqueSuggested = [...new Set(suggested)];
  return (
    <div className="space-y-5">
      {/* Detected skills */}
      <div>
        <h4 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Detected in Resume ({extracted.length})
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {uniqueExtracted.length === 0 && (
            <p className="text-[13px] text-gray-400">No skills detected. Add a Skills section to your resume.</p>
          )}
          {uniqueExtracted.map(s => (
            <Badge key={s} variant="emerald" size="sm" rounded="md">{s}</Badge>
          ))}
        </div>
      </div>

      {/* Missing skills */}
      {uniqueMissing.length > 0 && (
        <div>
          <h4 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Skill Gaps ({uniqueMissing.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {uniqueMissing.map(s => (
              <Badge key={s} variant="error" size="sm" rounded="md">+ {s}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Suggested keywords */}
      {uniqueSuggested.length > 0 && (
        <div>
          <h4 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Add These Keywords
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {uniqueSuggested.map(s => (
              <Badge key={s} variant="indigo" size="sm" rounded="md">{s}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
