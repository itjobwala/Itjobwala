'use client';

import { useState, useRef, useCallback } from 'react';
import Button from '@/src/components/ui/Button';
import { useSendMessageMutation } from '../../hooks';
import { safeEmit }              from '../../socket/socketClient';
import { EVENTS }                from '../../socket/socketEvents';
import { useAuthStore }          from '@/src/features/auth/session/auth.store';
import type { SenderRole }       from '../../types/chat.types';

interface Props {
  conversationId: number;
  myId:           number;
  disabled?:      boolean;
}

export default function ChatInput({ conversationId, myId, disabled }: Props) {
  const [text, setText]         = useState('');
  const typingRef               = useRef(false);
  const typingTimer             = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const myRole                  = (useAuthStore(s => s.role) ?? 'candidate') as SenderRole;
  const sendMutation            = useSendMessageMutation(conversationId, myId, myRole);

  const stopTyping = useCallback(() => {
    if (typingRef.current) {
      typingRef.current = false;
      safeEmit(EVENTS.TYPING_STOP, { conversation_id: conversationId });
    }
  }, [conversationId]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    if (!typingRef.current) {
      typingRef.current = true;
      safeEmit(EVENTS.TYPING_START, { conversation_id: conversationId });
    }

    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(stopTyping, 3000);
  }, [conversationId, stopTyping]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || sendMutation.isPending || disabled) return;

    stopTyping();
    clearTimeout(typingTimer.current);

    sendMutation.mutate(trimmed, {
      onSuccess: () => setText(''),
    });
  }, [text, sendMutation, disabled, stopTyping]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div className="border-t border-token bg-surface px-4 py-3 shrink-0">
      <div className="flex items-end gap-3 bg-surface-alt border border-token rounded-2xl px-4 py-2.5 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent text-[13.5px] text-heading resize-none focus:outline-none placeholder:text-subtle max-h-32 overflow-y-auto leading-[1.5]"
          style={{ fieldSizing: 'content' } as any}
        />
        <Button
          variant="primary"
          size="lg"
          iconOnly
          rounded="xl"
          loading={sendMutation.isPending}
          disabled={!text.trim() || sendMutation.isPending || disabled}
          onClick={handleSend}
          className="shadow-sm shadow-primary/30 active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </Button>
      </div>
      <p className="text-[10px] text-subtle mt-1.5 px-1">Enter to send · Shift+Enter for new line</p>
    </div>
  );
}
