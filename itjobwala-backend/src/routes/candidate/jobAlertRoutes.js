import { listAlerts, createAlert, updateAlert, deleteAlert } from '../../controllers/candidate/jobAlertController.js';

export default async function jobAlertRoutes(fastify) {
  const authOpts = { preValidation: [fastify.requireCandidate] };

  fastify.get('/candidate/job-alerts', authOpts, listAlerts);

  fastify.post('/candidate/job-alerts', {
    ...authOpts,
    schema: {
      body: {
        type: 'object',
        required: ['name', 'frequency'],
        properties: {
          name:      { type: 'string', minLength: 1, maxLength: 200 },
          frequency: { type: 'string', enum: ['instant', 'daily', 'weekly'] },
          criteria: {
            type: 'object',
            properties: {
              keywords:  { type: ['string', 'null'] },
              location:  { type: ['string', 'null'] },
              work_mode: { type: 'array', items: { type: 'string' } },
              job_type:  { type: 'array', items: { type: 'string' } },
              salary_min: { type: ['number', 'null'] },
              experience: { type: ['number', 'null'] },
            },
          },
        },
      },
    },
  }, createAlert);

  fastify.put('/candidate/job-alerts/:alertId', authOpts, updateAlert);
  fastify.delete('/candidate/job-alerts/:alertId', authOpts, deleteAlert);
}
