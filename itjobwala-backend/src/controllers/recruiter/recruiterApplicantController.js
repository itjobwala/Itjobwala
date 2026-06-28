import Application from '../../models/jobs/Application.js';
import Job from '../../models/jobs/Job.js';
import ResumeInsight from '../../models/candidate/ResumeInsight.js';
import Activity from '../../models/recruiter/Activity.js';
import User from '../../models/candidate/User.js';
import Interview from '../../models/recruiter/Interview.js';
import ProfileView from '../../models/recruiter/ProfileView.js';
import Recruiter from '../../models/recruiter/Recruiter.js';
import { notifyCandidate, notifyRecruiter } from '../../utils/notifyHelper.js';
import { saveFeedbackSignal, saveFeedbackNote } from '../../services/resume/feedbackSignal.service.js';
import { sendApplicationStatusEmail } from '../../services/email/mailer.service.js';

function safeJson(val) {
  if (!val) return null;
  if (typeof val === 'string') { try { return JSON.parse(val); } catch { return null; } }
  return val;
}

const SEND_INTERVIEW_ADVANCE_EMAIL = false;

const EMAIL_ON_STATUS = new Set(['shortlisted', 'hired', 'rejected']);
if (SEND_INTERVIEW_ADVANCE_EMAIL) EMAIL_ON_STATUS.add('interview');

const VALID_TRANSITIONS = {
  applied:     ['shortlisted', 'rejected'],
  shortlisted: ['interview', 'rejected'],
  interview:   ['hired', 'rejected'],
  rejected:    [],
  hired:       [],
  withdrawn:   [],
};

function buildCandidatePayload(status, jobTitle) {
  const msgs = {
    shortlisted: { type: 'shortlist',    title: 'Application Shortlisted', message: `Great news! Your application for "${jobTitle}" has been shortlisted.` },
    interview:   { type: 'interview',    title: 'Selected for Interview',  message: `You've been selected for an interview for "${jobTitle}". Check your applications for details.` },
    hired:       { type: 'application',  title: 'Offer Extended 🎉',       message: `Congratulations! You've been hired for "${jobTitle}".` },
    rejected:    { type: 'application',  title: 'Application Update',      message: `Thank you for applying for "${jobTitle}". We have moved forward with other candidates.` },
  };
  return msgs[status] ?? null;
}

function buildRecruiterPayload(status, candidateName, jobTitle) {
  const msgs = {
    shortlisted: { type: 'shortlist',   title: 'Candidate Shortlisted', message: `You shortlisted ${candidateName} for "${jobTitle}"` },
    interview:   { type: 'interview',   title: 'Interview Stage',        message: `${candidateName} moved to interview stage for "${jobTitle}"` },
    hired:       { type: 'application', title: 'Candidate Hired',        message: `You hired ${candidateName} for "${jobTitle}"` },
    rejected:    { type: 'application', title: 'Candidate Rejected',     message: `You rejected ${candidateName} for "${jobTitle}"` },
  };
  return msgs[status] ?? null;
}

/**
 * Shared core for single-status and bulk-status transitions.
 * Caller is responsible for ownership check and VALID_TRANSITIONS validation
 * before calling this. Returns the patched application row.
 */
