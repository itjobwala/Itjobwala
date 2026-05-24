'use client';

import { useEffect } from 'react';
import Toast from '@/src/components/ui/Toast';
import { useToast } from '@/src/hooks/useToast';

export const SESSION_EXPIRED_EVENT = 'session:expired';

export default function SessionExpiredToast() {
  const { toast, show } = useToast();

  useEffect(() => {
    function onSessionExpired() {
      show('Your session expired. Please login again.', 'error', 4000);
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
  }, [show]);

  return <Toast message={toast.message} variant={toast.variant} visible={toast.visible} />;
}
