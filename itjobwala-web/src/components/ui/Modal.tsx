'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/src/lib/utils/cn';

const MAX_WIDTH = {
  sm:   'max-w-[400px]',
  md:   'max-w-[480px]',
  lg:   'max-w-[800px]',
  full: 'max-w-full',
} as const;

type ModalSize = keyof typeof MAX_WIDTH;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: ModalSize;
  scrollable?: boolean;
  className?: string;
  /** id of the element that labels this dialog (e.g. a heading inside children). */
  titleId?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  scrollable = false,
  className,
  titleId,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (isOpen) panelRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'relative bg-surface rounded-2xl shadow-overlay w-full outline-none',
          MAX_WIDTH[size],
          scrollable && 'max-h-[90vh] flex flex-col overflow-hidden',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
