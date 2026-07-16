'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCandidateDetailQuery, useSaveCandidateMutation } from '@/features/recruiter/hooks';
import type { CandidateDetail } from '../types/candidateSearch.types';

interface Props {
  candidateId: string | null;
  onClose: () => void;
}

function Avatar({ detail }: { detail: CandidateDetail }) {
  if (detail.profile_photo_url) {
    return (
      <img
        src={detail.profile_photo_url}
        alt={detail.name}
        className="w-16 h-16 rounded-2xl object-cover border border-token"
      />
    );
  }
  const initials = detail.name.split(' ').slice(0, 2).map(p => p[0] ?? '').join('').toUpperCase();
  return (
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-primary/10 text-primary font-extrabold text-3xl">
      {initials}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-micro font-extrabold text-subtle uppercase tracking-[1.2px] mb-2">{title}</h3>
      {children}
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number | null }) {
  if (value == null) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="text-caption text-muted w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-surface-hover rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-caption font-bold text-heading w-8 text-right">{value}</span>
    </div>
  );
}

function DrawerContent({ detail, onClose }: { detail: CandidateDetail; onClose: () => void }) {
  const chatUrl = `/recruiter/chat?candidateId=${detail.id}`;
  const [listName, setListName] = useState('Shortlist');
  const [note, setNote]         = useState('');
  const [showSave, setShowSave] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const save = useSaveCandidateMutation();

  async function handleSave() {
    try {
      await save.mutateAsync({ candidate_id: detail.id, list_name: listName || 'Shortlist', note: note || undefined });
      setSavedMsg('Saved to pool!');
      setShowSave(false);
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSavedMsg(msg ?? 'Error saving');
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-5 border-b border-token shrink-0">
        <div className="flex items-start gap-3">
          <Avatar detail={detail} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-heading">{detail.name}</h2>
              {detail.open_to_work && (
                <span className="text-[10px] font-bold rounded-full py-[2px] px-2 bg-green-50 text-green-700">
                  Open to work
                </span>
              )}
            </div>
            {detail.title && (
              <p className="text-sm text-muted mt-0.5">{detail.title}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-1 text-caption text-subtle">
              {detail.location && <span>{detail.location}</span>}
              {detail.experience_years != null && (
                <span>
                  {detail.experience_years === 0 ? 'Fresher' : `${detail.experience_years} yrs exp`}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-subtle hover:text-muted transition-colors shrink-0 mt-0.5"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">

        {/* About */}
        {detail.about && (
          <Section title="About">
            <p className="text-sm text-body-secondary leading-relaxed">{detail.about}</p>
          </Section>
        )}

        {/* QA Analysis — intentional indigo/purple badges */}
        {(detail.qa_specialization || detail.qa_seniority || detail.career_level) && (
          <Section title="QA Profile">
            <div className="flex flex-wrap gap-2 mb-3">
              {detail.qa_specialization && (
                <span className="text-caption font-semibold rounded-full py-1 px-3 bg-indigo-50 text-indigo-700">
                  {detail.qa_specialization}
                </span>
              )}
              {detail.qa_seniority && (
                <span className="text-caption font-semibold rounded-full py-1 px-3 bg-purple-50 text-purple-700">
                  {detail.qa_seniority}
                </span>
              )}
              {detail.career_level && (
                <span className="text-caption font-semibold rounded-full py-1 px-3 bg-surface-hover text-body-secondary">
                  {detail.career_level}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <ScoreBar label="QA Match"   value={detail.qa_match_score} />
              <ScoreBar label="ATS Score"  value={detail.ats_score} />
              <ScoreBar label="Capability" value={detail.capability_score} />
            </div>
          </Section>
        )}

        {/* Skills */}
        {detail.skills.length > 0 && (
          <Section title="Skills">
            <div className="flex flex-wrap gap-1.5">
              {detail.skills.map(s => (
                <span key={s} className="text-caption font-semibold rounded-full py-[3px] px-3 bg-surface-hover text-body-secondary">
                  {s}
                </span>
              ))}
            </div>

            {/* Skill evidence */}
            {detail.skill_evidence && detail.skill_evidence.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 mb-2">
                  Skill Evidence
                </p>
                {detail.weak_evidence_skills && detail.weak_evidence_skills.length > 0 && (
                  <div className="mb-2 px-3 py-2 rounded-lg text-[11px]"
                    style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#fcd34d' }}>
                    ⚠ Listed without proof: {detail.weak_evidence_skills.join(', ')}
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {detail.skill_evidence
                    .filter(e => e.evidence_level === 'strong' || e.evidence_level === 'very_strong')
                    .slice(0, 8)
                    .map(e => (
                      <span
                        key={e.skill}
                        className="text-[11px] px-2 py-0.5 rounded-lg font-semibold capitalize"
                        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7' }}
                      >
                        ✓ {e.skill}
                      </span>
                    ))}
                  {detail.skill_evidence
                    .filter(e => e.evidence_level === 'weak' && e.evidence_score === 0)
                    .slice(0, 4)
                    .map(e => (
                      <span
                        key={e.skill}
                        className="text-[11px] px-2 py-0.5 rounded-lg font-semibold capitalize"
                        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', color: '#fcd34d' }}
                      >
                        ? {e.skill}
                      </span>
                    ))}
                </div>
                <p className="text-[10px] text-slate-600 mt-1.5">
                  Green = proven in experience · Amber = listed only, unverified
                </p>
              </div>
            )}
          </Section>
        )}

        {/* Strengths — intentional green check icon */}
        {detail.strengths && detail.strengths.length > 0 && (
          <Section title="Strengths">
            <ul className="space-y-1">
              {detail.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-body-secondary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" className="mt-[3px] shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {s}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Areas to improve — intentional amber warning icon */}
        {detail.weaknesses && detail.weaknesses.length > 0 && (
          <Section title="Areas to improve">
            <ul className="space-y-1">
              {detail.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-body-secondary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" className="mt-[3px] shrink-0">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                  </svg>
                  {w}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Details */}
        <Section title="Details">
          <dl className="space-y-2">
            {detail.work_status && (
              <div className="flex gap-2 text-sm">
                <dt className="text-subtle w-32 shrink-0">Work status</dt>
                <dd className="text-heading font-semibold capitalize">{detail.work_status}</dd>
              </div>
            )}
            {detail.availability_to_join && (
              <div className="flex gap-2 text-sm">
                <dt className="text-subtle w-32 shrink-0">Available from</dt>
                <dd className="text-heading font-semibold">
                  {new Date(detail.availability_to_join).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </dd>
              </div>
            )}
            {detail.profile_completion != null && (
              <div className="flex gap-2 text-sm">
                <dt className="text-subtle w-32 shrink-0">Profile</dt>
                <dd className="text-heading font-semibold">{detail.profile_completion}% complete</dd>
              </div>
            )}
          </dl>
        </Section>

        {/* Public links */}
        {(detail.linked_in || detail.github) && (
          <Section title="Links">
            <div className="flex flex-col gap-2">
              {detail.linked_in && (
                <a
                  href={detail.linked_in}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary font-semibold hover:underline truncate"
                >
                  LinkedIn ↗
                </a>
              )}
              {detail.github && (
                <a
                  href={detail.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary font-semibold hover:underline truncate"
                >
                  GitHub ↗
                </a>
              )}
            </div>
          </Section>
        )}
      </div>

      {/* Footer CTA */}
      <div className="p-5 border-t border-token shrink-0 space-y-3">
        {savedMsg && (
          <p className={`text-sm font-semibold text-center ${savedMsg.startsWith('Error') || savedMsg.startsWith('Already') ? 'text-danger' : 'text-success'}`}>
            {savedMsg}
          </p>
        )}
        {showSave && (
          <div className="border border-token rounded-xl p-3 space-y-2">
            <p className="text-micro font-extrabold text-subtle uppercase tracking-wide">Save to talent pool</p>
            <input
              autoFocus
              value={listName}
              onChange={e => setListName(e.target.value)}
              placeholder="List name (e.g. Shortlist)"
              className="w-full text-sm border border-token rounded-lg px-2 py-1.5 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="w-full text-sm border border-token rounded-lg px-2 py-1.5 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowSave(false)} className="text-xs text-subtle px-3 py-1.5 rounded-lg hover:bg-surface-hover">Cancel</button>
              <button
                onClick={handleSave}
                disabled={save.isPending}
                className="text-xs font-bold text-white px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                {save.isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => setShowSave(v => !v)}
            className="flex-1 text-sm font-semibold px-4 py-3 rounded-xl border border-token hover:border-primary/40 hover:text-primary transition-colors"
          >
            {showSave ? 'Cancel save' : '+ Save to pool'}
          </button>
          <Link
            href={chatUrl}
            className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white font-bold text-sm rounded-xl px-4 py-3 hover:brightness-110 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Message
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CandidateProfileDrawer({ candidateId, onClose }: Props) {
  const { data, isLoading, isError } = useCandidateDetailQuery(candidateId ?? '', !!candidateId);

  useEffect(() => {
    if (!candidateId) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [candidateId, onClose]);

  if (!candidateId) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/25 z-[200] backdrop-blur-[2px]"
        onClick={onClose}
      />

      <aside className="fixed top-0 right-0 bottom-0 w-full max-w-[440px] bg-surface z-[210] shadow-2xl flex flex-col overflow-hidden">
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin text-primary">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
          </div>
        )}
        {isError && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-base text-muted">Could not load candidate profile.</p>
            <button onClick={onClose} className="text-sm font-semibold text-primary hover:underline">Close</button>
          </div>
        )}
        {data && <DrawerContent detail={data} onClose={onClose} />}
      </aside>
    </>
  );
}
