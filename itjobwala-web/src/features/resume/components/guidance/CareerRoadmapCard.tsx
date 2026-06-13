'use client';

import { CareerRoadmap } from '../../types/resume.types';

interface Props {
  data: CareerRoadmap;
}

export default function CareerRoadmapCard({ data }: Props) {
  return (
    <div className="bg-surface rounded-2xl border border-token p-5 space-y-5">
      <div>
        <h3 className="font-semibold text-heading mb-1">Career Roadmap</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs bg-surface-hover text-body-secondary px-2 py-0.5 rounded-full">{data.current_role}</span>
          <span className="text-gray-300 text-xs">→</span>
          {/* Intentional blue target role pill */}
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{data.next_role_target}</span>
        </div>
      </div>

      {/* Intentional blue growth impact panel */}
      <div className="bg-blue-50 rounded-xl p-3">
        <p className="text-xs font-medium text-blue-700 mb-0.5">Growth Impact</p>
        <p className="text-sm text-blue-800 leading-relaxed">{data.estimated_growth_impact}</p>
        <p className="text-xs text-blue-500 mt-1">Timeline: {data.estimated_timeline}</p>
      </div>

      {data.roadmap_steps.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-subtle">Steps to Get There</p>
          <ol className="space-y-2">
            {data.roadmap_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-surface-hover text-muted text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                <span className="text-sm text-body leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {data.recommended_projects.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-subtle">Portfolio Projects</p>
          <ul className="space-y-1.5">
            {data.recommended_projects.map((p, i) => (
              <li key={i} className="text-sm text-body-secondary flex items-start gap-2">
                <span className="text-violet-400 shrink-0">◈</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.recommended_certifications.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-subtle">Certifications</p>
          <div className="flex flex-wrap gap-2">
            {data.recommended_certifications.map((c, i) => (
              <span key={i} className="text-xs bg-violet-50 text-violet-700 px-2 py-1 rounded-lg border border-violet-100">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
