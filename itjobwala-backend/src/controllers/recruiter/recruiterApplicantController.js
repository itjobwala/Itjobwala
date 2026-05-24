import Application from '../../models/jobs/Application.js';
import Job from '../../models/jobs/Job.js';
import Activity from '../../models/recruiter/Activity.js';
import User from '../../models/candidate/User.js';
import { notifyCandidate, notifyRecruiter } from '../../utils/notifyHelper.js';

function formatApplicant(app) {
  const candidate = app.applicant;
  return {
    id: `applicant_${app.id}`,
    candidateId: `candidate_${candidate.id}`,
    candidateName: candidate.full_name,
    candidateEmail: candidate.email,
    jobTitle: app.job_title || 'Unknown Position',
    jobId: `job_${app.job_id}`,
    appliedDate: app.applied_at,
    status: app.status,
    profilePhoto: candidate.profile_photo_url || null,
    resume: app.resume_url || candidate.resume_url || null,
    skills: typeof candidate.skills === 'string'
      ? JSON.parse(candidate.skills)
      : (candidate.skills || []),
    experience: candidate.experience_years || 0,
    profile: {
      title: candidate.title || null,
      location: candidate.location || null,
      about: candidate.about || null,
    },
  };
}

export const getApplicants = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const {
      page = 1,
      limit = 20,
      jobId,
      status,
      search,
      sortBy = 'appliedDate',
      sortOrder = 'desc',
    } = request.query;

    const query = Application.query()
      .join('jobs', 'applications.job_id', 'jobs.id')
      .where('jobs.recruiter_id', recruiterId)
      .withGraphFetched('applicant')
      .select('applications.*', 'jobs.title as job_title');

    if (jobId) {
      query.where('applications.job_id', jobId.replace('job_', ''));
    }
    if (status) {
      query.where('applications.status', status);
    }
    if (search) {
      query.whereExists(
        User.query()
          .whereColumn('users.id', 'applications.user_id')
          .where(b =>
            b.where('users.full_name', 'ILIKE', `%${search}%`)
             .orWhere('users.email', 'ILIKE', `%${search}%`)
          )
      );
    }

    const sortCol = sortBy === 'status' ? 'applications.status' : 'applications.applied_at';
    query.orderBy(sortCol, sortOrder);

    const pageIndex = Math.max(0, parseInt(page, 10) - 1);
    const pageSize = parseInt(limit, 10);

    const result = await query.page(pageIndex, pageSize);

    return reply.status(200).send({
      success: true,
      message: 'Applicants retrieved successfully',
      data: {
        applicants: result.results.map(formatApplicant),
        pagination: {
          page: pageIndex + 1,
          limit: pageSize,
          total: result.total,
          pages: Math.ceil(result.total / pageSize),
          hasNextPage: (pageIndex + 1) * pageSize < result.total,
          hasPrevPage: pageIndex > 0,
        },
      },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getApplicantById = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const applicantId = request.params.applicantId.replace('applicant_', '');

    const application = await Application.query()
      .join('jobs', 'applications.job_id', 'jobs.id')
      .where('applications.id', applicantId)
      .where('jobs.recruiter_id', recruiterId)
      .withGraphFetched('applicant')
      .select('applications.*', 'jobs.title as job_title')
      .first();

    if (!application) {
      return reply.status(404).send({ success: false, message: 'Applicant not found', error: 'NOT_FOUND' });
    }

    const candidate = application.applicant;

    return reply.status(200).send({
      success: true,
      message: 'Applicant retrieved successfully',
      data: {
        ...formatApplicant(application),
        profile: {
          title: candidate.title || null,
          location: candidate.location || null,
          about: candidate.about || null,
          phone: candidate.mobile || null,
          linkedin: candidate.linked_in || null,
          github: candidate.github || null,
        },
        coverLetter: application.cover_letter || null,
      },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// Valid status values from DB enum
const VALID_TRANSITIONS = {
  applied:     ['shortlisted', 'rejected'],
  shortlisted: ['interview', 'rejected'],
  interview:   ['hired', 'rejected'],
  rejected:    [],
  hired:       [],
  selected:    ['hired', 'rejected'],
  offer:       ['hired', 'rejected'],
  withdrawn:   [],
};

export const updateStatus = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const applicantId = request.params.applicantId.replace('applicant_', '');
    const { status, notes } = request.body;

    const application = await Application.query()
      .join('jobs', 'applications.job_id', 'jobs.id')
      .where('applications.id', applicantId)
      .where('jobs.recruiter_id', recruiterId)
      .withGraphFetched('applicant')
      .select('applications.*', 'jobs.title as job_title')
      .first();

    if (!application) {
      return reply.status(404).send({ success: false, message: 'Applicant not found', error: 'NOT_FOUND' });
    }

    const allowedNext = VALID_TRANSITIONS[application.status] ?? [];
    if (application.status !== status && !allowedNext.includes(status)) {
      return reply.status(409).send({
        success: false,
        message: `Cannot move from '${application.status}' to '${status}'`,
        error: 'INVALID_TRANSITION',
        details: {
          currentStatus: application.status,
          requestedStatus: status,
          validTransitions: allowedNext,
        },
      });
    }

    const updated = await application.$query().patchAndFetch({ status });

    // Fire notifications (non-blocking)
    const candidateId = application.user_id;
    const candidateName = application.applicant?.full_name || 'The candidate';
    const jobTitle = application.job_title || 'the position';
    const appUrl  = `/candidate/applications/app_${application.id}`;
    const appRecruiterUrl = `/recruiter/applicants/applicant_${application.id}`;

    const CANDIDATE_MESSAGES = {
      shortlisted: { type: 'shortlist',    title: 'Application Shortlisted', message: `Great news! Your application for "${jobTitle}" has been shortlisted.` },
      interview:   { type: 'interview',    title: 'Selected for Interview',  message: `You've been selected for an interview for "${jobTitle}". Check your applications for details.` },
      hired:       { type: 'application',  title: 'Offer Extended 🎉',       message: `Congratulations! You've been hired for "${jobTitle}".` },
      rejected:    { type: 'application',  title: 'Application Update',      message: `Thank you for applying for "${jobTitle}". We have moved forward with other candidates.` },
    };

    const RECRUITER_MESSAGES = {
      shortlisted: { type: 'shortlist',   title: 'Candidate Shortlisted', message: `You shortlisted ${candidateName} for "${jobTitle}"` },
      interview:   { type: 'interview',   title: 'Interview Stage',        message: `${candidateName} moved to interview stage for "${jobTitle}"` },
      hired:       { type: 'application', title: 'Candidate Hired',        message: `You hired ${candidateName} for "${jobTitle}"` },
      rejected:    { type: 'application', title: 'Candidate Rejected',     message: `You rejected ${candidateName} for "${jobTitle}"` },
    };

    if (CANDIDATE_MESSAGES[status]) {
      notifyCandidate(candidateId, { ...CANDIDATE_MESSAGES[status], actionUrl: appUrl });
    }
    if (RECRUITER_MESSAGES[status]) {
      notifyRecruiter(recruiterId, { ...RECRUITER_MESSAGES[status], actionUrl: appRecruiterUrl });
    }

    return reply.status(200).send({
      success: true,
      message: 'Applicant status updated successfully',
      data: formatApplicant({ ...application, ...updated, job_title: application.job_title }),
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const shortlistApplicant = async (request, reply) => {
  request.body = { ...request.body, status: 'shortlisted' };
  return updateStatus(request, reply);
};

export const rejectApplicant = async (request, reply) => {
  request.body = { ...request.body, status: 'rejected' };
  return updateStatus(request, reply);
};

export const hireApplicant = async (request, reply) => {
  const { joiningDate } = request.body || {};
  if (joiningDate && new Date(joiningDate) < new Date()) {
    return reply.status(400).send({
      success: false,
      message: 'Joining date must be in the future',
      error: 'VALIDATION_ERROR',
    });
  }
  request.body = { ...request.body, status: 'hired' };
  return updateStatus(request, reply);
};
