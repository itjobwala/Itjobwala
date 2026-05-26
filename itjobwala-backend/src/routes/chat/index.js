import { getConversations, getOrCreateConversation } from '../../controllers/chat/conversationController.js';
import { getMessages, sendMessage }                  from '../../controllers/chat/messageController.js';

export default async function chatRoutes(fastify) {
  const authAny = { preValidation: [fastify.authenticate] };

  fastify.get('/chat/conversations', authAny, getConversations);

  fastify.post('/chat/conversation', {
    ...authAny,
    schema: {
      body: {
        type: 'object',
        required: ['other_id'],
        properties: {
          other_id:            { type: 'integer' },
          referral_request_id: { type: 'integer' },
        },
      },
    },
  }, getOrCreateConversation);

  fastify.get('/chat/conversation/:id/messages', {
    ...authAny,
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^\\d+$' } },
      },
      querystring: {
        type: 'object',
        properties: {
          cursor: { type: 'string' },
          limit:  { type: 'integer', minimum: 1, maximum: 100 },
        },
      },
    },
  }, getMessages);

  fastify.post('/chat/message', {
    ...authAny,
    schema: {
      body: {
        type: 'object',
        required: ['conversation_id', 'message'],
        properties: {
          conversation_id: { type: 'integer' },
          message:         { type: 'string', minLength: 1, maxLength: 4000 },
          message_type:    { type: 'string', enum: ['text', 'file', 'system'] },
        },
      },
    },
  }, sendMessage);
}
