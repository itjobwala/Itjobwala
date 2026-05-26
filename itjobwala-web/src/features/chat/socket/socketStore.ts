/**
 * Lightweight Zustand socket store.
 *
 * Stores ONLY UI/connection state — never messages (those stay in React Query).
 */

import { create } from 'zustand';

interface TypingUsers {
  // conversationId → Set of userIds currently typing
  [conversationId: number]: Set<number>;
}

interface SocketState {
  isConnected:  boolean;
  reconnecting: boolean;
  onlineUsers:  Set<number>;
  typingUsers:  TypingUsers;
  unreadCounts: Record<number, number>; // conversationId → count

  // Actions
  setConnected:     (v: boolean)                                    => void;
  setReconnecting:  (v: boolean)                                    => void;
  addOnlineUser:    (userId: number)                                => void;
  removeOnlineUser: (userId: number)                                => void;
  setTyping:        (conversationId: number, userId: number, isTyping: boolean) => void;
  incrementUnread:  (conversationId: number, by?: number)           => void;
  resetUnread:      (conversationId: number)                        => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  isConnected:  false,
  reconnecting: false,
  onlineUsers:  new Set<number>(),
  typingUsers:  {},
  unreadCounts: {},

  setConnected:    (v) => set({ isConnected: v, reconnecting: false }),
  setReconnecting: (v) => set({ reconnecting: v }),

  addOnlineUser: (userId) =>
    set((s) => ({ onlineUsers: new Set([...s.onlineUsers, userId]) })),

  removeOnlineUser: (userId) =>
    set((s) => {
      const next = new Set(s.onlineUsers);
      next.delete(userId);
      return { onlineUsers: next };
    }),

  setTyping: (conversationId, userId, isTyping) =>
    set((s) => {
      const existing = s.typingUsers[conversationId] ?? new Set<number>();
      const next     = new Set(existing);
      if (isTyping) next.add(userId); else next.delete(userId);
      return { typingUsers: { ...s.typingUsers, [conversationId]: next } };
    }),

  incrementUnread: (conversationId, by = 1) =>
    set((s) => ({
      unreadCounts: {
        ...s.unreadCounts,
        [conversationId]: (s.unreadCounts[conversationId] ?? 0) + by,
      },
    })),

  resetUnread: (conversationId) =>
    set((s) => {
      const next = { ...s.unreadCounts };
      delete next[conversationId];
      return { unreadCounts: next };
    }),
}));
