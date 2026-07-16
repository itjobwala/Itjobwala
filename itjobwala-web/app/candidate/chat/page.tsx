'use client';

import { useMemo, Suspense } from 'react';
import { SmartNavbar }     from '@/layout/navbar';
import { ProtectedRoute }  from '@/features/auth';
import { ChatLayout }      from '@/features/chat';
import { useAuthStore }    from '@/src/features/auth/session/auth.store';
import { decodeJwtPayload } from '@/src/lib/auth';

export default function ChatPage() {
  const { accessToken } = useAuthStore();
  const myId = useMemo(() => {
    if (!accessToken) return 0;
    const payload = decodeJwtPayload(accessToken);
    return parseInt(String(payload?.sub ?? '0'), 10);
  }, [accessToken]);

  return (
    <ProtectedRoute>
      <div className="h-screen bg-[#f8fafc] flex flex-col overflow-hidden">
        <SmartNavbar />

        <div className="pt-16 lg:pt-[72px] flex-1 flex flex-col min-h-0">
          <div className="flex-1 flex flex-col min-h-0 w-full container-responsive mx-auto">
            {/* Chat — fill remaining height */}
            <div className="flex-1 flex min-h-0">
              <Suspense>
                <ChatLayout myId={myId} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
