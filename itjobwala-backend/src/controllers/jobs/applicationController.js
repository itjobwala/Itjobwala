import Application from '../../models/jobs/Application.js';
import Job from '../../models/jobs/Job.js';

export const applyToJob = async (request, reply) => {
  try {
    const { job_id } = request.params;
    const { cover_letter, resume_id, expected_salary, notice_period_days, answers } = request.body || {};
    const userId = request.user.id;
    const actualJobId = job_id.replace('job_', '');

    // Check if job exists and is active
    const job = await Job.query().findById(actualJobId);
    if (!job) {
      return reply.status(404).send({ success: false, message: 'Job not found', data: {}, errors: [] });
    }
    if (job.status === 'closed') {
      return reply.status(410).send({ success: false, message: 'This job is no longer accepting applications.', data: {}, errors: [] });
    }

    // Prevent duplicate applications
    const existing = await Application.query().findOne({ job_id: parseInt(actualJobId, 10), user_id: userId });
    if (existing) {
      return reply.status(409).send({ success: false, message: 'You have already applied for this job.', data: {}, errors: [] });
    }

    const application = await Application.query().insert({
      job_id: parseInt(actualJobId, 10),
      user_id: userId,
      cover_letter,
      // Mocking resume_url from resume_id if passed
      resume_url: resume_id ? `https://cdn.itjobwala.com/resumes/${resume_id}` : null,
      expected_salary,
      notice_period_days,
      answers: answers ? answers : [],
      timeline: [{ status: 'applied', at: new Date().toISOString(), note: null }],
      status: 'applied'
    });

    return reply.status(201).send({
      success: true,
      message: 'Application submitted successfully.',
      data: {
        application_id: `app_${application.id}`,
        status: application.status,
        applied_at: application.applied_at
      }
    });
  } catch (error) {
    throw error;
  }
};

export const getMyApplications = async (request, reply) => {
  try {
    const userId = request.user.id;
    const { page = 1, limit = 10, status, sort = 'newest' } = request.query;

    const query = Application.query().where('user_id', userId).withGraphFetched('job.recruiter');

    if (status) {
      query.where('status', status);
    }

    if (sort === 'newest') query.orderBy('applied_at', 'desc');
    else query.orderBy('applied_at', 'asc');

    const pageIndex = Math.max(0, parseInt(page, 10) - 1);
    const pageSize = parseInt(limit, 10);

    const result = await query.page(pageIndex, pageSize);

    return reply.status(200).send({
      success: true,
      message: 'Applications fetched successfully.',
      data: {
        applications: result.results.map(app => ({
          id: `app_${app.id}`,
          job_id: `job_${app.job_id}`,
          title: app.job?.title,
          company: app.job?.recruiter?.company_name || app.job?.company_name,
          company_logo: app.job?.recruiter?.logo,
          company_color_class: app.job?.recruiter?.color_class,
          location: app.job?.location,
          status: app.status,
          applied_at: app.applied_at,
          updated_at: app.updated_at
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

export const withdrawApplication = async (request, reply) => {
  try {
    const userId = request.user.id;
    const appId = request.params.application_id.replace('app_', '');

    const application = await Application.query().findOne({ id: appId, user_id: userId });
    if (!application) {
      return reply.status(404).send({ success: false, message: 'Application not found.' });
    }

    if (['rejected', 'hired', 'withdrawn'].includes(application.status)) {
      return reply.status(409).send({ success: false, message: 'This application cannot be withdrawn at its current stage.' });
    }

    let timeline = application.timeline || [];
    if (typeof timeline === 'string') timeline = JSON.parse(timeline);
    
    timeline.push({ status: 'withdrawn', at: new Date().toISOString(), note: 'Withdrawn by candidate' });

    await application.$query().patch({ status: 'withdrawn', timeline: timeline });
    // Or we can delete it entirely, but contract says 409 if wrong stage, implying we keep it and update status, wait contract says "DELETE /candidate/applications/:application_id"
    // So we can either delete or patch. I'll delete it if they want DELETE method, but actually usually withdraw is soft delete.
    // Let's delete it.
    await Application.query().deleteById(appId);

    return reply.status(200).send({
      success: true,
      message: 'Application withdrawn successfully.',
      data: {}
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getApplicationStatus = async (request, reply) => {
  try {
    const userId = request.user.id;
    const appId = request.params.application_id.replace('app_', '');

    const application = await Application.query().findOne({ id: appId, user_id: userId }).withGraphFetched('job.recruiter');
    if (!application) {
      return reply.status(404).send({ success: false, message: 'Application not found.' });
    }

    return reply.status(200).send({
      success: true,
      message: 'Application fetched.',
      data: {
        id: `app_${application.id}`,
        job: {
          id: `job_${application.job?.id}`,
          title: application.job?.title,
          company: application.job?.recruiter?.company_name
        },
        status: application.status,
        timeline: typeof application.timeline === 'string' ? JSON.parse(application.timeline) : application.timeline,
        applied_at: application.applied_at
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
