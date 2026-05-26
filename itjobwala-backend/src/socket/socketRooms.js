import { ROOMS } from './constants.js';
import Conversation from '../models/chat/Conversation.js';

/**
 * Join the user's personal notification room and their active conversation rooms.
 */
export async function joinUserRooms(socket) {
  const { id, role } = socket.user;

  // Personal room for direct notifications
  socket.join(ROOMS.user(id));

  // Rejoin any active conversations for this user
  try {
    const field = role === 'candidate' ? 'candidate_id' : 'recruiter_id';
    const convs = await Conversation.query()
      .where(field, id)
      .orderBy('last_message_at', 'desc')
      .limit(20)
      .select('id');

    for (const c of convs) {
      socket.join(ROOMS.conversation(c.id));
    }
  } catch {
    // Non-fatal — user can rejoin manually via conversation:join
  }
}

/**
 * Verify that a socket's user is a participant of the given conversation.
 * Returns the conversation or null if unauthorized.
 */
export async function assertConversationAccess(socket, conversationId) {
  const conv = await Conversation.query().findById(conversationId);
  if (!conv) return null;

  const { id, role } = socket.user;
  const isParticipant = role === 'candidate'
    ? conv.candidate_id === id
    : conv.recruiter_id === id;

  return isParticipant ? conv : null;
}