async function applyTransition(application, status, recruiterId, { notes = null, log = null } = {}) {
  let timeline = application.timeline || [];
  if (typeof timeline === 'string') timeline = JSON.parse(timeline);
  timeline.push({ status, at: new Date().toISOString(), note: notes });

  const updated = await application.$query().patchAndFetch({ status, timeline });

  const candidateId     = application.user_id;
  const candidateName   = application.applicant?.full_name || 'The candidate';
  const jobTitle        = application.job_title || 'the position';
  const appUrl          = `/candidate/applications/app_${application.id}`;
  const appRecruiterUrl = `/recruiter/applicants/applicant_${application.id}`;

  const candidatePayload = buildCandidatePayload(status, jobTitle);
  const recruiterPayload = buildRecruiterPayload(status, candidateName, jobTitle);

  if (candidatePayload) {
    notifyCandidate(candidateId, { ...candidatePayload, actionUrl: appUrl, actor: { type: 'recruiter', id: recruiterId } });
  }
  if (recruiterPayload) {
    notifyRecruiter(recruiterId, { ...recruiterPayload, actionUrl: appRecruiterUrl });
  }

  if (EMAIL_ON_STATUS.has(status)) {
    const candidateEmail = application.applicant?.email;
    if (candidateEmail) {
      Recruiter.query()
        .findById(recruiterId)
        .select('company_name')
        .then(rec =>
          sendApplicationStatusEmail({
            to:             candidateEmail,
            name:           application.applicant?.full_name || null,
            jobTitle,
            companyName:    rec?.company_name || null,
            newStatus:      status,
            applicationUrl: appUrl,
          })
        )
        .catch(() => {});
    }
  }

  saveFeedbackSignal({
    candidateId,
    jobId:         application.job_id,
    recruiterId,
    applicationId: application.id,
    outcome:       status,
    log,
  });

  return updated;
}

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
    qaMatchScore: app.qa_match_score ?? null,
    skillEvidence: safeJson(app.skill_evidence),
    riskFlags: safeJson(app.risk_flags),
    weakEvidenceSkills: safeJson(app.weak_evidence_skills),
    missingSkills: safeJson(app.missing_skills),
    careerLevel: app.career_level_insight || null,
    certCount: app.cert_count ?? 0,
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
      minScore,
    } = request.query;

    const qaScoreSubquery = Application.knex().raw(
      '(SELECT ri.qa_match_score FROM resume_insights ri WHERE ri.candidate_id = applications.user_id LIMIT 1) as qa_match_score'
    );
    const skillEvidenceSubquery = Application.knex().raw(
      '(SELECT ri.skill_evidence FROM resume_insights ri WHERE ri.candidate_id = applications.user_id LIMIT 1) as skill_evidence'
    );
    const riskFlagsSubquery = Application.knex().raw(
      '(SELECT ri.risk_flags FROM resume_insights ri WHERE ri.candidate_id = applications.user_id LIMIT 1) as risk_flags'
    );
    const weakEvidenceSubquery = Application.knex().raw(
      '(SELECT ri.weak_evidence_skills FROM resume_insights ri WHERE ri.candidate_id = applications.user_id LIMIT 1) as weak_evidence_skills'
    );
    const missingSkillsSubquery = Application.knex().raw(
      '(SELECT ri.missing_skills FROM resume_insights ri WHERE ri.candidate_id = applications.user_id LIMIT 1) as missing_skills'
    );
    const careerLevelSubquery = Application.knex().raw(
      '(SELECT ri.career_level FROM resume_insights ri WHERE ri.candidate_id = applications.user_id LIMIT 1) as career_level_insight'
    );
    const certCountSubquery = Application.knex().raw(
      `(SELECT CASE WHEN ri.certification_entries IS NOT NULL THEN jsonb_array_length(ri.certification_entries::jsonb) ELSE 0 END FROM resume_insights ri WHERE ri.candidate_id = applications.user_id LIMIT 1) as cert_count`
    );

    const query = Application.query()
      .join('jobs', 'applications.job_id', 'jobs.id')
      .where('jobs.recruiter_id', recruiterId)
      .withGraphFetched('applicant')
      .select(
        'applications.*',
        'jobs.title as job_title',
        qaScoreSubquery,
        skillEvidenceSubquery,
        riskFlagsSubquery,
        weakEvidenceSubquery,
        missingSkillsSubquery,
        careerLevelSubquery,
        certCountSubquery,
      );

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

    const parsedMinScore = minScore ? parseInt(minScore, 10) : NaN;
    if (!isNaN(parsedMinScore) && parsedMinScore > 0) {
      query.whereRaw(
        '(SELECT ri.qa_match_score FROM resume_insights ri WHERE ri.candidate_id = applications.user_id LIMIT 1) >= ?',
        [parsedMinScore]
      );
    }

    if (sortBy === 'qaScore') {
      const dir = sortOrder === 'asc' ? 'ASC' : 'DESC';
      query.orderByRaw(
        `(SELECT ri.qa_match_score FROM resume_insights ri WHERE ri.candidate_id = applications.user_id LIMIT 1) ${dir} NULLS LAST`
      );
    } else {
      const sortCol = sortBy === 'status' ? 'applications.status' : 'applications.applied_at';
      query.orderBy(sortCol, sortOrder);
    }

    const pageIndex = Math.max(0, parseInt(page, 10) - 1);
    const pageSize = parseInt(limit, 10);

    // Score distribution across all matching applicants (without minScore, so recruiter sees the full picture)
    const scoreDistQuery = Application.query()
      .join('jobs', 'applications.job_id', 'jobs.id')
      .leftJoin('resume_insights as ri', 'ri.candidate_id', 'applications.user_id')
      .where('jobs.recruiter_id', recruiterId)
      .select(
        Application.knex().raw(`COUNT(*) FILTER (WHERE ri.qa_match_score >= 70)::int AS high_count`),
        Application.knex().raw(`COUNT(*) FILTER (WHERE ri.qa_match_score >= 50 AND ri.qa_match_score < 70)::int AS mid_count`),
        Application.knex().raw(`COUNT(*) FILTER (WHERE ri.qa_match_score IS NOT NULL AND ri.qa_match_score < 50)::int AS low_count`),
        Application.knex().raw(`COUNT(*) FILTER (WHERE ri.qa_match_score IS NULL)::int AS unscored_count`),
        Application.knex().raw(`COUNT(*)::int AS total`)
      );

    if (jobId) scoreDistQuery.where('applications.job_id', jobId.replace('job_', ''));
    if (status) scoreDistQuery.where('applications.status', status);

    const [result, scoreDist] = await Promise.all([
      query.page(pageIndex, pageSize),
      scoreDistQuery.first(),
    ]);

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
        score_distribution: {
          high_count:     scoreDist?.high_count     ?? 0,
          mid_count:      scoreDist?.mid_count      ?? 0,
          low_count:      scoreDist?.low_count      ?? 0,
          unscored_count: scoreDist?.unscored_count ?? 0,
          total:          scoreDist?.total          ?? 0,
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

    // Fire-and-forget: track this recruiter viewing the candidate's profile (dedup per day)
    ProfileView.knex().raw(
      `INSERT INTO profile_views (candidate_user_id, recruiter_id, viewed_date) VALUES (?, ?, ?) ON CONFLICT (candidate_user_id, recruiter_id, viewed_date) DO NOTHING`,
      [application.user_id, recruiterId, new Date().toISOString().split('T')[0]]
    ).catch(() => {});

    const candidate = application.applicant;

    const interviewRecord = await Interview.query()
      .where({ application_id: application.id })
      .first();

    const interview = interviewRecord ? {
      id:               `interview_${interviewRecord.id}`,
      type:             interviewRecord.interview_type,
      scheduled_at:     interviewRecord.scheduled_at,
      duration_minutes: interviewRecord.duration_minutes ?? null,
      meeting_link:     interviewRecord.meeting_link ?? null,
      location:         interviewRecord.location ?? null,
      notes:            interviewRecord.note ?? null,
      status: interviewRecord.scheduled_at
        ? (new Date(interviewRecord.scheduled_at) > new Date() ? 'scheduled' : 'past')
        : 'not_scheduled',
    } : null;

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
        interview,
      },
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

    const updated = await applyTransition(application, status, recruiterId, { notes, log: request.log });

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

