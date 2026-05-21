import {
  getDashboardStats,
  getPostedJobs,
  getRecentApplicants,
  getPipeline,
  getActivityFeed
} from '../../controllers/recruiter/recruiterDashboardController.js';

export default async function recruiterDashboardRoutes(fastify, options) {
  const authOpts = {
    preValidation: [fastify.requireRecruiter]
  };

  fastify.get('/recruiter/dashboard/stats', authOpts, getDashboardStats);
  fastify.get('/recruiter/dashboard/recent-applicants', authOpts, getRecentApplicants);
  fastify.get('/recruiter/dashboard/pipeline', authOpts, getPipeline);
  fastify.get('/recruiter/dashboard/activity', authOpts, getActivityFeed);
}
