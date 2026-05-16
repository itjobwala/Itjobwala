import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Activity from '../models/Activity.js';

export const getDashboardStats = async (request, reply) => {
  try {
    const recruiterId = request.user.id;

    // In a real app we would compute this efficiently with DB aggregations
    // For now we mock the shape while calculating what we can easily
    const jobsCount = await Job.query().where({ recruiter_id: recruiterId, status: 'active' }).resultSize();

    // To get total applicants, we'd join jobs and applications
    const applications = await Application.query()
      .join('jobs', 'applications.job_id', 'jobs.id')
      .where('jobs.recruiter_id', recruiterId);

    const totalApplicants = applications.length;

    return reply.status(200).send({
      success: true,
      message: 'Dashboard stats fetched.',
      data: {
        active_jobs: jobsCount,
        active_jobs_change: 0, // Mock delta
        total_applicants: totalApplicants,
        applicants_change: 0, // Mock delta
        interviews_scheduled: applications.filter(a => a.status === 'interview').length,
        interviews_change: 0,
        offers_made: applications.filter(a => a.status === 'offer').length,
        offers_change: 0,
        profile_views: 0, // Mock
        profile_views_change: 0,
        time_to_hire_days: 0 // Mock
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getPostedJobs = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const { page = 1, limit = 10, status, sort = 'newest', q } = request.query;

    const query = Job.query().where('recruiter_id', recruiterId);

    if (status) query.where('status', status);
    if (q) query.where('title', 'ILIKE', `%${q}%`);

    if (sort === 'newest') query.orderBy('created_at', 'desc');
    else query.orderBy('created_at', 'asc');

    const pageIndex = Math.max(0, parseInt(page, 10) - 1);
    const pageSize = parseInt(limit, 10);

    const result = await query.page(pageIndex, pageSize);

    return reply.status(200).send({
      success: true,
      message: 'Posted jobs fetched.',
      data: {
        jobs: result.results.map(job => ({
          id: `job_${job.id}`,
          title: job.title,
          location: job.location,
          work_mode: job.work_mode,
          job_type: job.job_type,
          status: job.status,
          applicants_count: job.applicants || 0,
          new_applicants_count: 0,
          shortlisted_count: 0,
          views: 0,
          posted_at: job.posted_at || job.created_at,
          closes_at: job.closes_at
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

export const getRecentApplicants = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const limit = parseInt(request.query.limit, 10) || 8;

    const applications = await Application.query()
      .join('jobs', 'applications.job_id', 'jobs.id')
      .join('users', 'applications.user_id', 'users.id')
      .where('jobs.recruiter_id', recruiterId)
      .select(
        'applications.*',
        'jobs.id as job_id_raw',
        'jobs.title as job_title',
        'users.id as user_id_raw',
        'users.full_name as candidate_name',
        'users.location as candidate_location',
        'users.experience_years as candidate_exp'
      )
      .orderBy('applications.applied_at', 'desc')
      .limit(limit);

    return reply.status(200).send({
      success: true,
      message: 'Recent applicants fetched.',
      data: {
        applicants: applications.map(app => ({
          application_id: `app_${app.id}`,
          candidate_id: `cand_${app.user_id_raw}`,
          candidate_name: app.candidate_name,
          candidate_initials: app.candidate_name ? app.candidate_name.substring(0, 2).toUpperCase() : 'NA',
          candidate_avatar_color_class: 'from-blue-500 to-indigo-600', // Mock
          job_id: `job_${app.job_id_raw}`,
          job_title: app.job_title,
          experience_years: app.candidate_exp,
          location: app.candidate_location,
          status: app.status,
          match_score: 85, // Mock score
          applied_at: app.applied_at
        }))
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getPipeline = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const jobId = request.query.job_id ? request.query.job_id.replace('job_', '') : null;

    const query = Application.query()
      .join('jobs', 'applications.job_id', 'jobs.id')
      .where('jobs.recruiter_id', recruiterId);

    if (jobId) query.where('jobs.id', jobId);

    const applications = await query;

    const stages = [
      { stage: 'applied', label: 'Applied', color: 'blue' },
      { stage: 'shortlisted', label: 'Shortlisted', color: 'purple' },
      { stage: 'interview', label: 'Interview', color: 'amber' },
      { stage: 'offer', label: 'Offer', color: 'green' },
      { stage: 'hired', label: 'Hired', color: 'emerald' },
      { stage: 'rejected', label: 'Rejected', color: 'red' }
    ];

    const data = stages.map(s => ({
      ...s,
      count: applications.filter(a => a.status === s.stage).length
    }));

    return reply.status(200).send({
      success: true,
      message: 'Pipeline fetched.',
      data: { stages: data }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getActivityFeed = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const limit = parseInt(request.query.limit, 10) || 10;

    const activities = await Activity.query()
      .where('recruiter_id', recruiterId)
      .orderBy('created_at', 'desc')
      .limit(limit);

    return reply.status(200).send({
      success: true,
      message: 'Activity feed fetched.',
      data: {
        activities: activities.map(act => ({
          id: `act_${act.id}`,
          type: act.type,
          message: act.message,
          entity_id: act.entity_id,
          entity_type: act.entity_type,
          created_at: act.created_at
        }))
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
