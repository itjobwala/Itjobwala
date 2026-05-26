import ReferralJob     from '../../models/referrals/ReferralJob.js';
import ReferralRequest from '../../models/referrals/ReferralRequest.js';
import User            from '../../models/candidate/User.js';
import Recruiter       from '../../models/recruiter/Recruiter.js';

export const getReferralJobs = async (request, reply) => {
  try {
    const { page = 1, limit = 12, company, skills, location, sort = 'newest', mine } = request.query;
    const pageIndex = Math.max(0, parseInt(page, 10) - 1);
    const pageSize  = Math.min(50, parseInt(limit, 10));

    const userId  = request.user?.id;
    const role    = request.user?.role ?? 'candidate';
    const mineOnly = mine === 'true' || mine === true;

    let query = ReferralJob.query().where('is_active', true);

    if (mineOnly && userId) {
      // Return only the current user's own posts
      query = query.where('referral_owner_id', userId).where('referral_owner_role', role);
    } else if (userId) {
      // Exclude the current user's own referral postings from the browse list
      query = query.whereNot(builder =>
        builder.where('referral_owner_id', userId).where('referral_owner_role', role)
      );
    }

    if (company)  query.whereILike('company_name', `%${company}%`);
    if (location) query.whereILike('location', `%${location}%`);
    if (skills) {
      const skillList = skills.split(',').map(s => s.trim()).filter(Boolean);
      skillList.forEach(s => {
        query.whereRaw(`skills::text ILIKE ?`, [`%${s}%`]);
      });
    }

    if (sort === 'newest')  query.orderBy('created_at', 'desc');
    if (sort === 'popular') query.orderByRaw('(SELECT COUNT(*) FROM referral_requests WHERE referral_job_id = referral_jobs.id) DESC');

    const result = await query.page(pageIndex, pageSize);

    // Enrich with owner info + request count
    const jobs = await Promise.all(result.results.map(async job => {
      let ownerName  = null;
      let ownerPhoto = null;

      if (job.referral_owner_role === 'candidate') {
        const u = await User.query().findById(job.referral_owner_id).select('full_name', 'profile_photo_url');
        ownerName  = u?.full_name  ?? null;
        ownerPhoto = u?.profile_photo_url ?? null;
      } else {
        const r = await Recruiter.query().findById(job.referral_owner_id).select('full_name');
        ownerName = r?.full_name ?? null;
      }

      const requestCount = await ReferralRequest.query()
        .where('referral_job_id', job.id).resultSize();

      // Check if the current candidate has already applied
      let userRequest = null;
      if (userId && role === 'candidate') {
        const existing = await ReferralRequest.query().findOne({
          referral_job_id: job.id,
          candidate_id:    userId,
        });
        if (existing) userRequest = { id: existing.id, status: existing.status };
      }

      return {
        id:                    job.id,
        company_name:          job.company_name,
        job_title:             job.job_title,
        location:              job.location,
        experience_required:   job.experience_required,
        salary_range:          job.salary_range,
        skills:                job.skills ?? [],
        referral_reward:       job.referral_reward,
        average_response_time: job.average_response_time,
        referral_strength:     job.referral_strength,
        referral_owner_role:   job.referral_owner_role,
        owner_name:            ownerName,
        owner_photo:           ownerPhoto,
        request_count:         requestCount,
        is_mine:               userId ? (job.referral_owner_id === userId && job.referral_owner_role === role) : false,
        user_request:          userRequest,
        created_at:            job.created_at,
      };
    }));

    return reply.send({
      success: true,
      message: 'Referral jobs fetched.',
      data: {
        referral_jobs: jobs,
        pagination: {
          page:        pageIndex + 1,
          limit:       pageSize,
          total:       result.total,
          total_pages: Math.ceil(result.total / pageSize),
          has_next:    (pageIndex + 1) * pageSize < result.total,
          has_prev:    pageIndex > 0,
        },
      },
    });
  } catch (err) {
    throw err;
  }
};

export const getReferralJobById = async (request, reply) => {
  try {
    const { id } = request.params;
    const job = await ReferralJob.query().findById(id);

    if (!job || !job.is_active) {
      return reply.status(404).send({ success: false, message: 'Referral not found.' });
    }

    // Owner info
    let ownerName  = null;
    let ownerPhoto = null;
    if (job.referral_owner_role === 'candidate') {
      const u = await User.query().findById(job.referral_owner_id).select('full_name', 'profile_photo_url', 'title', 'location');
      ownerName  = u?.full_name  ?? null;
      ownerPhoto = u?.profile_photo_url ?? null;
    }

    const requestCount = await ReferralRequest.query().where('referral_job_id', id).resultSize();

    // If authenticated candidate, check if already applied
    let userRequest = null;
    if (request.user?.id && request.user?.role !== 'recruiter') {
      userRequest = await ReferralRequest.query().findOne({
        referral_job_id: id,
        candidate_id:    request.user.id,
      });
    }

    return reply.send({
      success: true,
      message: 'Referral job fetched.',
      data: {
        id:                    job.id,
        company_name:          job.company_name,
        job_title:             job.job_title,
        location:              job.location,
        experience_required:   job.experience_required,
        salary_range:          job.salary_range,
        description:           job.description,
        skills:                job.skills ?? [],
        referral_reward:       job.referral_reward,
        average_response_time: job.average_response_time,
        referral_strength:     job.referral_strength,
        referral_owner_id:     job.referral_owner_id,
        referral_owner_role:   job.referral_owner_role,
        owner_name:            ownerName,
        owner_photo:           ownerPhoto,
        request_count:         requestCount,
        created_at:            job.created_at,
        user_request:          userRequest
          ? { id: userRequest.id, status: userRequest.status }
          : null,
      },
    });
  } catch (err) {
    throw err;
  }
};