/**
 * POST /recruiter/applicants/bulk-reject
 * Body: { applicationIds: string[] }  e.g. ["applicant_12", "applicant_34"]
 *
 * Ownership-checks all IDs in one query. Skips IDs that don't belong to this
 * recruiter or that are in a terminal/invalid state. Returns a summary.
 * Max 100 IDs per call (page-scoped selection means realistic max ~20–50).
 */
export const bulkRejectApplicants = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const { applicationIds } = request.body;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return reply.status(400).send({ success: false, message: 'applicationIds must be a non-empty array.' });
    }
    if (applicationIds.length > 100) {
      return reply.status(400).send({ success: false, message: 'Cannot process more than 100 applications per request.' });
    }

    const rawIds = applicationIds
      .map(id => parseInt(String(id).replace('applicant_', ''), 10))
      .filter(n => Number.isFinite(n) && n > 0);

    if (rawIds.length === 0) {
      return reply.status(400).send({ success: false, message: 'No valid application IDs provided.' });
    }

    // Single query — ownership check baked in via jobs.recruiter_id
    const applications = await Application.query()
      .join('jobs', 'applications.job_id', 'jobs.id')
      .whereIn('applications.id', rawIds)
      .where('jobs.recruiter_id', recruiterId)
      .withGraphFetched('applicant')
      .select('applications.*', 'jobs.title as job_title');

    const appById = new Map(applications.map(a => [a.id, a]));

    const rejected = [];
    const skipped  = [];

    for (const rawId of rawIds) {
      const app = appById.get(rawId);
      if (!app) {
        skipped.push({ id: `applicant_${rawId}`, reason: 'not_found_or_not_owned' });
        continue;
      }
      const allowedNext = VALID_TRANSITIONS[app.status] ?? [];
      if (!allowedNext.includes('rejected')) {
        skipped.push({ id: `applicant_${rawId}`, reason: `invalid_transition_from_${app.status}` });
        continue;
      }
      await applyTransition(app, 'rejected', recruiterId, { log: request.log });
      rejected.push(`applicant_${rawId}`);
    }

    return reply.status(200).send({
      success: true,
      message: `Bulk reject complete: ${rejected.length} rejected, ${skipped.length} skipped.`,
      data: { rejected, skipped },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

/**
 * POST /recruiter/applicants/bulk-reject-by-score
 * Body: { minScore: number, jobId?: string }
 * Rejects all active applicants for this recruiter with qa_match_score < minScore.
 */
export const bulkRejectByScore = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const { minScore, jobId } = request.body;

    if (typeof minScore !== 'number' || minScore < 1 || minScore > 99) {
      return reply.status(400).send({ success: false, message: 'minScore must be a number between 1 and 99.' });
    }

    const query = Application.query()
      .join('jobs', 'applications.job_id', 'jobs.id')
      .join('resume_insights as ri', 'ri.candidate_id', 'applications.user_id')
      .where('jobs.recruiter_id', recruiterId)
      .whereIn('applications.status', ['applied', 'shortlisted', 'interview'])
      .where('ri.qa_match_score', '<', minScore)
      .withGraphFetched('applicant')
      .select('applications.*', 'jobs.title as job_title')
      .limit(200);

    if (jobId) {
      query.where('applications.job_id', String(jobId).replace('job_', ''));
    }

    const applications = await query;
    const rejected = [];
    const skipped  = [];

    for (const app of applications) {
      const allowedNext = VALID_TRANSITIONS[app.status] ?? [];
      if (!allowedNext.includes('rejected')) {
        skipped.push({ id: `applicant_${app.id}`, reason: `invalid_transition_from_${app.status}` });
        continue;
      }
      await applyTransition(app, 'rejected', recruiterId, { log: request.log });
      rejected.push(`applicant_${app.id}`);
    }

    return reply.status(200).send({
      success: true,
      message: `Bulk reject by score complete: ${rejected.length} rejected, ${skipped.length} skipped.`,
      data: { rejected, skipped, minScore },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

/**
 * Phase 5: POST /recruiter/applicants/:applicantId/feedback-note
 */
export const submitFeedbackNote = async (request, reply) => {
  try {
    const recruiterId   = request.user.id;
    const applicationId = parseInt(request.params.applicantId.replace('applicant_', ''), 10);
    const note          = (request.body?.note ?? '').trim();

    if (!note) {
      return reply.status(400).send({ success: false, message: 'Note cannot be empty.' });
    }

    await saveFeedbackNote({ applicationId, recruiterId, note });

    return reply.send({ success: true, message: 'Feedback note saved.' });
  } catch (err) {
    request.log.error({ err }, 'submitFeedbackNote failed');
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
