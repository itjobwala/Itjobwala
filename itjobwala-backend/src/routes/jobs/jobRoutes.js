import { getJobs, getJobDetails, getRecommendedJobs, getSimilarJobs, getFeaturedJobs, createJob, getJobCategories, getSimilarCompanies, getSitemapJobs, getJobCount } from '../../controllers/jobs/jobController.js';

export default async function jobRoutes(fastify, options) {
  
  const paramSchema = {
    params: {
      type: 'object',
      required: ['job_id'],
      properties: {
        // public_id: 12-char lowercase hex — strict pattern blocks any injection attempt
        job_id: { type: 'string', pattern: '^[0-9a-f]{12}$' }
      }
    }
  };

  // Module 2 APIs
  fastify.get('/jobs', getJobs);
  fastify.get('/jobs/categories', getJobCategories);
  fastify.get('/jobs/recommended', getRecommendedJobs);
  fastify.get('/jobs/featured', getFeaturedJobs);
  // Static literal routes must be registered before /:job_id (belt-and-suspenders for find-my-way)
  fastify.get('/jobs/count', getJobCount);
  fastify.get('/jobs/sitemap', getSitemapJobs);
  fastify.get('/jobs/:job_id/similar', { schema: paramSchema }, getSimilarJobs);
  fastify.get('/jobs/:job_id/similar-companies', { schema: paramSchema }, getSimilarCompanies);
  fastify.get('/jobs/:job_id', { schema: paramSchema }, getJobDetails);

  // Existing module 6 endpoint to maintain compatibility until we refactor them properly
  fastify.post('/jobs', {
    preValidation: [fastify.requireRecruiter]
  }, createJob);
}
