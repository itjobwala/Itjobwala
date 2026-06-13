import SavedJob from '../../models/jobs/SavedJob.js';

export const getSavedJobs = async (request, reply) => {
  try {
    const userId = request.user.id;
    const { page = 1, limit = 10, sort = 'newest' } = request.query;

    const query = SavedJob.query().where('user_id', userId).withGraphFetched('job.recruiter');

    if (sort === 'newest') query.orderBy('saved_at', 'desc');
    else query.orderBy('saved_at', 'asc');

    const pageIndex = Math.max(0, parseInt(page, 10) - 1);
    const pageSize = Math.max(1, parseInt(limit, 10) || 10);

    const result = await query.page(pageIndex, pageSize);

    return reply.status(200).send({
      success: true,
      message: 'Saved jobs fetched.',
      data: {
        saved_jobs: result.results.map(save => ({
          id: `saved_${save.id}`,
          job_id: `job_${save.job_id}`,
          title: save.job?.title || 'Unknown Position',
          company: save.job?.recruiter?.company_name || save.job?.company_name || 'Unknown Company',
          company_logo: save.job?.recruiter?.logo || null,
          company_color_class: save.job?.recruiter?.color_class || null,
          company_verified: save.job?.recruiter?.is_verified === true,
          location: save.job?.location || 'Not Specified',
          salary_min: save.job?.salary_min || 0,
          salary_max: save.job?.salary_max || 0,
          work_mode: save.job?.work_mode || 'onsite',
          job_type: save.job?.job_type || 'full-time',
          is_active: save.job?.status === 'active',
          saved_at: save.saved_at
        })),
        pagination: {
          page: pageIndex + 1,
          limit: pageSize,
          total: result.total,
          total_pages: Math.ceil(result.total / pageSize),
          has_next: (pageIndex + 1) * pageSize < result.total,
          has_prev: pageIndex > 0
        }
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const saveJob = async (request, reply) => {
  try {
    const userId = request.user.id;
    const jobId = request.body.job_id.replace('job_', '');
    const actualJobId = parseInt(jobId, 10);

    const savedJob = await SavedJob.query().insert({
      user_id: userId,
      job_id: actualJobId
    });

    return reply.status(201).send({
      success: true,
      message: 'Job saved successfully.',
      data: { saved_id: `saved_${savedJob.id}` }
    });
  } catch (error) {
    if (error.code === '23505' || error.name === 'UniqueViolationError') {
      return reply.status(409).send({ success: false, message: 'Job is already saved.' });
    }
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const unsaveJob = async (request, reply) => {
  try {
    const userId = request.user.id;
    const jobId = request.params.job_id.replace('job_', '');

    await SavedJob.query().delete().where({ user_id: userId, job_id: jobId });

    return reply.status(200).send({
      success: true,
      message: 'Job removed from saved list.',
      data: {}
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
