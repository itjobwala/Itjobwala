'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Modal from '@/src/components/ui/Modal';
import Button from '@/src/components/ui/Button';
import { submitReport } from '../services/report.api';
import { REPORT_REASONS } from '../types/report.types';
import type { ReportTargetType } from '../types/report.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: number;
  targetLabel?: string;
}

export default function ReportModal({ isOpen, onClose, targetType, targetId, targetLabel }: Props) {
  const [reason, setReason]   = useState('');
  const [details, setDetails] = useState('');
  const [done, setDone]       = useState(false);

  const mutation = useMutation({
    mutationFn: () => submitReport({ target_type: targetType, target_id: targetId, reason, details: details.trim() || undefined }),
    onSuccess: () => setDone(true),
  });

  function handleClose() {
    setReason('');
    setDetails('');
    setDone(false);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} titleId="report-modal-title">
      <div className="p-6 space-y-4">
        {done ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 id="report-modal-title" className="text-base font-bold text-heading">Report submitted</h2>
            <p className="text-sm text-muted">Thank you — our team will review it shortly.</p>
            <Button variant="primary" fullWidth rounded="xl" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <h2 id="report-modal-title" className="text-base font-bold text-heading">
              Report {targetLabel ? `"${targetLabel}"` : `this ${targetType}`}
            </h2>
            <p className="text-sm text-muted">
              Help us keep ITJobwala safe. Select a reason and optionally add more details.
            </p>

            <div>
              <label className="block text-sm font-semibold text-body mb-1.5">
                Reason <span className="text-red-500">*</span>
              </label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full border border-token rounded-xl px-3 py-2.5 text-sm text-heading outline-none focus:border-blue-500 bg-surface"
              >
                <option value="">Select a reason…</option>
                {REPORT_REASONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-body mb-1.5">
                Additional details <span className="text-subtle font-normal">(optional)</span>
              </label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Describe what you noticed…"
                rows={3}
                maxLength={2000}
                className="w-full border border-token rounded-xl px-3 py-2 text-sm text-body outline-none focus:border-blue-500 resize-none"
              />
              <p className="text-right text-micro text-subtle mt-0.5">{details.length}/2000</p>
            </div>

            {mutation.isError && (
              <p className="text-sm text-red-600">
                {mutation.error instanceof Error ? mutation.error.message : 'Failed to submit report. Please try again.'}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                rounded="xl"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                rounded="xl"
                loading={mutation.isPending}
                disabled={!reason || mutation.isPending}
                onClick={() => mutation.mutate()}
                className="flex-1"
              >
                Submit Report
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
