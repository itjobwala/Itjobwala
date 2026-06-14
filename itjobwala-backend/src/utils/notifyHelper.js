import Notification from '../models/common/Notification.js';

/**
 * Fire a notification insert without blocking the calling request.
 * Pass actor = { type: 'candidate' | 'recruiter', id: number } to store the
 * triggering user's identity in metadata so the frontend can resolve an avatar.
 * Omit actor for system notifications or where anonymity is required (profile_view).
 */
function fireNotification(payload, actor = null) {
  const metadata = actor ? { actor_type: actor.type, actor_id: actor.id } : undefined;
  Notification.query()
    .insert({ is_read: false, ...(metadata ? { metadata } : {}), ...payload })
    .catch(() => {});
}

export function notifyRecruiter(recruiterId, { type, title, message, actionUrl = null, actor = null }) {
  fireNotification({ recruiter_id: recruiterId, candidate_id: null, type, title, message, action_url: actionUrl }, actor);
}

export function notifyCandidate(candidateId, { type, title, message, actionUrl = null, actor = null }) {
  fireNotification({ candidate_id: candidateId, recruiter_id: null, type, title, message, action_url: actionUrl }, actor);
}

export function upsertProfileViewNotification(candidateId, { title, message, viewDate, count }) {
  const metadata = JSON.stringify({ view_date: viewDate, count });
  Notification.knex().raw(
    `INSERT INTO notifications
       (candidate_id, recruiter_id, type, title, message, metadata, is_read, action_url)
     VALUES (?, NULL, 'profile_view', ?, ?, ?::jsonb, false, NULL)
     ON CONFLICT (candidate_id, (metadata->>'view_date'))
     WHERE type = 'profile_view'
     DO UPDATE SET
       title      = excluded.title,
       message    = excluded.message,
       metadata   = excluded.metadata,
       is_read    = false,
       created_at = now()`,
    [candidateId, title, message, metadata]
  ).catch(() => {});
}
