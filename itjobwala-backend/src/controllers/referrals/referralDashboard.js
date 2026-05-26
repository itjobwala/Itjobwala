import ReferralJob     from '../../models/referrals/ReferralJob.js';
import ReferralRequest from '../../models/referrals/ReferralRequest.js';

export const getReferralDashboard = async (request, reply) => {
  try {
    const userId = request.user.id;
    const role   = request.user.role ?? 'candidate';

    const [myJobs, sentCount, receivedCounts] = await Promise.all([
      ReferralJob.query()
        .where('referral_owner_id', userId)
        .where('referral_owner_role', role)
        .where('is_active', true)
        .select('id', 'job_title', 'company_name', 'created_at')
        .orderBy('created_at', 'desc')
        .limit(5),

      // Sent referral requests (candidate only)
      role === 'candidate'
        ? ReferralRequest.query().where('candidate_id', userId).resultSize()
        : Promise.resolve(0),

      // Received referral requests stats
      ReferralRequest.query()
        .where('referrer_id', userId)
        .where('referrer_role', role)
        .select('status')
        .then(rows => {
          const counts = { pending: 0, accepted: 0, hired: 0, paid: 0, total: rows.length };
          rows.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });
          return counts;
        }),
    ]);

    return reply.send({
      success: true,
      message: 'Referral dashboard fetched.',
      data: {
        my_active_referral_jobs: myJobs,
        sent_requests:           sentCount,
        received:                receivedCounts,
      },
    });
  } catch (err) {
    throw err;
  }
};
