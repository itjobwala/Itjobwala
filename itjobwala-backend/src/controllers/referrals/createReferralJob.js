import ReferralJob from '../../models/referrals/ReferralJob.js';

export const createReferralJob = async (request, reply) => {
  try {
    const {
      company_name, job_title, location, experience_required,
      salary_range, description, skills, referral_reward,
      average_response_time, referral_strength, recruiter_job_id,
    } = request.body;

    const ownerId   = request.user.id;
    const ownerRole = request.user.role ?? 'candidate';

    const job = await ReferralJob.query().insertAndFetch({
      recruiter_job_id:      recruiter_job_id ?? null,
      company_name,
      job_title,
      location:              location ?? null,
      experience_required:   experience_required ?? null,
      salary_range:          salary_range ?? null,
      description:           description ?? null,
      skills:                skills ?? [],
      referral_owner_id:     ownerId,
      referral_owner_role:   ownerRole,
      referral_reward:       referral_reward ?? null,
      average_response_time: average_response_time ?? null,
      referral_strength:     referral_strength ?? 0,
      is_active:             true,
    });

    return reply.status(201).send({
      success: true,
      message: 'Referral job created.',
      data:    { id: job.id, job_title: job.job_title, company_name: job.company_name },
    });
  } catch (err) {
    throw err;
  }
};
