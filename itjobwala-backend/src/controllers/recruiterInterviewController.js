import Application from '../models/Application.js';
import Interview from '../models/Interview.js';

function deriveStatus(scheduledAt) {
  if (!scheduledAt) return 'not_scheduled';
  return new Date(scheduledAt) > new Date() ? 'scheduled' : 'past';
}

function formatInterview(app, interview) {
  const candidate = app.applicant;
  return {
    id: interview ? `interview_${interview.id}` : `app_${app.id}`,
    applicationId: `applicant_${app.id}`,
    candidateName: candidate.full_name,
    candidateEmail: candidate.email,
    candidatePhoto: candidate.profile_photo_url || null,
    jobTitle: app.job_title || 'Unknown Position',
    jobId: `job_${app.job_id}`,
    scheduledAt: interview?.scheduled_at || null,
    durationMinutes: interview?.duration_minutes || null,
    interviewType: interview?.interview_type || null,
    meetingLink: interview?.meeting_link || null,
    location: interview?.location || null,
    notes: interview?.note || null,
    status: deriveStatus(interview?.scheduled_at),
  };
}

export const getInterviews = async (request, reply) => {
  try {
    const recruiterId = request.user.id;

    const applications = await Application.query()
      .join('jobs', 'applications.job_id', 'jobs.id')
      .where('jobs.recruiter_id', recruiterId)
      .where('applications.status', 'interview')
      .withGraphFetched('applicant')
      .select('applications.*', 'jobs.title as job_title')
      .orderBy('applications.updated_at', 'desc');

    if (applications.length === 0) {
      return reply.status(200).send({
        success: true,
        message: 'Interviews retrieved successfully',
        data: { interviews: [] },
      });
    }

    const appIds = applications.map(a => a.id);
    const interviewRecords = await Interview.query().whereIn('application_id', appIds);

    const interviewMap = {};
    for (const i of interviewRecords) {
      interviewMap[i.application_id] = i;
    }

    const interviews = applications.map(app =>
      formatInterview(app, interviewMap[app.id] || null)
    );

    return reply.status(200).send({
      success: true,
      message: 'Interviews retrieved successfully',
      data: { interviews },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const scheduleInterview = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const { applicationId, interviewType, scheduledAt, durationMinutes, meetingLink, location, note } = request.body;

    const appId = String(applicationId).replace('applicant_', '');

    const application = await Application.query()
      .join('jobs', 'applications.job_id', 'jobs.id')
      .where('applications.id', appId)
      .where('jobs.recruiter_id', recruiterId)
      .where('applications.status', 'interview')
      .withGraphFetched('applicant')
      .select('applications.*', 'jobs.title as job_title')
      .first();

    if (!application) {
      return reply.status(404).send({
        success: false,
        message: 'Application not found or not in interview status',
        error: 'NOT_FOUND',
      });
    }

    const validTypes = ['video', 'phone', 'in_person'];
    const errors = {};
    if (!scheduledAt) errors.scheduledAt = 'scheduledAt is required';
    else if (new Date(scheduledAt) <= new Date()) errors.scheduledAt = 'Interview must be scheduled in the future';
    if (!interviewType || !validTypes.includes(interviewType)) errors.interviewType = 'Must be video, phone, or in_person';

    if (Object.keys(errors).length > 0) {
      return reply.status(400).send({ success: false, message: 'Validation failed', error: 'VALIDATION_ERROR', details: errors });
    }

    const existing = await Interview.query().where('application_id', appId).first();

    let interview;
    if (existing) {
      interview = await existing.$query().patchAndFetch({
        interview_type: interviewType,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes || null,
        meeting_link: meetingLink || null,
        location: location || null,
        note: note || null,
      });
    } else {
      interview = await Interview.query().insertAndFetch({
        application_id: parseInt(appId, 10),
        recruiter_id: recruiterId,
        interview_type: interviewType,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes || null,
        meeting_link: meetingLink || null,
        location: location || null,
        note: note || null,
      });
    }

    return reply.status(200).send({
      success: true,
      message: 'Interview scheduled successfully',
      data: formatInterview(application, interview),
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
