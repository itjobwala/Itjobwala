'use client';

import { useMemo, Suspense }    from 'react';
import { ProtectedRecruiterRoute } from '@/features/auth';
import { RecruiterShell }       from '@/layout/shell';
import { ChatLayout }           from '@/features/chat';
import { useAuthStore }         from '@/src/features/auth/session/auth.store';
import { decodeJwtPayload }     from '@/src/lib/auth';

export default function RecruiterChatPage() {
  const { accessToken } = useAuthStore();
  const myId = useMemo(() => {
    if (!accessToken) return 0;
    const payload = decodeJwtPayload(accessToken);
    return parseInt(String(payload?.sub ?? '0'), 10);
  }, [accessToken]);

  return (
    <ProtectedRecruiterRoute>
      <RecruiterShell>
        <div className="flex flex-col h-full">
          {/* Chat — fill remaining height */}
          <div className="flex-1 flex min-h-0 border-x border-gray-100">
            <Suspense>
              <ChatLayout myId={myId} />
            </Suspense>
          </div>
        </div>
      </RecruiterShell>
    </ProtectedRecruiterRoute>
  );
}
