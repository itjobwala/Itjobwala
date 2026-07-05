import { bulkMessage } from '../../controllers/recruiter/bulkMessageController.js';

const bulkMessageSchema = {
  body: {
    type: 'object',
    required: ['candidate_ids', 'message'],
    properties: {
      candidate_ids: {
        type:     'array',
        items:    { type: 'string', pattern: '^candidate_\\d+$' },
        minItems: 1,
        maxItems: 50,
      },
      message: { type: 'string', minLength: 1, maxLength: 4000 },
    },
  },
};

export default async function bulkMessageRoutes(fastify, options) {
  const preValidation = [fastify.requireRecruiter];

  // Per-recruiter rate limit: 10 bulk-message calls per hour
  fastify.post('/recruiter/messages/bulk', {
    preValidation,
    schema: bulkMessageSchema,
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 hour',
        keyGenerator: req => `bulk-msg-${req.user?.id ?? req.ip}`,
      },
    },
  }, bulkMessage);
}
