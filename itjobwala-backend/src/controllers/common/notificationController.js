import Notification from '../../models/common/Notification.js';
import Message      from '../../models/chat/Message.js';
import User         from '../../models/candidate/User.js';
import Recruiter    from '../../models/recruiter/Recruiter.js';

// Shared helper — reused by getNotifications and getNotificationCount
async function countUnreadNotifications(userId, role) {
  return Notification.query()
    .where(role === 'candidate' ? 'candidate_id' : 'recruiter_id', userId)
    .where('is_read', false)
    .resultSize();
}

async function countUnreadMessages(userId, role) {
  const convCol = role === 'candidate' ? 'conversations.candidate_id' : 'conversations.recruiter_id';
  return Message.query()
    .join('conversations', 'messages.conversation_id', 'conversations.id')
    .where(convCol, userId)
    .where('messages.is_read', false)
    .whereNot('messages.sender_id', userId)
    .resultSize();
}

export const getNotificationCount = async (request, reply) => {
  try {
    const userId = request.user.id;
    const role   = request.user.role;

    if (role !== 'candidate' && role !== 'recruiter') {
      return reply.status(403).send({ success: false, message: 'Invalid role', data: {}, errors: [] });
    }

    const [unread_notifications, unread_messages] = await Promise.all([
      countUnreadNotifications(userId, role),
      countUnreadMessages(userId, role),
    ]);

    return reply.status(200).send({
      success: true,
      message: 'Notification count fetched.',
      data: { unread_notifications, unread_messages },
      errors: [],
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error', data: {}, errors: [] });
  }
};

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
    const unreadCount = await countUnreadNotifications(userId, role);

    // Batch-resolve actor avatars — one query per actor type, no N+1
    const rows = result.results;
    const candidateActorIds = [...new Set(
      rows.filter(n => n.metadata?.actor_type === 'candidate' && n.metadata?.actor_id)
          .map(n => n.metadata.actor_id)
    )];
    const recruiterActorIds = [...new Set(
      rows.filter(n => n.metadata?.actor_type === 'recruiter' && n.metadata?.actor_id)
          .map(n => n.metadata.actor_id)
    )];

    const [candidatePhotos, recruiterLogos] = await Promise.all([
      candidateActorIds.length
        ? User.query().whereIn('id', candidateActorIds).select('id', 'profile_photo_url')
        : [],
      recruiterActorIds.length
        ? Recruiter.query().whereIn('id', recruiterActorIds).select('id', 'logo')
        : [],
    ]);

    const avatarMap = new Map();
    for (const u of candidatePhotos) avatarMap.set(`candidate_${u.id}`, u.profile_photo_url || null);
    for (const r of recruiterLogos)  avatarMap.set(`recruiter_${r.id}`, r.logo || null);

    return reply.status(200).send({
      success: true,
      message: 'Notifications fetched.',
      data: {
        notifications: rows.map(n => {
          const actorAvatarUrl = n.metadata?.actor_type && n.metadata?.actor_id
            ? (avatarMap.get(`${n.metadata.actor_type}_${n.metadata.actor_id}`) ?? null)
            : null;
          return {
            id:               `notif_${n.id}`,
            type:             n.type,
            title:            n.title,
            message:          n.message,
            is_read:          n.is_read,
            action_url:       n.action_url,
            created_at:       n.created_at,
            actor_avatar_url: actorAvatarUrl,
          };
        }),
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
