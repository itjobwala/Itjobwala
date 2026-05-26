'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams }       from 'next/navigation';
import { useQueryClient }        from '@tanstack/react-query';
import ChatSidebar               from './ChatSidebar';
import ChatWindowLayout          from './ChatWindowLayout';
import Toast                     from '@/src/components/ui/Toast';
import { useToast }              from '@/src/hooks/useToast';
import { useSocketConnection }   from '../../socket/useSocketConnection';
import { useRealtimeReferrals }  from '../../socket/useRealtimeReferrals';
import { useSocketStore }        from '../../socket/socketStore';
import { useConversationsQuery, chatKeys } from '../../hooks';
import type { Conversation }     from '../../types/chat.types';

interface Props {
  myId: number;
}

export default function ChatLayout({ myId }: Props) {
  const [activeConv,  setActiveConv]  = useState<Conversation | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { toast, show: showToast, dismiss } = useToast();
  const qc          = useQueryClient();
  const resetUnread = useSocketStore(s => s.resetUnread);

  useSocketConnection();
  useRealtimeReferrals(showToast);

  const { data }       = useConversationsQuery();

  // Clear unread badge immediately when user opens a conversation
  const handleSelectConv = useCallback((conv: Conversation) => {
    setActiveConv(conv);
    setSidebarOpen(false);
    // Optimistically zero the unread count in the RQ cache
    qc.setQueryData(chatKeys.conversations(), (old: any) => {
      if (!old?.conversations) return old;
      return {
        ...old,
        conversations: old.conversations.map((c: any) =>
          c.id === conv.id ? { ...c, unread_count: 0 } : c
        ),
      };
    });
    // Clear socket store counter too
    resetUnread(conv.id);
  }, [qc, resetUnread]);

  // Keep the active conversation's unread badge at zero even after refetches
  // triggered by incoming socket messages (which temporarily set unread_count > 0)
  useEffect(() => {
    if (!activeConv || !data?.conversations) return;
    const live = data.conversations.find(c => c.id === activeConv.id);
    if (live && live.unread_count > 0) {
      qc.setQueryData(chatKeys.conversations(), (old: any) => {
        if (!old?.conversations) return old;
        return {
          ...old,
          conversations: old.conversations.map((c: any) =>
            c.id === activeConv.id ? { ...c, unread_count: 0 } : c
          ),
        };
      });
    }
  }, [data, activeConv?.id, qc]);

  // Auto-open a specific conversation when ?conv=<id> is present in the URL
  // (used when navigating from applicant detail → "Message Candidate")
  const searchParams   = useSearchParams();
  const preselectedId  = Number(searchParams.get('conv') ?? 0) || null;
  const didAutoSelect  = useRef(false);

  useEffect(() => {
    if (!preselectedId || didAutoSelect.current || !data?.conversations) return;
    const conv = data.conversations.find(c => c.id === preselectedId);
    if (conv) {
      handleSelectConv(conv);
      didAutoSelect.current = true;
      // Strip the ?conv param without a full navigation
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('conv');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [preselectedId, data]);

  return (
    <div className="flex w-full h-full overflow-hidden">
      <ChatSidebar
        activeId={activeConv?.id ?? null}
        onSelect={handleSelectConv}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
      <ChatWindowLayout
        conversation={activeConv}
        myId={myId}
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      {/* Global toast for referral notifications */}
      <Toast
        message={toast.message}
        variant={toast.variant}
        visible={toast.visible}
        onDismiss={dismiss}
      />
    </div>
  );
}
