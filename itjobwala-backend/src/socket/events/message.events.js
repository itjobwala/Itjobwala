import xss              from 'xss';
import Message           from '../../models/chat/Message.js';
import Conversation      from '../../models/chat/Conversation.js';
import { EVENTS }        from '../constants.js';
import { assertConversationAccess } from '../socketRooms.js';
import { emitNewMessage, emitConversationUpdate } from '../socketEmitters.js';

/**
 * Register message-related socket events for a connected socket.
 */
export function registerMessageEvents(io, socket) {

  // ── message:send ────────────────────────────────────────────────────────────
  // Client emits with ACK callback:
  //   socket.emit('message:send', { conversation_id, message }, (ack) => { ... })
  socket.on(EVENTS.MESSAGE_SEND, async (payload, ack) => {
    try {
      const { conversation_id, message, message_type = 'text', client_message_id } = payload ?? {};

      if (!conversation_id || !message?.trim()) {
        return ack?.({ ok: false, error: 'conversation_id and message are required' });
      }

      const conv = await assertConversationAccess(socket, conversation_id);
      if (!conv) {
        return ack?.({ ok: false, error: 'Access denied or conversation not found' });
      }

      const sanitized = xss(String(message).trim());
      if (!sanitized) {
        return ack?.({ ok: false, error: 'Message is empty after sanitization' });
      }

      // Save to DB
      const msg = await Message.query().insertAndFetch({
        conversation_id,
        sender_id:    socket.user.id,
        sender_role:  socket.user.role,
        message:      sanitized,
        message_type: ['text', 'file', 'system'].includes(message_type) ? message_type : 'text',
        is_read:      false,
      });

      // Update conversation last message cache
      const preview = sanitized.substring(0, 200);
      await conv.$query().patch({
        last_message:    preview,
        last_message_at: new Date().toISOString(),
        updated_at:      new Date().toISOString(),
      });

      const outgoing = {
        id:               msg.id,
        sender_id:        msg.sender_id,
        sender_role:      msg.sender_role,
        message:          msg.message,
        message_type:     msg.message_type,
        is_read:          msg.is_read,
        created_at:       msg.created_at,
        client_message_id: client_message_id ?? null,
      };

      // Broadcast to everyone in the conversation room (including sender)
      emitNewMessage(io, conversation_id, outgoing);

      // Push sidebar update to each participant's personal room
      const otherPartyId = socket.user.role === 'candidate'
        ? conv.recruiter_id
        : conv.candidate_id;

      const convUpdate = {
        conversation_id,
        last_message:    preview,
        last_message_at: new Date().toISOString(),
      };

      emitConversationUpdate(io, socket.user.id, convUpdate);
      emitConversationUpdate(io, otherPartyId, { ...convUpdate, unread_increment: 1 });

      ack?.({ ok: true, message: outgoing });
    } catch (err) {
      socket.server?.log?.error(err, 'socket message:send error');
      ack?.({ ok: false, error: 'Internal server error' });
    }
  });

  // ── message:read ────────────────────────────────────────────────────────────
  socket.on(EVENTS.MESSAGE_READ, async ({ conversation_id }) => {
    try {
      if (!conversation_id) return;

      const conv = await assertConversationAccess(socket, conversation_id);
      if (!conv) return;

      await Message.query()
        .where('conversation_id', conversation_id)
        .where('is_read', false)
        .whereNot('sender_id', socket.user.id)
        .patch({ is_read: true });

      // Notify the other party their messages were read
      io.to(`conversation:${conversation_id}`).emit(EVENTS.MESSAGE_READ, {
        conversation_id,
        read_by: socket.user.id,
        read_at: new Date().toISOString(),
      });
    } catch {
      // Swallow — read receipts are non-critical
    }
  });
}
