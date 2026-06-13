'use client';

import { useEffect } from 'react';
import Button from '@/src/components/ui/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSave?: () => void;
  isSaving?: boolean;
  isDirty?: boolean;
}

export default function ProfileModal({ isOpen, onClose, title, children, onSave, isSaving, isDirty }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-modal flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-[800px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-token bg-surface">
          <h2 id="profile-modal-title" className="text-xl font-extrabold text-heading tracking-[-0.3px]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-subtle hover:text-muted transition-colors bg-surface-alt hover:bg-surface-hover rounded-full p-1.5"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-alt">
          {children}
        </div>

        {/* Footer */}
        {onSave && (
          <div className="p-4 border-t border-token bg-surface flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={isSaving}
              disabled={isDirty === false}
              className="px-6 font-bold"
              onClick={onSave}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
