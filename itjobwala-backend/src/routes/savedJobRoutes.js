import { getSavedJobs, saveJob, unsaveJob } from '../controllers/savedJobController.js';

export default async function savedJobRoutes(fastify, options) {
  const authOpts = {
    preValidation: [fastify.requireCandidate]
  };

  fastify.get('/candidate/saved-jobs', authOpts, getSavedJobs);

  fastify.post('/candidate/saved-jobs', {
    ...authOpts,
    schema: {
      body: {
        type: 'object',
        required: ['job_id'],
        properties: {
          job_id: { type: 'string' }
        }
      }
    }
  }, saveJob);

  fastify.delete('/candidate/saved-jobs/:job_id', authOpts, unsaveJob);
}
