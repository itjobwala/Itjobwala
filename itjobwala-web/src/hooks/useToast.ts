'use client';

import { useState, useCallback, useRef } from 'react';
import type { ToastVariant } from '@/src/components/ui/Toast';

export interface ToastState {
  message: string;
  variant: ToastVariant;
  visible: boolean;
}

const AUTO_DISMISS_MS: Record<ToastVariant, number> = {
  success: 3000,
  error:   4000,
  warning: 4000,
  info:    3000,
};

export function useToast() {
  const [toast, setToast] = useState<ToastState>({ message: '', variant: 'success', visible: false });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, variant: ToastVariant = 'success', ms?: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, variant, visible: true });
    const delay = ms ?? AUTO_DISMISS_MS[variant];
    timerRef.current = setTimeout(() => setToast(s => ({ ...s, visible: false })), delay);
  }, []);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(s => ({ ...s, visible: false }));
  }, []);

  return { toast, show, dismiss };
}
