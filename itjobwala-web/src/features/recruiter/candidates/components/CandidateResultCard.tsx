'use client';

import { useState } from 'react';
import type { CandidateCard } from '../types/candidateSearch.types';
import Button from '@/src/components/ui/Button';
import { useSaveCandidateMutation } from '@/features/recruiter/hooks';

interface Props {
  candidate: CandidateCard;
  onView: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

function Avatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="w-11 h-11 rounded-xl object-cover shrink-0 border border-token"
      />
    );
  }
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(p => p[0] ?? '')
    .join('')
    .toUpperCase();
  return (
    <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center bg-primary/10 text-primary font-extrabold text-base">
      {initials}
    </div>
  );
}

// INTENTIONAL: seniority level colors are semantic status indicators — do not tokenize
const SENIORITY_COLOR: Record<string, string> = {
  junior:      'bg-green-50 text-green-700',
  mid:         'bg-blue-50 text-blue-700',
  'mid-level': 'bg-blue-50 text-blue-700',
  senior:      'bg-purple-50 text-purple-700',
  lead:        'bg-amber-50 text-amber-700',
  principal:   'bg-rose-50 text-rose-700',
};

function seniorityClass(s: string | null) {
  if (!s) return 'bg-surface-hover text-muted';
  return SENIORITY_COLOR[s.toLowerCase()] ?? 'bg-surface-hover text-muted';
}

function SavePopover({ candidateId, onClose }: { candidateId: string; onClose: () => void }) {
  const [listName, setListName] = useState('Shortlist');
  const [note, setNote]         = useState('');
  const [saved, setSaved]       = useState(false);
  const save = useSaveCandidateMutation();

  async function handleSave() {
    await save.mutateAsync({ candidate_id: candidateId, list_name: listName || 'Shortlist', note: note || undefined });
    setSaved(true);
    setTimeout(onClose, 800);
  }

  if (saved) {
    return (
      <div className="absolute right-0 top-full mt-1 z-20 bg-surface border border-token rounded-xl shadow-lg p-3 text-sm text-success font-semibold whitespace-nowrap">
        Saved!
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-full mt-1 z-20 bg-surface border border-token rounded-xl shadow-lg p-3 w-52 space-y-2">
      <p className="text-micro font-extrabold text-subtle uppercase tracking-wide">Save to pool</p>
      <input
        autoFocus
        value={listName}
        onChange={e => setListName(e.target.value)}
        placeholder="List name"
        className="w-full text-sm border border-token rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />
      <input
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Note (optional)"
        className="w-full text-sm border border-token rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />
      <div className="flex gap-1.5 justify-end">
        <button onClick={onClose} className="text-xs text-subtle px-2 py-1 rounded-lg hover:bg-surface-hover">Cancel</button>
        <button
          onClick={handleSave}
          disabled={save.isPending}
          className="text-xs font-bold text-white px-3 py-1 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50"
        >
          {save.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
      {save.isError && (
        <p className="text-micro text-danger">
          {(save.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error saving'}
        </p>
      )}
    </div>
  );
}

export default function CandidateResultCard({ candidate, onView, selected, onSelect }: Props) {
  const [showSave, setShowSave] = useState(false);
  const SKILLS_SHOWN = 4;
  const visibleSkills = candidate.skills.slice(0, SKILLS_SHOWN);
  const extraSkills   = candidate.skills.length - SKILLS_SHOWN;

  return (
    <div className={`bg-surface rounded-2xl border shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow ${selected ? 'border-primary ring-1 ring-primary/20' : 'border-token'}`}>
      <div className="flex items-start gap-3">
        {onSelect && (
          <input
            type="checkbox"
            checked={!!selected}
            onChange={() => onSelect(candidate.id)}
            className="mt-1 w-4 h-4 shrink-0 accent-primary cursor-pointer"
            aria-label={`Select ${candidate.name}`}
          />
        )}
        <Avatar name={candidate.name} photoUrl={candidate.profile_photo_url} />

        <div className="flex-1 min-w-0">
          {/* Name row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold text-heading truncate">{candidate.name}</span>
            {candidate.open_to_work && (
              <span className="text-[10px] font-bold rounded-full py-[2px] px-2 bg-green-50 text-green-700 shrink-0">
                Open to work
              </span>
            )}
          </div>

          {/* Title + location */}
          {candidate.title && (
            <p className="text-sm text-muted mt-0.5 truncate">{candidate.title}</p>
          )}
          <div className="flex items-center gap-3 mt-1 text-caption text-subtle flex-wrap">
            {candidate.location && (
              <span className="flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 21s-8-7.3-8-12a8 8 0 1 1 16 0c0 4.7-8 12-8 12z" />
                  <circle cx="12" cy="9" r="3" />
                </svg>
                {candidate.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
              {candidate.experience_years === 0 ? 'Fresher' : `${candidate.experience_years} yr${candidate.experience_years !== 1 ? 's' : ''}`}
            </span>
          </div>

          {/* QA badges — intentional indigo/emerald colors */}
          {(candidate.qa_specialization || candidate.qa_seniority || candidate.qa_match_score != null) && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {candidate.qa_specialization && (
                <span className="text-micro font-semibold rounded-full py-[2px] px-2.5 bg-indigo-50 text-indigo-700">
                  {candidate.qa_specialization}
                </span>
              )}
              {candidate.qa_seniority && (
                <span className={`text-micro font-semibold rounded-full py-[2px] px-2.5 ${seniorityClass(candidate.qa_seniority)}`}>
                  {candidate.qa_seniority}
                </span>
              )}
              {candidate.qa_match_score != null && (
                <span className="text-micro font-semibold rounded-full py-[2px] px-2.5 bg-emerald-50 text-emerald-700">
                  QA {candidate.qa_match_score}
                </span>
              )}
            </div>
          )}

          {/* Skills */}
          {visibleSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {visibleSkills.map(s => (
                <span key={s} className="text-micro font-semibold rounded-full py-[2px] px-2 bg-surface-hover text-body-secondary">
                  {s}
                </span>
              ))}
              {extraSkills > 0 && (
                <span className="text-micro font-semibold rounded-full py-[2px] px-2 bg-surface-alt text-subtle">
                  +{extraSkills}
                </span>
              )}
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="shrink-0 flex flex-col gap-1.5 items-end relative">
          <Button variant="ghost" size="sm" onClick={() => onView(candidate.id)}>
            View profile
          </Button>
          <button
            onClick={() => setShowSave(v => !v)}
            className="text-micro font-semibold text-subtle hover:text-primary transition-colors px-1"
            aria-label="Save to talent pool"
          >
            + Save
          </button>
          {showSave && (
            <SavePopover candidateId={candidate.id} onClose={() => setShowSave(false)} />
          )}
        </div>
      </div>
    </div>
  );
}
