'use client';

/**
 * useRealtimeReferrals — listens for referral:update socket events
 * and surfaces them as toast notifications + React Query invalidation.
 *
 * Mount once alongside useSocketConnection (in ChatLayout or a shared provider).
 */

import { useEffect, useRef } from 'react';
import { useQueryClient }    from '@tanstack/react-query';
import { getSocket }         from './socketClient';
import { EVENTS }            from './socketEvents';
import { referralKeys }      from '@/features/referrals/hooks';

export interface ReferralUpdatePayload {
  id:          number;
  status:      string;
  title:       string;
  message:     string;
  job_title:   string | null;
  company:     string | null;
  timeline:    unknown[];
  updated_at:  string;
}

type ToastFn = (msg: string, variant?: 'success' | 'error' | 'info' | 'warning') => void;

export function useRealtimeReferrals(showToast?: ToastFn) {
  const qc  = useQueryClient();
  const ref = useRef(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || ref.current) return;

    ref.current = true;

    socket.on(EVENTS.REFERRAL_UPDATE, (payload: ReferralUpdatePayload) => {
      // Show toast
      const variant = payload.status === 'rejected' ? 'error'
        : payload.status === 'hired' || payload.status === 'paid' ? 'success'
        : 'info';

      showToast?.(payload.title + (payload.company ? ` — ${payload.company}` : ''), variant);

      // Invalidate referral queries so inbox refreshes
      qc.invalidateQueries({ queryKey: referralKeys.all() });
    });

    return () => {
      ref.current = false;
      socket.off(EVENTS.REFERRAL_UPDATE);
    };
  }, [showToast, qc]);
}
