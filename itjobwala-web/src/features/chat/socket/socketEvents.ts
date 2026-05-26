// Mirror of the backend constants — must stay in sync with src/socket/constants.js

export const EVENTS = {
  CONNECT:    'connect',
  DISCONNECT: 'disconnect',

  MESSAGE_SEND:      'message:send',
  MESSAGE_RECEIVE:   'message:receive',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_READ:      'message:read',

  TYPING_START: 'typing:start',
  TYPING_STOP:  'typing:stop',

  CONVERSATION_JOIN:   'conversation:join',
  CONVERSATION_LEAVE:  'conversation:leave',
  CONVERSATION_UPDATE: 'conversation:update',
  CONVERSATION_READ:   'conversation:read',

  USER_ONLINE:    'user:online',
  USER_OFFLINE:   'user:offline',
  USER_LAST_SEEN: 'user:last-seen',

  REFERRAL_UPDATE: 'referral:update',
} as const;

export type SocketEvent = (typeof EVENTS)[keyof typeof EVENTS];
