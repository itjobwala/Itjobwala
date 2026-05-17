import { getInterviews, scheduleInterview } from '../controllers/recruiterInterviewController.js';

export default async function recruiterInterviewRoutes(fastify, options) {
  const preValidation = [fastify.requireRecruiter];

  fastify.get('/recruiter/interviews', { preValidation }, getInterviews);
  fastify.post('/recruiter/interviews', { preValidation }, scheduleInterview);
}
