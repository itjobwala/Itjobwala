import { applyToJob, getMyApplications, withdrawApplication, getApplicationStatus } from '../controllers/applicationController.js';

export default async function applicationRoutes(fastify, options) {
  const authOpts = {
    preValidation: [fastify.requireCandidate]
  };

  const applySchema = {
    schema: {
      params: {
        type: 'object',
        required: ['job_id'],
        properties: {
          job_id: { type: 'string', pattern: '^job_\\d+$' }
        }
      },
      body: {
        type: 'object',
        properties: {
          cover_letter: { type: 'string', maxLength: 3000 },
          resume_id: { type: 'string' },
          expected_salary: { type: 'integer', minimum: 1 },
          notice_period_days: { type: 'integer', minimum: 0, maximum: 180 },
          answers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question_id: { type: 'string' },
                answer: { type: 'string' }
              }
            }
          }
        }
      }
    }
  };

  fastify.post('/jobs/:job_id/apply', { ...authOpts, schema: applySchema.schema }, applyToJob);
  fastify.get('/candidate/applications', authOpts, getMyApplications);
  fastify.delete('/candidate/applications/:application_id', { 
    ...authOpts, 
    schema: { 
      body: { type: 'object', nullable: true } 
    } 
  }, withdrawApplication);
  fastify.get('/candidate/applications/:application_id', authOpts, getApplicationStatus);
}
