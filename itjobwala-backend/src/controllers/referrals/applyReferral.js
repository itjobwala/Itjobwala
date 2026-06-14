import ReferralJob     from '../../models/referrals/ReferralJob.js';
import ReferralRequest from '../../models/referrals/ReferralRequest.js';
import { notifyCandidate } from '../../utils/notifyHelper.js';

export const applyReferral = async (request, reply) => {
  try {
    const referralJobId = parseInt(request.params.id, 10);
    const candidateId   = request.user.id;
    const { message, resume_url, linkedin_url } = request.body ?? {};

    const job = await ReferralJob.query().findById(referralJobId);
    if (!job || !job.is_active) {
      return reply.status(404).send({ success: false, message: 'Referral not found.' });
    }

    // Prevent self-referral
    if (job.referral_owner_id === candidateId && job.referral_owner_role === 'candidate') {
      return reply.status(409).send({ success: false, message: 'You cannot request a referral from yourself.' });
    }

    // Prevent duplicates
    const existing = await ReferralRequest.query().findOne({
      referral_job_id: referralJobId,
      candidate_id:    candidateId,
    });
    if (existing) {
      return reply.status(409).send({ success: false, message: 'You have already sent a referral request for this role.' });
    }

    const rr = await ReferralRequest.query().insertAndFetch({
      referral_job_id: referralJobId,
      candidate_id:    candidateId,
      referrer_id:     job.referral_owner_id,
      referrer_role:   job.referral_owner_role,
      message:         message ?? null,
      resume_url:      resume_url ?? null,
      linkedin_url:    linkedin_url ?? null,
      status:          'pending',
      is_paid:         false,
      timeline:        [{ status: 'pending', at: new Date().toISOString(), note: 'Referral request sent' }],
    });

    // Notify referrer if they are a candidate
    if (job.referral_owner_role === 'candidate') {
      notifyCandidate(job.referral_owner_id, {
        type:      'referral_request',
        title:     'New Referral Request',
        message:   `Someone requested a referral for "${job.job_title}" at ${job.company_name}`,
        actionUrl: `/candidate/referrals?tab=received`,
        actor:     { type: 'candidate', id: candidateId },
      });
    }

    return reply.status(201).send({
      success: true,
      message: 'Referral request submitted.',
      data:    { id: rr.id, status: rr.status },
    });
  } catch (err) {
    throw err;
  }
};
