import { getNotifications, getNotificationCount, markAsRead, markAllAsRead } from '../../controllers/common/notificationController.js';

export default async function notificationRoutes(fastify, options) {
  // Generic authentication hook that works for both candidates and recruiters
  // We'll just use fastify.authenticate from jwtPlugin
  const authOpts = {
    preValidation: [fastify.authenticate]
  };

  fastify.get('/notifications', authOpts, getNotifications);
  fastify.get('/notifications/count', authOpts, getNotificationCount);
  fastify.put('/notifications/read-all', authOpts, markAllAsRead);
  fastify.put('/notifications/:notification_id/read', authOpts, markAsRead);
}
