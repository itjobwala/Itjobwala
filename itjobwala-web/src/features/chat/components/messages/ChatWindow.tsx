'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useMessagesQuery } from '../../hooks';
import { groupMessages }    from '../../utils/messageGrouping';
import MessageGroup         from './MessageGroup';
import TypingIndicator      from './TypingIndicator';
import { safeEmit }         from '../../socket/socketClient';
import { EVENTS }           from '../../socket/socketEvents';
import { useAuthStore }     from '@/src/features/auth/session/auth.store';
import type { Conversation } from '../../types/chat.types';

interface Props {
  conversation: Conversation;
  myId:         number;
  isTyping?:    boolean;
}

export default function ChatWindow({ conversation, myId, isTyping }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const myRole    = useAuthStore(s => s.role) ?? 'candidate';

  const { data, fetchPreviousPage, hasPreviousPage, isFetchingPreviousPage } =
    useMessagesQuery(conversation.id);

  const allMessages = (data?.pages ?? []).flatMap(p => p.messages);
  const groups      = groupMessages(allMessages);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages.length]);

  // Emit message:read for any messages that arrive while the window is open
  // so the sender's tick turns blue immediately without a page refresh
  const lastReadCountRef = useRef(0);
  useEffect(() => {
    const hasNewFromOther = allMessages.some(
      (m, i) => i >= lastReadCountRef.current && !(m.sender_id === myId && m.sender_role === myRole) && !m.is_read
    );
    if (hasNewFromOther) {
      safeEmit(EVENTS.MESSAGE_READ, { conversation_id: conversation.id });
    }
    lastReadCountRef.current = allMessages.length;
  }, [allMessages.length, conversation.id, myId]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop < 80 && hasPreviousPage && !isFetchingPreviousPage) {
      fetchPreviousPage();
    }
  }, [hasPreviousPage, isFetchingPreviousPage, fetchPreviousPage]);

  if (allMessages.length === 0 && !isFetchingPreviousPage) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div>
          <div className="w-14 h-14 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1557FF" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-base font-bold text-heading">Start the conversation</p>
          <p className="text-caption text-muted mt-0.5">Say hello to {conversation.other_party?.name ?? 'them'}!</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col gap-3 scroll-smooth">
      {isFetchingPreviousPage && (
        <div className="text-center py-2">
          <span className="text-micro text-subtle">Loading older messages...</span>
        </div>
      )}

      {groups.map((g, i) => (
        <MessageGroup
          key={i}
          group={g}
          myId={myId}
          myRole={myRole}
          otherParty={conversation.other_party}
        />
      ))}

      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
