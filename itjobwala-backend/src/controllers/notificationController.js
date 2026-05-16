import Notification from '../models/Notification.js';

export const getNotifications = async (request, reply) => {
  try {
    const userId = request.user.id;
    const role = request.user.role; // 'candidate' or 'recruiter'
    const { page = 1, limit = 20 } = request.query;

    const query = Notification.query().orderBy('created_at', 'desc');

    if (role === 'candidate') {
      query.where('candidate_id', userId);
    } else if (role === 'recruiter') {
      query.where('recruiter_id', userId);
    } else {
      return reply.status(403).send({ success: false, message: 'Invalid role' });
    }

    const pageIndex = Math.max(0, parseInt(page, 10) - 1);
    const pageSize = parseInt(limit, 10);

    const result = await query.page(pageIndex, pageSize);
    const unreadCount = await Notification.query().where(role === 'candidate' ? 'candidate_id' : 'recruiter_id', userId).where('is_read', false).resultSize();

    return reply.status(200).send({
      success: true,
      message: 'Notifications fetched.',
      data: {
        notifications: result.results.map(n => ({
          id: `notif_${n.id}`,
          type: n.type,
          title: n.title,
          message: n.message,
          is_read: n.is_read,
          action_url: n.action_url,
          created_at: n.created_at
        })),
        unread_count: unreadCount,
        pagination: {
          page: pageIndex + 1,
          limit: pageSize,
          total: result.total,
          total_pages: Math.ceil(result.total / pageSize),
          has_next: (pageIndex + 1) * pageSize < result.total,
          has_prev: pageIndex > 0
        }
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const markAsRead = async (request, reply) => {
  try {
    const userId = request.user.id;
    const role = request.user.role;
    const notifId = request.params.notification_id.replace('notif_', '');

    const query = Notification.query().where('id', notifId);
    
    if (role === 'candidate') {
      query.where('candidate_id', userId);
    } else {
      query.where('recruiter_id', userId);
    }

    const updated = await query.patch({ is_read: true });

    if (updated === 0) {
      return reply.status(404).send({ success: false, message: 'Notification not found' });
    }

    return reply.status(200).send({
      success: true,
      message: 'Notification marked as read.',
      data: {}
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const markAllAsRead = async (request, reply) => {
  try {
    const userId = request.user.id;
    const role = request.user.role;

    const query = Notification.query().where('is_read', false);
    
    if (role === 'candidate') {
      query.where('candidate_id', userId);
    } else {
      query.where('recruiter_id', userId);
    }

    await query.patch({ is_read: true });

    return reply.status(200).send({
      success: true,
      message: 'All notifications marked as read.',
      data: {}
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
