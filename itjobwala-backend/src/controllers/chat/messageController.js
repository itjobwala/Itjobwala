import Message      from '../../models/chat/Message.js';
import Conversation  from '../../models/chat/Conversation.js';
import xss           from 'xss';
import { getIo }     from '../../socket/socketServer.js';
import { emitNewMessage, emitConversationUpdate, emitMessageRead } from '../../socket/socketEmitters.js';

export const getMessages = async (request, reply) => {
  try {
    const userId = request.user.id;
    const convId = parseInt(request.params.id, 10);
    const { cursor, limit = 30 } = request.query;
    const pageSize = Math.min(100, parseInt(limit, 10));

    // Auth: verify user belongs to this conversation
    const conv = await Conversation.query().findById(convId);
    if (!conv) {
      return reply.status(404).send({ success: false, message: 'Conversation not found.' });
    }
    const role = request.user.role ?? 'candidate';
    const isParticipant = role === 'candidate'
      ? conv.candidate_id === userId
      : conv.recruiter_id === userId;

    if (!isParticipant) {
      return reply.status(403).send({ success: false, message: 'Access denied.' });
    }

    let query = Message.query()
      .where('conversation_id', convId)
      .orderBy('created_at', 'desc')
      .limit(pageSize + 1);

    if (cursor) {
      query.where('created_at', '<', new Date(cursor).toISOString());
    }

    const rows = await query;
    const hasMore = rows.length > pageSize;
    const messages = (hasMore ? rows.slice(0, pageSize) : rows).reverse();

    // Mark messages from the other party as read and notify sender via socket
    const otherRole   = role === 'candidate' ? 'recruiter' : 'candidate';
    const unreadCount = await Message.query()
      .where('conversation_id', convId)
      .where('is_read', false)
      .where('sender_role', otherRole)
      .resultSize();

    if (unreadCount > 0) {
      await Message.query()
        .where('conversation_id', convId)
        .where('is_read', false)
        .where('sender_role', otherRole)
        .patch({ is_read: true });

      const io = getIo();
      if (io) emitMessageRead(io, convId, userId);
    }

    return reply.send({
      success: true,
      message: 'Messages fetched.',
      data: {
        messages: messages.map(m => ({
          id:           m.id,
          sender_id:    m.sender_id,
          sender_role:  m.sender_role,
          message:      m.message,
          message_type: m.message_type,
          is_read:      m.is_read,
          created_at:   m.created_at,
        })),
        has_more:    hasMore,
        next_cursor: hasMore ? messages[0]?.created_at : null,
      },
    });
  } catch (err) {
    throw err;
  }
};

export const sendMessage = async (request, reply) => {
  try {
    const userId = request.user.id;
    const role   = request.user.role ?? 'candidate';
    const { conversation_id, message, message_type = 'text' } = request.body;

    const conv = await Conversation.query().findById(conversation_id);
    if (!conv) {
      return reply.status(404).send({ success: false, message: 'Conversation not found.' });
    }

    const isParticipant = role === 'candidate'
      ? conv.candidate_id === userId
      : conv.recruiter_id === userId;

    if (!isParticipant) {
      return reply.status(403).send({ success: false, message: 'Access denied.' });
    }

    const sanitized = xss(message);

    const msg = await Message.query().insertAndFetch({
      conversation_id,
      sender_id:    userId,
      sender_role:  role,
      message:      sanitized,
      message_type,
      is_read:      false,
    });

    // Update conversation last message
    await conv.$query().patch({
      last_message:    sanitized.substring(0, 200),
      last_message_at: new Date().toISOString(),
      updated_at:      new Date().toISOString(),
    });

    const outgoing = {
      id:           msg.id,
      sender_id:    msg.sender_id,
      sender_role:  msg.sender_role,
      message:      msg.message,
      message_type: msg.message_type,
      is_read:      msg.is_read,
      created_at:   msg.created_at,
    };

    // Real-time delivery via socket
    const io = getIo();
    if (io) {
      const preview = sanitized.substring(0, 200);
      const convUpdate = { conversation_id, last_message: preview, last_message_at: new Date().toISOString() };
      const otherPartyId = role === 'candidate' ? conv.recruiter_id : conv.candidate_id;
      emitNewMessage(io, conversation_id, outgoing);
      emitConversationUpdate(io, userId, convUpdate);
      emitConversationUpdate(io, otherPartyId, { ...convUpdate, unread_increment: 1 });
    }

    return reply.status(201).send({
      success: true,
      message: 'Message sent.',
      data:    outgoing,
    });
  } catch (err) {
    throw err;
  }
};
