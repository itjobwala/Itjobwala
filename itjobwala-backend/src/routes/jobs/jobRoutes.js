import { getJobs, getJobDetails, getRecommendedJobs, getSimilarJobs, getFeaturedJobs, createJob, getJobCategories, getSimilarCompanies, getSitemapJobs } from '../../controllers/jobs/jobController.js';

export default async function jobRoutes(fastify, options) {
  
  const paramSchema = {
    params: {
      type: 'object',
      required: ['job_id'],
      properties: {
        job_id: { type: 'string', pattern: '^job_\\d+$' }
      }
    }
  };

  // Module 2 APIs
  fastify.get('/jobs', getJobs);
  fastify.get('/jobs/categories', getJobCategories);
  fastify.get('/jobs/recommended', getRecommendedJobs);
  fastify.get('/jobs/featured', getFeaturedJobs);
  // Static literal route must be registered before /:job_id (belt-and-suspenders for find-my-way)
  fastify.get('/jobs/sitemap', getSitemapJobs);
  fastify.get('/jobs/:job_id/similar', { schema: paramSchema }, getSimilarJobs);
  fastify.get('/jobs/:job_id/similar-companies', { schema: paramSchema }, getSimilarCompanies);
  fastify.get('/jobs/:job_id', { schema: paramSchema }, getJobDetails);

  // Existing module 6 endpoint to maintain compatibility until we refactor them properly
  fastify.post('/jobs', {
    preValidation: [fastify.requireRecruiter]
  }, createJob);
}
