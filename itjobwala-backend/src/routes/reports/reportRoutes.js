import { submitReport } from '../../controllers/reports/reportController.js';

export default async function reportRoutes(fastify, _opts) {
  // Any authenticated user (candidate or recruiter) may submit a report
  const auth = { preValidation: [fastify.authenticate] };

  fastify.post('/reports', {
    ...auth,
    schema: {
      body: {
        type: 'object',
        required: ['target_type', 'target_id', 'reason'],
        properties: {
          target_type: { type: 'string', enum: ['job', 'recruiter', 'user'] },
          target_id:   { type: 'integer', minimum: 1 },
          reason:      { type: 'string', minLength: 1, maxLength: 100 },
          details:     { type: 'string', maxLength: 2000 },
        },
      },
    },
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  }, submitReport);
}
