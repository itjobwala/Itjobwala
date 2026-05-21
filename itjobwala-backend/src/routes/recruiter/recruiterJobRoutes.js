import {
  getJobs,
  getJobById,
  postJob,
  updateJob,
  deleteJob,
  getRecruiterStats,
} from '../../controllers/recruiter/recruiterJobController.js';

export default async function recruiterJobRoutes(fastify, options) {
  // Use requireRecruiter middleware for all routes
  const preValidation = [fastify.requireRecruiter];

  fastify.get('/recruiter/stats', { preValidation }, getRecruiterStats);
  fastify.get('/recruiter/jobs', { preValidation }, getJobs);
  fastify.get('/recruiter/jobs/:jobId', { preValidation }, getJobById);
  fastify.post('/recruiter/jobs', { preValidation }, postJob);
  fastify.put('/recruiter/jobs/:jobId', { preValidation }, updateJob);
  fastify.delete('/recruiter/jobs/:jobId', { preValidation }, deleteJob);
}
