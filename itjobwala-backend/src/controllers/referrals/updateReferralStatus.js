import ReferralRequest from '../../models/referrals/ReferralRequest.js';
import { notifyCandidate, notifyRecruiter } from '../../utils/notifyHelper.js';
import { getIo } from '../../socket/index.js';
import { emitReferralUpdate } from '../../socket/socketEmitters.js';

const VALID_TRANSITIONS = {
  pending:   ['accepted', 'rejected'],
  accepted:  ['applied'],
  rejected:  [],
  referred:  [],
  interview: [],
  hired:     [],
  paid:      [],
  applied:   [],
};

const STATUS_MESSAGES = {
  accepted: { title: 'Referral Accepted!', msg: 'Your referral request has been accepted. Check the apply link inside.' },
  rejected: { title: 'Referral Update',    msg: 'Your referral request was not approved this time.' },
  applied:  { title: 'Candidate Applied!', msg: 'The candidate has applied at your company.' },
};

export const updateReferralStatus = async (request, reply) => {
  try {
    const requestId = parseInt(request.params.id, 10);
    const actorId   = request.user.id;
    const actorRole = request.user.role ?? 'candidate';
    const { status, notes, apply_link } = request.body;

    const rr = await ReferralRequest.query()
      .findById(requestId)
      .withGraphFetched('referralJob');

    if (!rr) {
      return reply.status(404).send({ success: false, message: 'Referral request not found.' });
    }

    // Validate transition
    const allowed = VALID_TRANSITIONS[rr.status] ?? [];
    if (!allowed.includes(status)) {
      return reply.status(422).send({
        success: false,
        message: `Cannot transition from "${rr.status}" to "${status}".`,
      });
    }

    // Authorization
    if (status === 'applied') {
      // Only the candidate who sent the request can mark applied
      if (rr.candidate_id !== actorId) {
        return reply.status(403).send({ success: false, message: 'Only the applicant can mark as applied.' });
      }
    } else {
      // All other transitions: only the referrer
      if (rr.referrer_id !== actorId || rr.referrer_role !== actorRole) {
        return reply.status(403).send({ success: false, message: 'Only the referrer can update this request.' });
      }
    }

    // apply_link is required when accepting
    if (status === 'accepted' && !apply_link?.trim()) {
      return reply.status(422).send({ success: false, message: 'apply_link is required when accepting.' });
    }

    const timeline = Array.isArray(rr.timeline) ? [...rr.timeline] : [];
    timeline.push({ status, at: new Date().toISOString(), note: notes ?? null });

    const patch = {
      status,
      timeline,
      updated_at: new Date().toISOString(),
    };
    if (status === 'accepted') {
      patch.apply_link = apply_link.trim();
      if (notes) patch.notes = notes;
    }

    const updated = await rr.$query().patchAndFetch(patch);

    const jobLabel = rr.referralJob
      ? ` (${rr.referralJob.job_title} at ${rr.referralJob.company_name})`
      : '';

    if (status === 'applied') {
      // Notify the referrer — actor is the applying candidate (auth enforces actorId === rr.candidate_id)
      const notif = STATUS_MESSAGES.applied;
      const msg   = `${notif.msg}${jobLabel}`;
      const appliedActor = { type: 'candidate', id: actorId };

      if (rr.referrer_role === 'candidate') {
        notifyCandidate(rr.referrer_id, { type: 'referral_update', title: notif.title, message: msg, actionUrl: '/candidate/referrals?tab=received', actor: appliedActor });
      } else {
        notifyRecruiter(rr.referrer_id, { type: 'referral_update', title: notif.title, message: msg, actionUrl: '/recruiter/referrals?tab=received', actor: appliedActor });
      }

      try {
        const io = getIo?.();
        if (io) emitReferralUpdate(io, rr.referrer_id, { id: updated.id, status, title: notif.title, message: msg, timeline: updated.timeline, updated_at: updated.updated_at });
      } catch { /* non-fatal */ }

    } else {
      // Notify the candidate — actor is the referrer (auth enforces actorId === rr.referrer_id, actorRole === rr.referrer_role)
      const notif = STATUS_MESSAGES[status];
      if (notif) {
        const msg = `${notif.msg}${jobLabel}`;
        const referrerActor = { type: actorRole, id: actorId };
        notifyCandidate(rr.candidate_id, { type: 'referral_update', title: notif.title, message: msg, actionUrl: '/candidate/referrals?tab=sent', actor: referrerActor });

        try {
          const io = getIo?.();
          if (io) emitReferralUpdate(io, rr.candidate_id, { id: updated.id, status, title: notif.title, message: msg, timeline: updated.timeline, apply_link: updated.apply_link, updated_at: updated.updated_at });
        } catch { /* non-fatal */ }
      }
    }

    return reply.send({
      success: true,
      message: 'Referral status updated.',
      data:    { id: updated.id, status: updated.status, timeline: updated.timeline },
    });
  } catch (err) {
    throw err;
  }
};
