// ── Socket event name constants ───────────────────────────────────────────────
// Single source of truth — import in both server events and emitters.

export const EVENTS = {
  // Connection lifecycle
  CONNECT:    'connect',
  DISCONNECT: 'disconnect',

  // Message events
  MESSAGE_SEND:      'message:send',
  MESSAGE_RECEIVE:   'message:receive',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_READ:      'message:read',

  // Typing events
  TYPING_START: 'typing:start',
  TYPING_STOP:  'typing:stop',

  // Conversation events
  CONVERSATION_JOIN:   'conversation:join',
  CONVERSATION_LEAVE:  'conversation:leave',
  CONVERSATION_UPDATE: 'conversation:update',
  CONVERSATION_READ:   'conversation:read',

  // Presence events
  USER_ONLINE:    'user:online',
  USER_OFFLINE:   'user:offline',
  USER_LAST_SEEN: 'user:last-seen',

  // Referral realtime events
  REFERRAL_UPDATE: 'referral:update',
};

// ── Room naming helpers ───────────────────────────────────────────────────────
export const ROOMS = {
  user:         (userId)         => `user:${userId}`,
  conversation: (conversationId) => `conversation:${conversationId}`,
  referral:     (referralId)     => `referral:${referralId}`,
};
