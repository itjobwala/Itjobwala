'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
} from '../services/chat.api';
import type { Message, SenderRole } from '../types/chat.types';

export const chatKeys = {
  all:           () => ['chat'] as const,
  conversations: () => ['chat', 'conversations'] as const,
  messages:      (id: number) => ['chat', 'messages', id] as const,
};

export function useConversationsQuery(enabled = true) {
  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn:  getConversations,
    enabled,
    // 30s fallback poll — socket handles real-time updates
    refetchInterval: 30_000,
  });
}

export function useMessagesQuery(conversationId: number, enabled = true) {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn:  ({ pageParam }: { pageParam?: string }) =>
      getMessages(conversationId, { cursor: pageParam }),
    getNextPageParam: last => (last.has_more && last.next_cursor ? last.next_cursor : undefined),
    initialPageParam: undefined as string | undefined,
    enabled: enabled && !!conversationId,
    select: data => ({
      ...data,
      pages: [...data.pages].reverse(),
    }),
  });
}

export function useGetOrCreateConversationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ otherId, referralRequestId }: { otherId: number; referralRequestId?: number }) =>
      getOrCreateConversation(otherId, referralRequestId),
    onSuccess: () => qc.invalidateQueries({ queryKey: chatKeys.conversations() }),
  });
}

export function useSendMessageMutation(conversationId: number, myId: number, myRole: SenderRole) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (message: string) => sendMessage(conversationId, message),

    // ── Optimistic update ────────────────────────────────────────────────────
    onMutate: async (message) => {
      await qc.cancelQueries({ queryKey: chatKeys.messages(conversationId) });
      const previous = qc.getQueryData(chatKeys.messages(conversationId));

      const tempId: number = -Date.now();
      const tempMsg: Message = {
        id:           tempId,
        sender_id:    myId,
        sender_role:  myRole,
        message,
        message_type: 'text',
        is_read:      false,
        created_at:   new Date().toISOString(),
      };

      qc.setQueryData(chatKeys.messages(conversationId), (old: any) => {
        if (!old) return old;
        const pages = [...old.pages];
        if (pages.length === 0) return old;
        const last = pages[pages.length - 1];
        pages[pages.length - 1] = { ...last, messages: [...last.messages, tempMsg] };
        return { ...old, pages };
      });

      return { previous, tempId };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(chatKeys.messages(conversationId), context.previous);
      }
    },

    onSuccess: (realMsg, _vars, context) => {
      // Replace optimistic message with real one (de-duplicate by removing temp)
      qc.setQueryData(chatKeys.messages(conversationId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((p: any) => ({
            ...p,
            messages: p.messages
              .filter((m: Message) => m.id !== context?.tempId)
              .concat(
                // Only add if not already there (socket may have delivered it)
                p.messages.some((m: Message) => m.id === realMsg.id) ? [] : [realMsg],
              ),
          })),
        };
      });
      qc.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}
