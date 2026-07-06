import Notification from '../models/common/Notification.js';
import ProfileView from '../models/recruiter/ProfileView.js';

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

/**
 * Records a recruiter viewing a candidate's profile (deduped per recruiter/day
 * via the profile_views unique constraint) and — only on a genuinely new view —
 * upserts today's "N recruiters viewed your profile" notification.
 *
 * Single source of truth for this so every recruiter-side surface that shows a
 * candidate (search results, applicant detail, talent pool, etc.) notifies the
 * candidate consistently instead of each call site re-implementing it and some
 * silently skipping the notification.
 */
export async function recordProfileView(candidateUserId, recruiterId) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const inserted = await ProfileView.knex().raw(
      `INSERT INTO profile_views (candidate_user_id, recruiter_id, viewed_date)
       VALUES (?, ?, ?)
       ON CONFLICT (candidate_user_id, recruiter_id, viewed_date) DO NOTHING
       RETURNING id`,
      [candidateUserId, recruiterId, today],
    );
    if (inserted.rows.length === 0) return; // same recruiter, same day — already counted

    const countRow = await ProfileView.knex().raw(
      `SELECT COUNT(DISTINCT recruiter_id) AS count FROM profile_views WHERE candidate_user_id = ? AND viewed_date = ?`,
      [candidateUserId, today],
    );
    const count = parseInt(countRow.rows[0]?.count ?? '1', 10);
    const message = count === 1
      ? '1 recruiter viewed your profile today'
      : `${count} recruiters viewed your profile today`;
    upsertProfileViewNotification(candidateUserId, { title: 'Profile Viewed', message, viewDate: today, count });
  } catch {
    // fire-and-forget; never block the caller
  }
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
