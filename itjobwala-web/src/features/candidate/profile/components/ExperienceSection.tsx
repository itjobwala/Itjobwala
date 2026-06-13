'use client';

import { useState } from 'react';
import Link from 'next/link';
import Card from '@/src/components/ui/Card';
import Button from '@/src/components/ui/Button';
import type { WorkExperience } from '@/features/candidate/profile/types/profile.types';
import { formatDateDisplay } from '../utils/profileDate';

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="block">
      <span className="block text-caption font-bold text-muted mb-1.5">{label}</span>
      <div className="w-full rounded-xl border border-token bg-surface px-3.5 py-2.5 text-sm font-medium text-heading">
        {value || <span className="text-subtle">Not provided</span>}
      </div>
    </div>
  );
}

interface Props {
  experiences: WorkExperience[];
}

function ExperienceCard({ exp, onEdit }: { exp: WorkExperience; onEdit?: (id: string) => void }) {
  return (
    <div className="rounded-2xl border border-token bg-surface-alt p-4 mb-4 last:mb-0 hover:border-primary/20 transition-colors group relative">
      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          }
          onClick={() => onEdit?.(String(exp.id))}
          aria-label="Edit experience"
        >
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
        <ReadOnlyField label="Company" value={exp.company} />
        <ReadOnlyField label="Role" value={exp.title ?? exp.role} />
        <ReadOnlyField label="Employment type" value={exp.employment_type} />
        <ReadOnlyField label="Location" value={exp.location || ''} />
        <div className="grid grid-cols-2 gap-3">
          <ReadOnlyField label="Start date" value={formatDateDisplay(exp.start_date) || ''} />
          <ReadOnlyField label="End date" value={(exp.is_current || exp.current) ? 'Present' : (formatDateDisplay(exp.end_date) || '')} />
        </div>
      </div>

      <div className="block mt-3.5">
        <span className="block text-caption font-bold text-muted mb-1.5">Description</span>
        <div className="w-full rounded-xl border border-token bg-surface px-3.5 py-2.5 text-sm leading-[1.7] text-body min-h-[100px]">
          {exp.description || <span className="text-subtle">No description provided.</span>}
        </div>
      </div>

      {(exp.skills && exp.skills.length > 0) && (
        <div className="block mt-3.5">
          <span className="block text-caption font-bold text-muted mb-1.5">Skills used</span>
          <div className="flex flex-wrap gap-2">
            {exp.skills.map(skill => (
              <span key={skill} className="bg-primary/10 text-primary rounded-xl px-3 py-1.5 text-caption font-semibold border border-primary/20">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExperienceSection({ experiences, onEdit, onAdd }: Props & { onEdit?: (id: string) => void; onAdd?: () => void }) {
  return (
    <Card padding="none" className="p-6 sm:p-8" overflow>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-extrabold text-heading" style={{ letterSpacing: '-0.3px' }}>Experience</h2>
        {experiences.length > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
              </svg>
            }
            onClick={onAdd}
          >
            Add experience
          </Button>
        ) : null}
      </div>

      {experiences.length === 0 ? (
        <button
          onClick={onAdd}
          className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-token rounded-xl text-subtle hover:border-primary/40 hover:text-primary transition-colors"
        >
          <span className="text-sm font-semibold">Add your work experience</span>
        </button>
      ) : (
        <div>
          {experiences.map(exp => <ExperienceCard key={exp.id} exp={exp} onEdit={onEdit} />)}
        </div>
      )}
    </Card>
  );
}
