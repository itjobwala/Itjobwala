'use client';

interface Props {
  strengths:   string[];
  weaknesses:  string[];
  suggestions: string[];
}

function ItemList({ items, icon, color }: { items: string[]; icon: string; color: string }) {
  if (!items.length) return null;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-[13px] text-gray-700 leading-relaxed">
          <span className={`mt-0.5 shrink-0 text-base ${color}`}>{icon}</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function ResumeSuggestions({ strengths, weaknesses, suggestions }: Props) {
  return (
    <div className="space-y-5">
      {strengths.length > 0 && (
        <div>
          <h4 className="text-[13px] font-semibold text-emerald-700 uppercase tracking-wide mb-2.5">
            What's Working Well
          </h4>
          <ItemList items={strengths} icon="✓" color="text-emerald-500" />
        </div>
      )}

      {weaknesses.length > 0 && (
        <div>
          <h4 className="text-[13px] font-semibold text-red-500 uppercase tracking-wide mb-2.5">
            Areas to Address
          </h4>
          <ItemList items={weaknesses} icon="!" color="text-red-400" />
        </div>
      )}

      {suggestions.length > 0 && (
        <div>
          <h4 className="text-[13px] font-semibold text-blue-600 uppercase tracking-wide mb-2.5">
            Improvement Suggestions
          </h4>
          <ItemList items={suggestions} icon="→" color="text-blue-500" />
        </div>
      )}
    </div>
  );
}
