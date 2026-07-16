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
        className="w-9 h-9 rounded-full object-cover shrink-0 border border-token"
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
    <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center bg-primary/10 text-primary font-extrabold text-sm">
      {initials}
    </div>
  );
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
        className="w-full text-sm border border-token rounded-lg px-2 py-1.5 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />
      <input
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Note (optional)"
        className="w-full text-sm border border-token rounded-lg px-2 py-1.5 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
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

  return (
    <tr className={`border-b border-token last:border-0 hover:bg-surface-alt transition-colors ${selected ? 'bg-primary/5' : ''}`}>
      <td className="text-center px-2 py-3.5 w-[5%]">
        {onSelect && (
          <input
            type="checkbox"
            checked={!!selected}
            onChange={() => onSelect(candidate.id)}
            className="w-4 h-4 shrink-0 accent-primary cursor-pointer"
            aria-label={`Select ${candidate.name}`}
          />
        )}
      </td>
      <td className="px-3 py-3.5 w-[30%]">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={candidate.name} photoUrl={candidate.profile_photo_url} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-heading truncate">{candidate.name}</span>
              {candidate.open_to_work && (
                <span className="text-[10px] font-bold rounded-full py-[2px] px-2 bg-green-50 text-green-700 shrink-0">Open to work</span>
              )}
            </div>
            {candidate.title && <p className="text-xs text-muted truncate">{candidate.title}</p>}
          </div>
        </div>
      </td>
      <td className="px-2 py-3.5 text-small-text text-body-secondary whitespace-nowrap w-[10%]">
        {candidate.experience_years === 0 ? 'Fresher' : `${candidate.experience_years} yrs`}
      </td>
      <td className="px-2 py-3.5 text-center w-[16%]">
        {candidate.skills.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-1">
            {candidate.skills.slice(0, 3).map(s => (
              <span key={s} className="text-micro font-semibold rounded-full py-[2px] px-2 bg-surface-hover text-body-secondary whitespace-nowrap">
                {s}
              </span>
            ))}
            {candidate.skills.length > 3 && (
              <span className="text-micro font-semibold rounded-full py-[2px] px-2 bg-surface-alt text-subtle whitespace-nowrap">
                +{candidate.skills.length - 3}
              </span>
            )}
          </div>
        ) : (
          <span className="text-subtle">—</span>
        )}
      </td>
      <td className="px-2 py-3.5 text-small-text text-body-secondary text-center truncate w-[11%]">{candidate.location || '—'}</td>
      <td className="px-3 py-3.5 w-[28%] relative">
        <div className="flex items-center justify-center gap-1.5">
          <Button variant="primary" size="sm" onClick={() => onView(candidate.id)} className="shrink-0 whitespace-nowrap cursor-pointer">
            View profile
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowSave(v => !v)} className="shrink-0 whitespace-nowrap cursor-pointer" aria-label="Save to talent pool">
            + Save
          </Button>
          {showSave && (
            <SavePopover candidateId={candidate.id} onClose={() => setShowSave(false)} />
          )}
        </div>
      </td>
    </tr>
  );
}
