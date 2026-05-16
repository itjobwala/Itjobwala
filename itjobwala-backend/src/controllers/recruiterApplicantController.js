import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';

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
      sortOrder = 'desc' 
    } = request.query;

    const query = Application.query()
      .join('jobs', 'applications.job_id', 'jobs.id')
      .where('jobs.recruiter_id', recruiterId)
      .withGraphFetched('applicant');

    if (jobId) {
      query.where('applications.job_id', jobId.replace('job_', ''));
    }

    if (status) {
      query.where('applications.status', status);
    }

    // Sort mapping
    const sortCol = sortBy === 'appliedDate' ? 'applications.applied_at' : 
                   sortBy === 'status' ? 'applications.status' : 'applications.applied_at';
    
    query.orderBy(sortCol, sortOrder);

    const pageIndex = Math.max(0, parseInt(page, 10) - 1);
    const pageSize = parseInt(limit, 10);

    const result = await query.page(pageIndex, pageSize);

    const applicants = result.results.map(app => {
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
        profilePhoto: candidate.profile_photo,
        resume: app.resume_url || candidate.resume,
        skills: candidate.skills || [],
        experience: candidate.experience_years || 0,
        profile: {
          title: candidate.current_title || 'Software Engineer',
          location: candidate.location,
          about: candidate.about
        }
      };
    });

    return reply.status(200).send({
      success: true,
      message: 'Applicants retrieved successfully',
      data: {
        applicants,
        pagination: {
          page: pageIndex + 1,
          limit: pageSize,
          total: result.total,
          pages: Math.ceil(result.total / pageSize),
          hasNextPage: (pageIndex + 1) * pageSize < result.total,
          hasPrevPage: pageIndex > 0
        }
      }
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
      .select('applications.*', 'jobs.title as jobTitle')
      .first();

    if (!application) {
      return reply.status(404).send({ success: false, message: 'Applicant not found', error: 'NOT_FOUND' });
    }

    const candidate = application.applicant;

    return reply.status(200).send({
      success: true,
      message: 'Applicant retrieved successfully',
      data: {
        id: `applicant_${application.id}`,
        candidateId: `candidate_${candidate.id}`,
        candidateName: candidate.full_name,
        candidateEmail: candidate.email,
        jobTitle: application.jobTitle,
        jobId: `job_${application.job_id}`,
        appliedDate: application.applied_at,
        status: application.status,
        profilePhoto: candidate.profile_photo,
        resume: application.resume_url || candidate.resume,
        skills: candidate.skills || [],
        experience: candidate.experience_years || 0,
        profile: {
          title: candidate.current_title || 'Software Engineer',
          location: candidate.location,
          about: candidate.about,
          phone: candidate.mobile,
          linkedin: candidate.linked_in,
          github: candidate.github
        },
        applicationNotes: application.note
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
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
      .select('applications.*')
      .first();

    if (!application) {
      return reply.status(404).send({ success: false, message: 'Applicant not found', error: 'NOT_FOUND' });
    }

    // Status Flow Validation
    const validTransitions = {
      'new': ['reviewing', 'rejected'],
      'reviewing': ['shortlisted', 'rejected'],
      'shortlisted': ['hired', 'rejected'],
      'rejected': [],
      'hired': []
    };

    if (application.status !== status && !validTransitions[application.status].includes(status)) {
      return reply.status(409).send({
        success: false,
        message: `Cannot transition from ${application.status} to ${status} status`,
        error: 'INVALID_TRANSITION',
        details: {
          currentStatus: application.status,
          requestedStatus: status,
          validTransitions: validTransitions[application.status],
          explanation: 'Status can only move forward or to rejected'
        }
      });
    }

    const updated = await application.$query().patchAndFetch({ status, note: notes });

    return reply.status(200).send({
      success: true,
      message: 'Applicant status updated successfully',
      data: { 
        id: `applicant_${updated.id}`, 
        candidateId: `candidate_${application.applicant_id}`,
        candidateName: application.applicant?.full_name || 'Candidate',
        candidateEmail: application.applicant?.email,
        jobTitle: application.jobTitle || 'Unknown',
        jobId: `job_${application.job_id}`,
        appliedDate: updated.applied_at,
        status: updated.status,
        profilePhoto: application.applicant?.profile_photo,
        resume: updated.resume_url || application.applicant?.resume,
        skills: application.applicant?.skills || [],
        experience: application.applicant?.experience_years || 0,
        profile: {
          title: application.applicant?.current_title || 'Software Engineer',
          location: application.applicant?.location,
          about: application.applicant?.about
        }
      }
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
  const { joiningDate } = request.body;
  if (joiningDate) {
    // Basic date validation
    if (new Date(joiningDate) < new Date()) {
      return reply.status(400).send({ 
        success: false, 
        message: 'Joining date must be in the future', 
        error: 'VALIDATION_ERROR' 
      });
    }
  }
  
  // Custom logic for hire
  request.body = { ...request.body, status: 'hired' };
  return updateStatus(request, reply);
};
