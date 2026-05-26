/**
 * Centralized socket emitters.
 * All emission goes through this module — never call io.to() from controllers directly.
 *
 * Usage:
 *   import { emitters } from '../socket/index.js';
 *   emitters.emitNewMessage(io, conversationId, message);
 */

import { EVENTS, ROOMS } from './constants.js';

export function emitNewMessage(io, conversationId, message) {
  io.to(ROOMS.conversation(conversationId)).emit(EVENTS.MESSAGE_RECEIVE, {
    ...message,
    conversation_id: conversationId,
  });
}

export function emitMessageRead(io, conversationId, readBy) {
  io.to(ROOMS.conversation(conversationId)).emit(EVENTS.MESSAGE_READ, {
    conversation_id: conversationId,
    read_by:         readBy,
    read_at:         new Date().toISOString(),
  });
}

export function emitTypingStart(io, conversationId, userId) {
  io.to(ROOMS.conversation(conversationId)).emit(EVENTS.TYPING_START, {
    conversation_id: conversationId,
    user_id:         userId,
  });
}

export function emitTypingStop(io, conversationId, userId) {
  io.to(ROOMS.conversation(conversationId)).emit(EVENTS.TYPING_STOP, {
    conversation_id: conversationId,
    user_id:         userId,
  });
}

export function emitConversationUpdate(io, userId, update) {
  io.to(ROOMS.user(userId)).emit(EVENTS.CONVERSATION_UPDATE, update);
}

export function emitUserOnline(io, userId) {
  io.emit(EVENTS.USER_ONLINE, { user_id: userId, timestamp: new Date().toISOString() });
}

export function emitUserOffline(io, userId) {
  io.emit(EVENTS.USER_OFFLINE, {
    user_id:   userId,
    last_seen: new Date().toISOString(),
  });
}

export function emitReferralUpdate(io, candidateId, payload) {
  io.to(ROOMS.user(candidateId)).emit(EVENTS.REFERRAL_UPDATE, payload);
}
