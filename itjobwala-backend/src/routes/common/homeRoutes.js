import { getHomeStats } from '../../controllers/common/homeController.js';

export default async function homeRoutes(fastify, options) {
  // Public statistics
  fastify.get('/home/stats', getHomeStats);
}
