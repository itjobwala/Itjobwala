import { EVENTS, ROOMS } from '../constants.js';
import { assertConversationAccess } from '../socketRooms.js';
import Message from '../../models/chat/Message.js';

export function registerConversationEvents(io, socket) {

  // ── conversation:join ────────────────────────────────────────────────────────
  // Client calls this when opening a conversation panel
  socket.on(EVENTS.CONVERSATION_JOIN, async ({ conversation_id }, ack) => {
    try {
      if (!conversation_id) return ack?.({ ok: false, error: 'conversation_id required' });

      const conv = await assertConversationAccess(socket, conversation_id);
      if (!conv) return ack?.({ ok: false, error: 'Access denied' });

      socket.join(ROOMS.conversation(conversation_id));

      // Mark unread messages as read on join
      await Message.query()
        .where('conversation_id', conversation_id)
        .where('is_read', false)
        .whereNot('sender_id', socket.user.id)
        .patch({ is_read: true });

      // Notify other party that messages were read
      socket.to(ROOMS.conversation(conversation_id)).emit(EVENTS.MESSAGE_READ, {
        conversation_id,
        read_by: socket.user.id,
        read_at: new Date().toISOString(),
      });

      ack?.({ ok: true });
    } catch (err) {
      ack?.({ ok: false, error: 'Internal error' });
    }
  });

  // ── conversation:leave ───────────────────────────────────────────────────────
  socket.on(EVENTS.CONVERSATION_LEAVE, ({ conversation_id }) => {
    if (conversation_id) {
      socket.leave(ROOMS.conversation(conversation_id));
    }
  });
}
