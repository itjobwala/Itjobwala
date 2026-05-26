'use client';

/**
 * useSocketConnection — manages the socket lifecycle for the current session.
 *
 * Mount once at the app/layout level (ChatLayout or a provider).
 * Connects on mount when authenticated, disconnects on unmount/logout.
 */

import { useEffect, useRef } from 'react';
import { useQueryClient }    from '@tanstack/react-query';
import { useAuthStore }      from '@/src/features/auth/session/auth.store';
import { connectSocket, disconnectSocket, getSocket } from './socketClient';
import { useSocketStore }    from './socketStore';
import { EVENTS }            from './socketEvents';
import { chatKeys }          from '../hooks';
import type { Message }      from '../types/chat.types';

export function useSocketConnection() {
  const { accessToken, isAuthenticated } = useAuthStore();
  const { setConnected, setReconnecting, addOnlineUser, removeOnlineUser, setTyping, incrementUnread }
    = useSocketStore();
  const qc            = useQueryClient();
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || typeof window === 'undefined') return;

    const socket = connectSocket(accessToken);

    // Prevent re-registering listeners on StrictMode double-mount
    if (!registeredRef.current) {
      registeredRef.current = true;

      // ── Connection state ─────────────────────────────────────────────────
      socket.on(EVENTS.CONNECT, () => {
        setConnected(true);
      });

      socket.on('disconnect', () => {
        setConnected(false);
      });

      socket.on('connect_error', () => {
        setReconnecting(true);
      });

      socket.on('reconnect_attempt', () => {
        setReconnecting(true);
      });

      socket.on('reconnect', () => {
        setConnected(true);
      });

      // ── Incoming messages ────────────────────────────────────────────────
      socket.on(EVENTS.MESSAGE_RECEIVE, (msg: Message & { conversation_id: number }) => {
        const { conversation_id, ...message } = msg;

        // Append to React Query cache if conversation is already loaded
        qc.setQueryData(chatKeys.messages(conversation_id), (old: any) => {
          if (!old) return old; // not loaded yet — will appear on next fetch
          const pages = [...old.pages];
          if (pages.length === 0) return old;
          const lastPage = pages[pages.length - 1];

          // De-duplicate: skip if message already in cache (optimistic update)
          const allIds = new Set(pages.flatMap((p: any) => p.messages.map((m: any) => m.id)));
          if (allIds.has(message.id)) return old;

          pages[pages.length - 1] = { ...lastPage, messages: [...lastPage.messages, message] };
          return { ...old, pages };
        });

        // Always refresh conversations sidebar (unread count + last message)
        qc.invalidateQueries({ queryKey: chatKeys.conversations() });
      });

      // ── Conversation sidebar updates ─────────────────────────────────────
      socket.on(EVENTS.CONVERSATION_UPDATE, (update: { conversation_id: number; unread_increment?: number }) => {
        if (update.unread_increment) {
          incrementUnread(update.conversation_id, update.unread_increment);
        }
        qc.invalidateQueries({ queryKey: chatKeys.conversations() });
      });

      // ── Typing ───────────────────────────────────────────────────────────
      socket.on(EVENTS.TYPING_START, ({ conversation_id, user_id }: { conversation_id: number; user_id: number }) => {
        setTyping(conversation_id, user_id, true);
      });

      socket.on(EVENTS.TYPING_STOP, ({ conversation_id, user_id }: { conversation_id: number; user_id: number }) => {
        setTyping(conversation_id, user_id, false);
      });

      // ── Presence ─────────────────────────────────────────────────────────
      socket.on(EVENTS.USER_ONLINE,  ({ user_id }: { user_id: number }) => addOnlineUser(user_id));
      socket.on(EVENTS.USER_OFFLINE, ({ user_id }: { user_id: number }) => removeOnlineUser(user_id));

      // ── Read receipts ─────────────────────────────────────────────────────
      socket.on(EVENTS.MESSAGE_READ, ({ conversation_id }: { conversation_id: number }) => {
        // Mark all messages in cache as read
        qc.setQueryData(chatKeys.messages(conversation_id), (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((p: any) => ({
              ...p,
              messages: p.messages.map((m: any) => ({ ...m, is_read: true })),
            })),
          };
        });
      });
    }

    return () => {
      // Only disconnect on true unmount (not StrictMode remount)
      // We keep the socket alive as long as the user is authenticated.
      // disconnectSocket() is called on logout via auth store.
      registeredRef.current = false;
      socket.off(EVENTS.CONNECT);
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('reconnect_attempt');
      socket.off('reconnect');
      socket.off(EVENTS.MESSAGE_RECEIVE);
      socket.off(EVENTS.CONVERSATION_UPDATE);
      socket.off(EVENTS.TYPING_START);
      socket.off(EVENTS.TYPING_STOP);
      socket.off(EVENTS.USER_ONLINE);
      socket.off(EVENTS.USER_OFFLINE);
      socket.off(EVENTS.MESSAGE_READ);
    };
  }, [isAuthenticated, accessToken]); // reconnect if token changes

  // Disconnect on logout
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      setConnected(false);
    }
  }, [isAuthenticated]);
}
