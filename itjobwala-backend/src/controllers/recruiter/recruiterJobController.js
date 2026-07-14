import Job from '../../models/jobs/Job.js';
import Activity from '../../models/recruiter/Activity.js';
import Application from '../../models/jobs/Application.js';
import Recruiter from '../../models/recruiter/Recruiter.js';
import { incrementSkillUsage } from '../common/skillController.js';
import { checkJobContent } from '../../services/moderation/contentSafety.js';
import { notifyRecruiter } from '../../utils/notifyHelper.js';
import { sendJobModerationEmail } from '../../services/email/mailer.service.js';
import { sanitizeText } from '../../utils/sanitize.js';

export const getJobs = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const { page = 1, limit = 20, status, search, sortBy = 'date', sortOrder = 'desc' } = request.query;

    const query = Job.query().where('recruiter_id', recruiterId);

    if (status) {
      query.where('status', status);
    }

    if (search) {
      query.where('title', 'ILIKE', `%${search}%`);
    }

    if (sortBy === 'date') {
      query.orderBy('created_at', sortOrder);
    } else if (sortBy === 'title') {
      query.orderBy('title', sortOrder);
    } else if (sortBy === 'applications') {
      query.select('jobs.*')
        .select(Application.query().whereColumn('job_id', 'jobs.id').count().as('app_sort_count'))
        .orderBy('app_sort_count', sortOrder);
    }

    const pageIndex = Math.max(0, parseInt(page, 10) - 1);
    const pageSize = parseInt(limit, 10);

    const result = await query.page(pageIndex, pageSize);

    // Grouped aggregates for app counts + view counts — avoids N+1
    const countMap = new Map();
    const viewsMap = new Map();
    if (result.results.length > 0) {
      const jobIds = result.results.map(j => j.id);
      const [appRows, viewRows] = await Promise.all([
        Application.query()
          .whereIn('job_id', jobIds)
          .groupBy('job_id')
          .select('job_id')
          .count('* as app_count'),
        Job.knex()('job_views')
          .whereIn('job_id', jobIds)
          .groupBy('job_id')
          .select('job_id')
          .count('* as view_count'),
      ]);
      for (const row of appRows)  countMap.set(row.job_id, parseInt(row.app_count,  10));
      for (const row of viewRows) viewsMap.set(row.job_id, parseInt(row.view_count, 10));
    }

    const jobsWithCounts = result.results.map(job => ({
      id: `job_${job.id}`,
      title: job.title,
      description: job.about_role || job.description,
      location: job.location,
      jobType: job.job_type,
      workMode: job.work_mode,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      requiredSkills: Array.isArray(job.skills) ? job.skills : [],
      experienceLevel: `${job.experience_min || 0}-${job.experience_max || '5+'} years`,
      applicationCount: countMap.get(job.id) ?? 0,
      views:            viewsMap.get(job.id) ?? 0,
      postedDate:       job.status === 'active' ? job.created_at : null,
      status:           job.status,
      moderationReason: job.moderation_reason || null,
      autoFlags:        Array.isArray(job.auto_flags) ? job.auto_flags : [],
      submittedAt:      job.submitted_at || null,
      companyId: `company_${job.recruiter_id}`,
      createdAt: job.created_at,
      updatedAt: job.updated_at
    }));

    return reply.status(200).send({
      success: true,
      message: 'Jobs retrieved successfully',
      data: {
        jobs: jobsWithCounts,
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

export const getJobById = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const jobId = request.params.jobId.replace('job_', '');

    const job = await Job.query().findOne({ id: jobId, recruiter_id: recruiterId });
    if (!job) {
      return reply.status(404).send({ success: false, message: 'Job not found', error: 'NOT_FOUND' });
    }

    const [appCount, viewRow] = await Promise.all([
      Application.query().where('job_id', job.id).resultSize(),
      Job.knex()('job_views').where('job_id', job.id).count('* as total').first(),
    ]);
    const views = parseInt(viewRow?.total ?? '0', 10);

    function parseJsonArray(val) {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val); } catch { return []; }
    }

    return reply.status(200).send({
      success: true,
      message: 'Job retrieved successfully',
      data: {
        id: `job_${job.id}`,
        title: job.title,
        description: job.about_role || job.description,
        location: job.location,
        jobType: job.job_type,
        workMode: job.work_mode,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        requiredSkills: parseJsonArray(job.skills),
        experienceLevel: `${job.experience_min || 0}-${job.experience_max || '5+'} years`,
        responsibilities: parseJsonArray(job.responsibilities),
        requirements: parseJsonArray(job.requirements),
        niceToHave: parseJsonArray(job.nice_to_have),
        benefits: parseJsonArray(job.benefits),
        vacancies: job.vacancies || 1,
        closesAt: job.closes_at || null,
        jobLevel: job.job_level || null,
        applicationCount: appCount,
        views,
        postedDate: job.status === 'active' ? job.created_at : null,
        status:           job.status,
        moderationReason: job.moderation_reason || null,
        autoFlags:        Array.isArray(job.auto_flags) ? job.auto_flags : [],
        submittedAt:      job.submitted_at || null,
        companyId: `company_${job.recruiter_id}`,
        createdAt: job.created_at,
        updatedAt: job.updated_at
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const postJob = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const {
      title,
      description,
      location,
      jobType,
      workMode,
      salaryMin,
      salaryMax,
      requiredSkills,
      experienceMin,
      experienceMax,
      responsibilities,
      requirements,
      niceToHave,
      benefits,
      vacancies,
      closesAt,
      jobLevel,
    } = request.body;

    // Validation
    const details = {};
    if (!title || title.length < 5 || title.length > 150) {
      details.title = 'Title must be between 5 and 150 characters';
    }
    if (!description || description.length < 50 || description.length > 10000) {
      details.description = `Description must be between 50 and 10000 characters (currently ${description?.length || 0} characters)`;
    }
    if (salaryMin !== undefined && salaryMax !== undefined && salaryMin > salaryMax) {
      details.salary = `Salary minimum (${salaryMin}) cannot be greater than salary maximum (${salaryMax})`;
    }

    if (Object.keys(details).length > 0) {
      return reply.status(400).send({
        success: false,
        message: 'Validation failed',
        error: 'VALIDATION_ERROR',
        details
      });
    }

    const expMin = typeof experienceMin === 'number' ? Math.max(0, Math.min(20, experienceMin)) : 0;
    const expMax = typeof experienceMax === 'number' ? Math.max(expMin + 1, Math.min(20, experienceMax)) : 30;

    const recruiter = await Recruiter.query().findById(recruiterId).select('company_name');
    const companyName = recruiter?.company_name ?? 'Unknown Company';

    // Generate a random 12-char hex public_id via DB function
    const { rows: [{ pid }] } = await Job.knex().raw(`SELECT left(encode(gen_random_bytes(6),'hex'),12) AS pid`);

    const newJob = await Job.query().insert({
      public_id: pid,
      title: sanitizeText(title),
      company_name: companyName,
      description: sanitizeText(description || ''),
      about_role: sanitizeText(description || ''),
      location: sanitizeText(location),
      job_type: jobType?.toLowerCase(),
      work_mode: workMode,
      salary_min: salaryMin,
      salary_max: salaryMax,
      skills: requiredSkills || [],
      experience_min: expMin,
      experience_max: expMax,
      responsibilities: responsibilities || [],
      requirements: requirements || [],
      nice_to_have: niceToHave || [],
      benefits: benefits || [],
      vacancies: vacancies || 1,
      closes_at: closesAt || null,
      job_level: jobLevel || null,
      recruiter_id: recruiterId,
      status: 'draft',
    }).returning('*');

    await Activity.query().insert({
      recruiter_id: recruiterId,
      type: 'job_created',
      message: `You created a new job draft: ${newJob.title}`,
      entity_id: `job_${newJob.id}`,
      entity_type: 'job'
    });

    // Bump usage_count for each skill so autocomplete surfaces popular skills first
    if (requiredSkills && requiredSkills.length > 0) {
      await incrementSkillUsage(requiredSkills);
    }

    return reply.status(201).send({
      success: true,
      message: 'Job created successfully',
      data: {
        id: `job_${newJob.id}`,
        title: newJob.title,
        description: newJob.about_role,
        location: newJob.location,
        jobType: newJob.job_type,
        workMode: newJob.work_mode,
        salaryMin: newJob.salary_min,
        salaryMax: newJob.salary_max,
        requiredSkills: requiredSkills || [],
        experienceLevel: `${expMin}-${expMax} years`,
        applicationCount: 0,
        postedDate: null,
        status: 'draft',
        companyId: `company_${recruiterId}`,
        createdAt: newJob.created_at,
        updatedAt: newJob.updated_at
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const updateJob = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const jobId = request.params.jobId.replace('job_', '');
    const updateData = request.body;

    const job = await Job.query().findOne({ id: jobId, recruiter_id: recruiterId });
    if (!job) {
      return reply.status(404).send({ success: false, message: 'Job not found', error: 'NOT_FOUND' });
    }

    // Field-level validation
    const details = {};
    if (updateData.title != null) {
      if (updateData.title.trim().length < 5 || updateData.title.trim().length > 150) {
        details.title = 'Title must be between 5 and 150 characters';
      }
    }
    if (updateData.description != null) {
      if (updateData.description.trim().length < 50 || updateData.description.trim().length > 10000) {
        details.description = `Description must be between 50 and 10000 characters (currently ${updateData.description.trim().length})`;
      }
    }
    if (updateData.location != null && updateData.location.trim().length === 0) {
      details.location = 'Location cannot be empty';
    }
    if (updateData.salaryMin != null && updateData.salaryMax != null) {
      if (Number(updateData.salaryMin) > Number(updateData.salaryMax)) {
        details.salaryMin = 'Minimum salary cannot exceed maximum salary';
      }
    }
    if (updateData.vacancies != null && (isNaN(updateData.vacancies) || updateData.vacancies < 1)) {
      details.vacancies = 'Vacancies must be at least 1';
    }
    if (updateData.closesAt != null && updateData.closesAt !== '') {
      const closes = new Date(updateData.closesAt);
      if (isNaN(closes.getTime()) || closes <= new Date()) {
        details.closesAt = 'Application deadline must be a future date';
      }
    }
    // Recruiters may not directly set status to 'active' — use /submit endpoint instead.
    // 'pending' and 'needs_changes' are system-only statuses.
    if (updateData.status != null && !['closed', 'draft'].includes(updateData.status)) {
      details.status = "Use the 'Submit for review' action to publish a job. Allowed direct values: closed, draft.";
    }

    if (Object.keys(details).length > 0) {
      return reply.status(400).send({
        success: false,
        message: 'Validation failed',
        error: 'VALIDATION_ERROR',
        details,
      });
    }

    // Block core content changes on active jobs that already have applications
    const coreChanging = updateData.title != null || updateData.description != null ||
      updateData.location != null || updateData.jobType != null || updateData.workMode != null;
    if (coreChanging && job.status === 'active') {
      const appCount = await Application.query().where('job_id', job.id).resultSize();
      if (appCount > 0) {
        return reply.status(409).send({
          success: false,
          message: 'Cannot edit core job details while the job is active and has applications. Close the job first.',
          error: 'CONFLICT',
          details: { applicationCount: appCount },
        });
      }
    }

    const mappedUpdate = {};
    if (updateData.title != null)       mappedUpdate.title = sanitizeText(updateData.title.trim());
    if (updateData.description != null) { mappedUpdate.description = sanitizeText(updateData.description.trim()); mappedUpdate.about_role = sanitizeText(updateData.description.trim()); }
    if (updateData.location != null)    mappedUpdate.location = sanitizeText(updateData.location.trim());
    if (updateData.jobType != null)     mappedUpdate.job_type = updateData.jobType?.toLowerCase();
    if (updateData.workMode != null)    mappedUpdate.work_mode = updateData.workMode;
    if (updateData.salaryMin != null)   mappedUpdate.salary_min = Number(updateData.salaryMin) || null;
    if (updateData.salaryMax != null)   mappedUpdate.salary_max = Number(updateData.salaryMax) || null;
    if (updateData.requiredSkills != null) mappedUpdate.skills = updateData.requiredSkills;
    if (updateData.status != null)      mappedUpdate.status = updateData.status;
    if (updateData.responsibilities != null) mappedUpdate.responsibilities = updateData.responsibilities;
    if (updateData.requirements != null)    mappedUpdate.requirements = updateData.requirements;
    if (updateData.niceToHave != null)      mappedUpdate.nice_to_have = updateData.niceToHave;
    if (updateData.benefits != null)        mappedUpdate.benefits = updateData.benefits;
    if (updateData.vacancies != null)       mappedUpdate.vacancies = Number(updateData.vacancies);
    if (updateData.closesAt !== undefined)  mappedUpdate.closes_at = updateData.closesAt || null;
    if (updateData.jobLevel !== undefined)  mappedUpdate.job_level = updateData.jobLevel || null;

    if (updateData.experienceMin != null || updateData.experienceMax != null) {
      const eMin = updateData.experienceMin != null ? Math.max(0, Math.min(20, Number(updateData.experienceMin))) : (job.experience_min ?? 0);
      const eMax = updateData.experienceMax != null ? Math.max(eMin + 1, Math.min(20, Number(updateData.experienceMax))) : (job.experience_max ?? 30);
      mappedUpdate.experience_min = eMin;
      mappedUpdate.experience_max = eMax;
    }

    const updatedJob = await job.$query().patchAndFetch(mappedUpdate);
    const appCount = await Application.query().where('job_id', updatedJob.id).resultSize();

    if (updateData.requiredSkills && updateData.requiredSkills.length > 0) {
      await incrementSkillUsage(updateData.requiredSkills);
    }

    function parseJsonArray(val) {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val); } catch { return []; }
    }

    return reply.status(200).send({
      success: true,
      message: 'Job updated successfully',
      data: {
        id: `job_${updatedJob.id}`,
        title: updatedJob.title,
        description: updatedJob.about_role || updatedJob.description,
        location: updatedJob.location,
        jobType: updatedJob.job_type,
        workMode: updatedJob.work_mode,
        salaryMin: updatedJob.salary_min,
        salaryMax: updatedJob.salary_max,
        requiredSkills: parseJsonArray(updatedJob.skills),
        experienceLevel: `${updatedJob.experience_min || 0}-${updatedJob.experience_max || '5+'} years`,
        responsibilities: parseJsonArray(updatedJob.responsibilities),
        requirements: parseJsonArray(updatedJob.requirements),
        niceToHave: parseJsonArray(updatedJob.nice_to_have),
        benefits: parseJsonArray(updatedJob.benefits),
        vacancies: updatedJob.vacancies || 1,
        closesAt: updatedJob.closes_at || null,
        jobLevel: updatedJob.job_level || null,
        applicationCount: appCount,
        postedDate:       updatedJob.status === 'active' ? updatedJob.created_at : null,
        status:           updatedJob.status,
        moderationReason: updatedJob.moderation_reason || null,
        autoFlags:        Array.isArray(updatedJob.auto_flags) ? updatedJob.auto_flags : [],
        submittedAt:      updatedJob.submitted_at || null,
        companyId: `company_${recruiterId}`,
        createdAt: updatedJob.created_at,
        updatedAt: updatedJob.updated_at,
      },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const deleteJob = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const jobId = request.params.jobId.replace('job_', '');

    const job = await Job.query().findOne({ id: jobId, recruiter_id: recruiterId });
    if (!job) {
      return reply.status(404).send({ success: false, message: 'Job not found', error: 'NOT_FOUND' });
    }

    if (job.status !== 'draft') {
      return reply.status(403).send({
        success: false,
        message: `Can only delete draft jobs. Current status: ${job.status}`,
        error: 'FORBIDDEN'
      });
    }

    const appCount = await Application.query().where('job_id', jobId).resultSize();
    if (appCount > 0) {
      return reply.status(403).send({
        success: false,
        message: 'Cannot delete job with existing applications',
        error: 'FORBIDDEN'
      });
    }

    await Job.query().deleteById(jobId);

    return reply.status(200).send({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getRecruiterStats = async (request, reply) => {
  try {
    const recruiterId = request.user.id;

    const [activeJobs, applicantRows] = await Promise.all([
      Job.query().where('recruiter_id', recruiterId).where('status', 'active').resultSize(),
      Application.query()
        .join('jobs', 'applications.job_id', 'jobs.id')
        .where('jobs.recruiter_id', recruiterId)
        .groupBy('applications.status')
        .select('applications.status')
        .count('applications.id as count'),
    ]);

    const byStatus = Object.fromEntries(
      applicantRows.map(r => [r.status, parseInt(r.count, 10)])
    );

    const total = Object.values(byStatus).reduce((s, n) => s + n, 0);

    return reply.status(200).send({
      success: true,
      data: {
        activeJobs,
        totalApplicants: total,
        interviewsScheduled: byStatus['interview'] ?? 0,
        hired: byStatus['hired'] ?? 0,
        byStatus,
      },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// ── POST /recruiter/jobs/:jobId/submit ────────────────────────────────────────
// The publication gate. Runs content-safety checks, then routes based on
// recruiter verification status. All transition decisions happen here.
export const submitJob = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const rawId = request.params.jobId.replace('job_', '');

    const job = await Job.query().findOne({ id: rawId, recruiter_id: recruiterId });
    if (!job) {
      return reply.status(404).send({ success: false, message: 'Job not found', error: 'NOT_FOUND' });
    }

    // Only draft or needs_changes jobs may be (re)submitted
    if (!['draft', 'needs_changes'].includes(job.status)) {
      return reply.status(409).send({
        success: false,
        message: `Cannot submit a job with status '${job.status}'. Only draft or needs_changes jobs can be submitted.`,
        error: 'INVALID_STATUS',
      });
    }

    const { passed, flags } = checkJobContent(job);

    const recruiter = await Recruiter.query().findById(recruiterId).select('is_verified', 'email', 'full_name', 'company_name');
    const isVerified = recruiter?.is_verified === true;

    let newStatus;
    let moderationReason = null;

    if (!passed) {
      // Any block flag → needs_changes regardless of verification
      const blockFlags = flags.filter(f => f.severity === 'block');
      moderationReason = blockFlags.map(f => f.message).join(' | ');
      newStatus = 'needs_changes';
    } else if (isVerified) {
      // Verified + clean → auto-approve
      newStatus = 'active';
    } else {
      // Unverified → queue for admin review
      newStatus = 'pending';
    }

    await Job.query().patchAndFetchById(rawId, {
      status:            newStatus,
      auto_flags:        flags,
      submitted_at:      new Date().toISOString(),
      moderation_reason: moderationReason,
      // Clear previous review metadata on re-submit
      reviewed_by:  null,
      reviewed_at:  null,
    });

    // Notify recruiter of the outcome
    if (newStatus === 'active') {
      notifyRecruiter(recruiterId, {
        type:      'job_published',
        title:     'Job is now live',
        message:   `Your job "${job.title}" has been published and is now visible to candidates.`,
        actionUrl: `/recruiter/posted-jobs/job_${rawId}`,
      });
    } else if (newStatus === 'needs_changes') {
      notifyRecruiter(recruiterId, {
        type:      'job_needs_changes',
        title:     'Job needs changes before publishing',
        message:   `Your job "${job.title}" could not be published. Please review the flagged issues and resubmit.`,
        actionUrl: `/recruiter/posted-jobs/job_${rawId}`,
      });

      // Email notification (soft-fail)
      if (recruiter?.email) {
        sendJobModerationEmail({
          to:          recruiter.email,
          name:        recruiter.full_name || null,
          jobTitle:    job.title,
          decision:    'needs_changes',
          reason:      moderationReason,
          jobUrl:      `/recruiter/posted-jobs/job_${rawId}`,
        }).catch(() => {});
      }
    }

    return reply.status(200).send({
      success: true,
      message: newStatus === 'active'
        ? 'Job published successfully.'
        : newStatus === 'pending'
          ? 'Job submitted for admin review. It will be visible once approved.'
          : 'Job submission blocked. Please fix the flagged issues and resubmit.',
      data: {
        status: newStatus,
        flags,
        moderationReason,
      },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getJobAnalytics = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const jobId = parseInt(request.params.jobId.replace('job_', ''), 10);

    const job = await Job.query().findOne({ id: jobId, recruiter_id: recruiterId }).select('id');
    if (!job) {
      return reply.status(404).send({ success: false, message: 'Job not found' });
    }

    const sevenDaysAgoDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const sevenDaysAgoISO  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [totalViewsRow, weekViewsRow, appsByStatus, weekAppsCount] = await Promise.all([
      Job.knex()('job_views').where('job_id', jobId).count('* as total').first(),
      Job.knex()('job_views')
        .where('job_id', jobId)
        .where('viewed_date', '>=', sevenDaysAgoDate)
        .count('* as total').first(),
      Application.query()
        .where('job_id', jobId)
        .groupBy('status')
        .select('status')
        .count('* as count'),
      Application.query()
        .where('job_id', jobId)
        .where('applied_at', '>=', sevenDaysAgoISO)
        .resultSize(),
    ]);

    const views         = parseInt(totalViewsRow?.total ?? '0', 10);
    const views_last_7d = parseInt(weekViewsRow?.total  ?? '0', 10);
    const applications_by_status = Object.fromEntries(
      appsByStatus.map(r => [r.status, parseInt(r.count, 10)])
    );
    const applications    = Object.values(applications_by_status).reduce((s, n) => s + n, 0);
    const conversion_rate = views > 0 ? Math.round((applications / views) * 1000) / 10 : 0;

    return reply.status(200).send({
      success: true,
      message: 'Job analytics fetched.',
      data: {
        views,
        applications,
        conversion_rate,
        applications_by_status,
        views_last_7d,
        applications_last_7d: weekAppsCount,
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
