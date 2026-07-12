'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RecruiterShell } from '@/layout/shell';
import { useTalentPoolQuery, useRemoveFromPoolMutation, useBulkMessageMutation } from '@/features/recruiter/hooks';
import type { SavedCandidateEntry, CandidateCard } from '../types/candidateSearch.types';
import CandidateProfileDrawer from './CandidateProfileDrawer';

function Avatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  if (photoUrl) return <img src={photoUrl} alt={name} className="w-9 h-9 rounded-full object-cover border border-token shrink-0" />;
  const initials = name.split(' ').slice(0, 2).map(p => p[0] ?? '').join('').toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center bg-primary/10 text-primary font-extrabold text-sm">
      {initials}
    </div>
  );
}

function BulkMessageModal({
  selectedIds,
  onClose,
}: {
  selectedIds: string[];
  onClose: () => void;
}) {
  const [message, setMessage] = useState('');
  const [result, setResult]   = useState<{ sent: number; skipped: number } | null>(null);
  const bulk = useBulkMessageMutation();

  async function handleSend() {
    const data = await bulk.mutateAsync({ candidate_ids: selectedIds, message });
    setResult({ sent: data.sent.length, skipped: data.skipped.length });
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-extrabold text-heading">Message candidates</h2>
            <p className="text-sm text-subtle mt-0.5">{selectedIds.length} recipient{selectedIds.length !== 1 ? 's' : ''} selected</p>
          </div>
          <button onClick={onClose} className="text-subtle hover:text-muted transition-colors" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {result ? (
          <div className="text-center space-y-3 py-4">
            <p className="text-2xl font-black text-heading">{result.sent} sent</p>
            {result.skipped > 0 && (
              <p className="text-sm text-subtle">{result.skipped} skipped (not visible or error)</p>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:brightness-110"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <textarea
              autoFocus
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write your message here…"
              rows={5}
              maxLength={4000}
              className="w-full text-sm border border-token rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
            <p className="text-micro text-subtle text-right">{message.length}/4000</p>
            {bulk.isError && (
              <p className="text-sm text-danger">Failed to send. Please try again.</p>
            )}
            <div className="flex gap-3 justify-end">
              <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold border border-token hover:border-primary/30 text-muted">Cancel</button>
              <button
                onClick={handleSend}
                disabled={!message.trim() || bulk.isPending}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:brightness-110 disabled:opacity-50"
              >
                {bulk.isPending ? 'Sending…' : `Send to ${selectedIds.length}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PoolRow({
  entry,
  selected,
  onSelect,
  onView,
  onRemove,
  removing,
}: {
  entry:    SavedCandidateEntry;
  selected: boolean;
  onSelect: (id: string) => void;
  onView:   (id: string) => void;
  onRemove: () => void;
  removing: boolean;
}) {
  if (!entry.candidate.available) {
    return (
      <tr className="border-b border-token last:border-0 opacity-60">
        <td className="px-4 py-3.5" />
        <td className="px-4 py-3.5" colSpan={4}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-surface-hover shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-muted">Candidate no longer available</p>
              <p className="text-micro text-subtle mt-0.5">Turned off recruiter visibility or was suspended.</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3.5 text-center">
          <button
            onClick={onRemove}
            disabled={removing}
            className="text-caption font-bold text-danger hover:underline disabled:opacity-50 whitespace-nowrap"
          >
            Remove
          </button>
        </td>
      </tr>
    );
  }

  const c = entry.candidate as CandidateCard & { available: true };

  return (
    <tr className={`border-b border-token last:border-0 hover:bg-surface-alt transition-colors ${selected ? 'bg-primary/5' : ''}`}>
      <td className="text-center px-2 py-3.5 w-[32px]">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(c.id)}
          className="w-4 h-4 shrink-0 accent-primary cursor-pointer"
          aria-label={`Select ${c.name}`}
        />
      </td>
      <td className="px-3 py-3.5 w-[30%]">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={c.name} photoUrl={c.profile_photo_url} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-heading truncate">{c.name}</span>
              {c.open_to_work && (
                <span className="text-[10px] font-bold rounded-full py-[2px] px-2 bg-green-50 text-green-700 shrink-0">Open to work</span>
              )}
            </div>
            {c.title && <p className="text-xs text-muted truncate">{c.title}</p>}
          </div>
        </div>
      </td>
      <td className="px-2 py-3.5 text-sm text-body-secondary whitespace-nowrap w-[8%]">
        {c.experience_years === 0 ? 'Fresher' : `${c.experience_years} yrs`}
      </td>
      <td className="px-2 py-3.5 text-center w-[26%]">
        {c.skills.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-1">
            {c.skills.slice(0, 3).map(s => (
              <span key={s} className="text-micro font-semibold rounded-full py-[2px] px-2 bg-surface-hover text-body-secondary whitespace-nowrap">
                {s}
              </span>
            ))}
            {c.skills.length > 3 && (
              <span className="text-micro font-semibold rounded-full py-[2px] px-2 bg-surface-alt text-subtle whitespace-nowrap">
                +{c.skills.length - 3}
              </span>
            )}
          </div>
        ) : (
          <span className="text-subtle">—</span>
        )}
      </td>
      <td className="px-2 py-3.5 text-sm text-body-secondary text-center truncate w-[14%]">{c.location || '—'}</td>
      <td className="px-3 py-3.5 w-[18%]">
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <button
            onClick={() => onView(c.id)}
            className="shrink-0 text-caption font-bold text-primary hover:underline text-center"
          >
            View
          </button>
          <Link
            href={`/recruiter/chat?candidateId=${c.id}`}
            className="shrink-0 text-caption font-bold text-primary hover:underline text-center"
          >
            Message
          </Link>
          <button
            onClick={onRemove}
            disabled={removing}
            className="shrink-0 text-caption font-bold text-danger hover:underline disabled:opacity-50 text-center"
          >
            Remove
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function RecruiterTalentPoolPage() {
  const [listFilter, setListFilter]         = useState('');
  const [page, setPage]                     = useState(1);
  const [selectedIds, setSelectedIds]       = useState<Set<string>>(new Set());
  const [activeCandidateId, setActiveCandidateId] = useState<string | null>(null);
  const [showBulkModal, setShowBulkModal]   = useState(false);
  const [removingId, setRemovingId]         = useState<number | null>(null);

  const { data, isLoading, isError } = useTalentPoolQuery({
    list_name: listFilter || undefined,
    page,
    limit: 20,
  });
  const remove = useRemoveFromPoolMutation();

  const entries    = data?.candidates ?? [];
  const listNames  = data?.list_names ?? [];
  const pagination = data?.pagination;

  function toggleSelect(candidateId: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(candidateId)) next.delete(candidateId);
      else next.add(candidateId);
      return next;
    });
  }

  function toggleSelectAll() {
    const availableIds = entries
      .filter(e => e.candidate.available)
      .map(e => e.candidate.id);
    const allSelected = availableIds.every(id => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(availableIds));
    }
  }

  async function handleRemove(entry: SavedCandidateEntry) {
    setRemovingId(entry.save_id);
    try {
      await remove.mutateAsync({
        candidateId: entry.candidate.id,
        listName:    listFilter || entry.list_name,
      });
      setSelectedIds(prev => { const next = new Set(prev); next.delete(entry.candidate.id); return next; });
    } finally {
      setRemovingId(null);
    }
  }

  const selectedArr = [...selectedIds];
  const availableIds = entries.filter(e => e.candidate.available).map(e => e.candidate.id);
  const allSelected  = availableIds.length > 0 && availableIds.every(id => selectedIds.has(id));

  return (
    <RecruiterShell>
      <div className="min-h-screen bg-surface-alt">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-7">

          {/* Back */}
          <Link
            href="/recruiter/candidates"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-body transition-colors mb-4"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </Link>

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
            <div>
              <h1 className="text-2xl font-extrabold text-heading" style={{ letterSpacing: '-0.3px' }}>Talent Pool</h1>
              {pagination && (
                <p className="text-sm text-subtle mt-0.5">{pagination.total} saved candidate{pagination.total !== 1 ? 's' : ''}</p>
              )}
            </div>
            {selectedArr.length > 0 && (
              <button
                onClick={() => setShowBulkModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:brightness-110 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Message {selectedArr.length} selected
              </button>
            )}
          </div>

          {/* List filter tabs */}
          {listNames.length > 0 && (
            <div className="flex gap-2 mb-5 flex-wrap">
              <button
                onClick={() => { setListFilter(''); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${!listFilter ? 'bg-primary text-white' : 'bg-surface border border-token text-muted hover:border-primary/30'}`}
              >
                All lists
              </button>
              {listNames.map(ln => (
                <button
                  key={ln}
                  onClick={() => { setListFilter(ln); setPage(1); setSelectedIds(new Set()); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${listFilter === ln ? 'bg-primary text-white' : 'bg-surface border border-token text-muted hover:border-primary/30'}`}
                >
                  {ln}
                </button>
              ))}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-surface rounded-2xl border border-token p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-hover shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-surface-hover rounded-full w-1/3" />
                      <div className="h-3 bg-surface-hover rounded-full w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div className="bg-surface rounded-2xl border border-danger p-8 text-center">
              <p className="text-base text-danger font-semibold">Failed to load talent pool.</p>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && entries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-hover flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-subtle">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-base font-semibold text-heading mb-1">No saved candidates</p>
              <p className="text-sm text-subtle max-w-xs">
                {listFilter ? `No candidates in "${listFilter}".` : 'Save candidates from search results to build your talent pool.'}
              </p>
              <a href="/recruiter/candidates" className="mt-4 text-sm font-bold text-primary hover:underline">Search candidates →</a>
            </div>
          )}

          {/* Table */}
          {!isLoading && !isError && entries.length > 0 && (
            <div className="bg-surface rounded-2xl border border-token shadow-sm overflow-x-auto">
              <table className="w-full table-fixed min-w-[760px]">
                <thead className="bg-surface-alt/60">
                  <tr>
                    <th className="text-center px-2 py-3 w-[32px]">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 accent-primary cursor-pointer"
                        aria-label="Select all"
                      />
                    </th>
                    <th className="text-left text-micro font-bold text-subtle uppercase tracking-wide px-3 py-3 w-[30%]">Candidate</th>
                    <th className="text-left text-micro font-bold text-subtle uppercase tracking-wide px-2 py-3 w-[8%]">Level</th>
                    <th className="text-center text-micro font-bold text-subtle uppercase tracking-wide px-2 py-3 w-[26%]">Skill</th>
                    <th className="text-center text-micro font-bold text-subtle uppercase tracking-wide px-2 py-3 w-[14%]">Location</th>
                    <th className="text-center text-micro font-bold text-subtle uppercase tracking-wide px-3 py-3 w-[18%]">
                      {selectedArr.length > 0 ? `${selectedArr.length} selected` : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => (
                    <PoolRow
                      key={entry.save_id}
                      entry={entry}
                      selected={selectedIds.has(entry.candidate.id)}
                      onSelect={toggleSelect}
                      onView={setActiveCandidateId}
                      onRemove={() => handleRemove(entry)}
                      removing={removingId === entry.save_id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-subtle">Page {pagination.page} of {pagination.pages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="text-sm font-semibold px-4 py-2 rounded-xl border border-token disabled:opacity-40 hover:border-primary/40 hover:text-primary transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="text-sm font-semibold px-4 py-2 rounded-xl border border-token disabled:opacity-40 hover:border-primary/40 hover:text-primary transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showBulkModal && (
        <BulkMessageModal
          selectedIds={selectedArr}
          onClose={() => { setShowBulkModal(false); setSelectedIds(new Set()); }}
        />
      )}

      <CandidateProfileDrawer
        candidateId={activeCandidateId}
        onClose={() => setActiveCandidateId(null)}
      />
    </RecruiterShell>
  );
}
