import ReferralRequest from '../../models/referrals/ReferralRequest.js';
import User            from '../../models/candidate/User.js';

export const getReceivedReferrals = async (request, reply) => {
  try {
    const referrerId = request.user.id;
    const referrerRole = request.user.role ?? 'candidate';
    const { status, page = 1, limit = 20 } = request.query;
    const pageIndex = Math.max(0, parseInt(page, 10) - 1);
    const pageSize  = parseInt(limit, 10);

    let query = ReferralRequest.query()
      .where('referrer_id', referrerId)
      .where('referrer_role', referrerRole)
      .withGraphFetched('referralJob')
      .orderBy('created_at', 'desc');

    if (status) query.where('status', status);

    const result = await query.page(pageIndex, pageSize);

    const requests = await Promise.all(result.results.map(async rr => {
      const candidate = await User.query()
        .findById(rr.candidate_id)
        .select('id', 'full_name', 'title', 'profile_photo_url', 'location', 'experience_years');

      return {
        id:          rr.id,
        status:      rr.status,
        message:     rr.message,
        resume_url:  rr.resume_url,
        linkedin_url: rr.linkedin_url,
        notes:       rr.notes,
        apply_link:  rr.apply_link ?? null,
        is_paid:     rr.is_paid,
        timeline:    rr.timeline ?? [],
        created_at:  rr.created_at,
        updated_at:  rr.updated_at,
        candidate:   candidate ? {
          id:               candidate.id,
          name:             candidate.full_name,
          title:            candidate.title,
          photo:            candidate.profile_photo_url,
          location:         candidate.location,
          experience_years: candidate.experience_years,
        } : null,
        referral_job: rr.referralJob ? {
          id:           rr.referralJob.id,
          job_title:    rr.referralJob.job_title,
          company_name: rr.referralJob.company_name,
          location:     rr.referralJob.location,
          salary_range: rr.referralJob.salary_range,
        } : null,
      };
    }));

    return reply.send({
      success: true,
      message: 'Received referrals fetched.',
      data: {
        requests,
        pagination: {
          page: pageIndex + 1, limit: pageSize, total: result.total,
          total_pages: Math.ceil(result.total / pageSize),
          has_next: (pageIndex + 1) * pageSize < result.total,
          has_prev: pageIndex > 0,
        },
      },
    });
  } catch (err) {
    throw err;
  }
};
