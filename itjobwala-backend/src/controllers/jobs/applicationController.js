import Application from '../../models/jobs/Application.js';
import Job from '../../models/jobs/Job.js';
import User from '../../models/candidate/User.js';
import ResumeInsight from '../../models/candidate/ResumeInsight.js';
import RecruiterFeedbackSignal from '../../models/candidate/RecruiterFeedbackSignal.js';
import Interview from '../../models/recruiter/Interview.js';
import { notifyRecruiter } from '../../utils/notifyHelper.js';

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
    if (job.status !== 'active') {
      return reply.status(410).send({ success: false, message: 'This job is not currently accepting applications.', data: {}, errors: [] });
    }

    // Prevent duplicate applications
    const existing = await Application.query().findOne({ job_id: parseInt(actualJobId, 10), user_id: userId });
    if (existing) {
      return reply.status(409).send({ success: false, message: 'You have already applied for this job.', data: {}, errors: [] });
    }

    // Resolve the candidate's real resume URL from their parsed resume insight,
    // falling back to the profile-level resume_url if the insight record is absent.
    let resume_url = null;
    const insight = await ResumeInsight.query()
      .findOne({ candidate_id: userId })
      .select('resume_url');
    if (insight?.resume_url) {
      resume_url = insight.resume_url;
    } else {
      const candidateProfile = await User.query().findById(userId).select('resume_url');
      resume_url = candidateProfile?.resume_url || null;
    }

    const application = await Application.query().insert({
      job_id: parseInt(actualJobId, 10),
      user_id: userId,
      cover_letter,
      resume_url,
      expected_salary,
      notice_period_days,
      answers: answers ? answers : [],
      timeline: [{ status: 'applied', at: new Date().toISOString(), note: null }],
      status: 'applied'
    });

    // Notify recruiter about the new application (non-blocking)
    User.query().findById(userId).then(candidate => {
      const candidateName = candidate?.full_name || 'A candidate';
      notifyRecruiter(job.recruiter_id, {
        type:      'application',
        title:     'New Application Received',
        message:   `${candidateName} applied for "${job.title}"`,
        actionUrl: `/recruiter/applicants/applicant_${application.id}`,
      });
    }).catch(() => {});

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
          company_verified: app.job?.recruiter?.is_verified === true,
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

    await application.$query().patch({ status: 'withdrawn', timeline });

    // Notify the recruiter (fire-and-forget)
    Job.query().findById(application.job_id).select('recruiter_id', 'title').then(job => {
      if (!job) return;
      User.query().findById(userId).select('full_name').then(candidate => {
        notifyRecruiter(job.recruiter_id, {
          type:      'application',
          title:     'Application Withdrawn',
          message:   `${candidate?.full_name || 'A candidate'} withdrew their application for "${job.title}"`,
          actionUrl: `/recruiter/applicants/applicant_${appId}`,
        });
      }).catch(() => {});
    }).catch(() => {});

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

    // Fetch recruiter feedback note and interview in parallel
    const [signal, interviewRecord] = await Promise.all([
      RecruiterFeedbackSignal.query()
        .where({ application_id: parseInt(appId, 10) })
        .whereNotNull('feedback_note')
        .orderBy('created_at', 'desc')
        .select('feedback_note')
        .first(),
      Interview.query()
        .where({ application_id: parseInt(appId, 10) })
        .first(),
    ]);

    const interview = interviewRecord ? {
      type:             interviewRecord.interview_type,
      scheduled_at:     interviewRecord.scheduled_at,
      duration_minutes: interviewRecord.duration_minutes ?? null,
      meeting_link:     interviewRecord.meeting_link ?? null,
      location:         interviewRecord.location ?? null,
      note:             interviewRecord.note ?? null,
      status: interviewRecord.scheduled_at
        ? (new Date(interviewRecord.scheduled_at) > new Date() ? 'scheduled' : 'past')
        : 'not_scheduled',
    } : null;

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
        timeline: typeof application.timeline === 'string' ? JSON.parse(application.timeline) : (application.timeline ?? []),
        applied_at: application.applied_at,
        feedback_note: signal?.feedback_note ?? null,
        interview,
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
