import Notification from '../models/common/Notification.js';

/**
 * Fire a notification insert without blocking the calling request.
 * Any DB error is swallowed so a notification failure never breaks the main flow.
 */
function fireNotification(payload) {
  Notification.query()
    .insert({ is_read: false, ...payload })
    .catch(() => {});
}

export function notifyRecruiter(recruiterId, { type, title, message, actionUrl = null }) {
  fireNotification({ recruiter_id: recruiterId, candidate_id: null, type, title, message, action_url: actionUrl });
}

export function notifyCandidate(candidateId, { type, title, message, actionUrl = null }) {
  fireNotification({ candidate_id: candidateId, recruiter_id: null, type, title, message, action_url: actionUrl });
}
