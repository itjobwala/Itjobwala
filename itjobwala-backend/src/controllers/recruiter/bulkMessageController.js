import xss from 'xss';
import Conversation from '../../models/chat/Conversation.js';
import Message from '../../models/chat/Message.js';
import User from '../../models/candidate/User.js';
import { getIo } from '../../socket/socketServer.js';
import { emitNewMessage, emitConversationUpdate } from '../../socket/socketEmitters.js';
import { notifyCandidate } from '../../utils/notifyHelper.js';
import { buildBaseQuery } from './candidateSearchController.js';

const MAX_RECIPIENTS = 50;

export const bulkMessage = async (request, reply) => {
  const recruiterId = request.user.id;
  const { candidate_ids, message } = request.body;

  if (!Array.isArray(candidate_ids) || candidate_ids.length === 0) {
    return reply.status(400).send({ success: false, message: 'candidate_ids must be a non-empty array.' });
  }
  if (candidate_ids.length > MAX_RECIPIENTS) {
    return reply.status(400).send({
      success: false,
      message: `Maximum ${MAX_RECIPIENTS} recipients per bulk message call.`,
    });
  }

  const sanitized = xss(message);
  const knex = User.knex();
  const now  = new Date().toISOString();

  // Parse and deduplicate numeric IDs
  const idMap = new Map(); // numericId → original string id
  const invalidIds = [];
  for (const rawId of candidate_ids) {
    const numeric = parseInt(String(rawId).replace('candidate_', ''), 10);
    if (!numeric || isNaN(numeric)) {
      invalidIds.push(rawId);
    } else {
      idMap.set(numeric, `candidate_${numeric}`);
    }
  }

  const sent    = [];
  const skipped = [];

  for (const id of invalidIds) {
    skipped.push({ id, reason: 'invalid_id' });
  }

  if (idMap.size === 0) {
    return reply.status(200).send({ success: true, message: 'Bulk message processed.', data: { sent, skipped } });
  }

  // Check visibility for all candidates in one query
  const visibleRows = await buildBaseQuery(knex)
    .select('u.id')
    .whereIn('u.id', [...idMap.keys()]);
  const visibleSet = new Set(visibleRows.map(r => r.id));

  // Process each candidate
  for (const [numericId, prefixedId] of idMap) {
    if (!visibleSet.has(numericId)) {
      skipped.push({ id: prefixedId, reason: 'not_visible' });
      continue;
    }

    try {
      // Find or create conversation (recruiter-initiated)
      let conv = await Conversation.query().findOne({
        candidate_id: numericId,
        recruiter_id: recruiterId,
      });
      if (!conv) {
        conv = await Conversation.query().insertAndFetch({
          candidate_id:    numericId,
          recruiter_id:    recruiterId,
          last_message_at: now,
        });
      }

      // Insert message
      const msg = await Message.query().insertAndFetch({
        conversation_id: conv.id,
        sender_id:       recruiterId,
        sender_role:     'recruiter',
        message:         sanitized,
        message_type:    'text',
        is_read:         false,
      });

      // Patch conversation preview
      const preview = sanitized.substring(0, 200);
      await conv.$query().patch({
        last_message:    preview,
        last_message_at: now,
        updated_at:      now,
      });

      // Socket events (fire-and-forget)
      const io = getIo();
      if (io) {
        const outgoing = {
          id:           msg.id,
          sender_id:    msg.sender_id,
          sender_role:  msg.sender_role,
          message:      msg.message,
          message_type: msg.message_type,
          is_read:      msg.is_read,
          created_at:   msg.created_at,
        };
        const convUpdate = { conversation_id: conv.id, last_message: preview, last_message_at: now };
        emitNewMessage(io, conv.id, outgoing);
        emitConversationUpdate(io, recruiterId, convUpdate);
        emitConversationUpdate(io, numericId, { ...convUpdate, unread_increment: 1 });
      }

      // In-app notification for candidate
      notifyCandidate(numericId, {
        type:      'new_message',
        title:     'New message from a recruiter',
        message:   sanitized.length > 80 ? sanitized.substring(0, 80) + '…' : sanitized,
        actionUrl: `/candidate/chat/${conv.id}`,
        actor:     `recruiter_${recruiterId}`,
      });

      sent.push({ id: prefixedId, conversation_id: conv.id });
    } catch (err) {
      request.server.log.error({ err, candidateId: numericId }, 'bulkMessage: failed to send to candidate');
      skipped.push({ id: prefixedId, reason: 'send_failed' });
    }
  }

  return reply.status(200).send({
    success: true,
    message: `Bulk message processed. ${sent.length} sent, ${skipped.length} skipped.`,
    data: { sent, skipped },
  });
};
