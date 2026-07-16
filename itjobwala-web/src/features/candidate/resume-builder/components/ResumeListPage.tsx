'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SmartNavbar } from '@/layout/navbar';
import { ProtectedRoute } from '@/features/auth';
import Button from '@/src/components/ui/Button';
import {
  useResumesQuery,
  useCreateResumeMutation,
  useDeleteResumeMutation,
  usePrefillQuery,
} from '../hooks/useResumeBuilder';
import { BLANK_CONTENT } from '../types/resumeBuilder.types';

const TEMPLATE_LABEL: Record<string, string> = { modern: 'Modern', compact: 'Compact' };

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

export function ResumeListPage() {
  const router = useRouter();
  const { data: resumes = [], isLoading } = useResumesQuery();
  const createMutation = useCreateResumeMutation();
  const deleteMutation = useDeleteResumeMutation();

  const [prefillEnabled, setPrefillEnabled] = useState(false);
  const { data: prefillContent, isFetching: prefillLoading } = usePrefillQuery(prefillEnabled);

  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleCreateBlank() {
    setCreating(true);
    try {
      const doc = await createMutation.mutateAsync({
        title:    'Untitled Resume',
        template: 'modern',
        content:  BLANK_CONTENT,
      });
      router.push(`/candidate/resume-builder/${doc.id}`);
    } finally {
      setCreating(false);
    }
  }

  async function handleCreateFromProfile() {
    if (!prefillEnabled) {
      setPrefillEnabled(true);
      return;
    }
    if (!prefillContent || prefillLoading) return;
    setCreating(true);
    try {
      const doc = await createMutation.mutateAsync({
        title:    'My Resume',
        template: 'modern',
        content:  prefillContent,
      });
      router.push(`/candidate/resume-builder/${doc.id}`);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this resume?')) return;
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  }

  const busy = creating || prefillLoading;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface-alt">
        <SmartNavbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pt-20">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-h3 text-heading" style={{ letterSpacing: '-0.5px' }}>
                Resume Builder
              </h3>
              <p className="text-sm text-muted mt-1">Create ATS-friendly PDF resumes from your profile data.</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={handleCreateBlank}
              >
                + Blank
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={busy}
                loading={prefillLoading}
                onClick={handleCreateFromProfile}
              >
                + From my profile
              </Button>
            </div>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map(i => (
                <div key={i} className="h-20 bg-surface rounded-2xl border border-token" />
              ))}
            </div>
          ) : resumes.length === 0 ? (
            <div className="bg-surface rounded-2xl border border-token p-10 text-center">
              <p className="text-sm font-semibold text-heading mb-1">No resumes yet</p>
              <p className="text-sm text-muted">Start with your profile data or a blank template.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map(doc => (
                <div
                  key={doc.id}
                  className="bg-surface rounded-2xl border border-token px-5 py-4 flex items-center justify-between hover:border-blue-200 transition-colors"
                >
                  <button
                    onClick={() => router.push(`/candidate/resume-builder/${doc.id}`)}
                    className="flex-1 text-left"
                  >
                    <p className="text-base font-bold text-heading">{doc.title}</p>
                    <p className="text-micro text-subtle mt-0.5">
                      {TEMPLATE_LABEL[doc.template] ?? doc.template} · Last edited {fmtDate(doc.updated_at)}
                    </p>
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="ml-4 text-subtle hover:text-danger transition-colors text-xl leading-none disabled:opacity-40"
                    title="Delete resume"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
