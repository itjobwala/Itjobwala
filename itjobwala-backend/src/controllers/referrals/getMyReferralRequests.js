import ReferralRequest from '../../models/referrals/ReferralRequest.js';

export const getMyReferralRequests = async (request, reply) => {
  try {
    const candidateId = request.user.id;
    const { status, page = 1, limit = 20 } = request.query;
    const pageIndex = Math.max(0, parseInt(page, 10) - 1);
    const pageSize  = parseInt(limit, 10);

    let query = ReferralRequest.query()
      .where('candidate_id', candidateId)
      .withGraphFetched('referralJob')
      .orderBy('created_at', 'desc');

    if (status) query.where('status', status);

    const result = await query.page(pageIndex, pageSize);

    const requests = result.results.map(rr => ({
      id:           rr.id,
      status:       rr.status,
      message:      rr.message,
      resume_url:   rr.resume_url,
      linkedin_url: rr.linkedin_url,
      notes:        rr.notes,
      apply_link:   rr.apply_link ?? null,
      is_paid:      rr.is_paid,
      timeline:     rr.timeline ?? [],
      created_at:   rr.created_at,
      updated_at:   rr.updated_at,
      referral_job: rr.referralJob ? {
        id:           rr.referralJob.id,
        job_title:    rr.referralJob.job_title,
        company_name: rr.referralJob.company_name,
        location:     rr.referralJob.location,
        salary_range: rr.referralJob.salary_range,
        skills:       rr.referralJob.skills ?? [],
      } : null,
    }));

    return reply.send({
      success: true,
      message: 'Referral requests fetched.',
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
