import { getHomeStats, uploadImage, uploadDocument } from '../../controllers/common/homeController.js';

export default async function homeRoutes(fastify, options) {
  // Public statistics
  fastify.get('/home/stats', getHomeStats);

  // Authenticated generic uploads
  fastify.post('/upload/image', { preValidation: [fastify.authenticate] }, uploadImage);
  fastify.post('/upload/document', { preValidation: [fastify.authenticate] }, uploadDocument);
}
