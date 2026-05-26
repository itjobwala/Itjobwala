import { getCandidateDashboard } from '../../controllers/candidate/candidateDashboardController.js';

export default async function candidateDashboardRoutes(fastify) {
  fastify.get(
    '/candidate/dashboard',
    { preValidation: [fastify.authenticate] },
    getCandidateDashboard,
  );
}
