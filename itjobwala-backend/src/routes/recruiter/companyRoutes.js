import { getCompanyProfile, getCompanyJobs } from '../../controllers/recruiter/companyController.js';

export default async function companyRoutes(fastify, options) {
  fastify.get('/companies/:company_id', getCompanyProfile);
  
  fastify.get('/companies/:company_id/jobs', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 50 }
        }
      }
    }
  }, getCompanyJobs);
}
