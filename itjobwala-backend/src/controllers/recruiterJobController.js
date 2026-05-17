import Job from '../models/Job.js';
import Activity from '../models/Activity.js';
import Application from '../models/Application.js';
import Recruiter from '../models/Recruiter.js';

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
      // Need a subquery or join for application count sorting
      query.select([
        'jobs.*',
        Application.query()
          .whereColumn('job_id', 'jobs.id')
          .count()
          .as('applicationCount')
      ]).orderBy('applicationCount', sortOrder);
    }

    const pageIndex = Math.max(0, parseInt(page, 10) - 1);
    const pageSize = parseInt(limit, 10);

    const result = await query.page(pageIndex, pageSize);

    // Get application counts if not already selected
    const jobsWithCounts = await Promise.all(result.results.map(async (job) => {
      const appCount = job.applicationCount !== undefined ? 
        parseInt(job.applicationCount, 10) : 
        await Application.query().where('job_id', job.id).resultSize();
      
      return {
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
        applicationCount: appCount,
        postedDate: job.status === 'active' ? job.created_at : null,
        status: job.status,
        companyId: `company_${job.recruiter_id}`,
        createdAt: job.created_at,
        updatedAt: job.updated_at
      };
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

    const appCount = await Application.query().where('job_id', job.id).resultSize();

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
        postedDate: job.status === 'active' ? job.created_at : null,
        status: job.status,
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
      experienceLevel,
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

    // Map experienceLevel string to min/max
    let expMin = 0, expMax = 10;
    if (experienceLevel === 'Fresher') { expMin = 0; expMax = 1; }
    else if (experienceLevel === '1-2 years') { expMin = 1; expMax = 2; }
    else if (experienceLevel === '2-3 years') { expMin = 2; expMax = 3; }
    else if (experienceLevel === '3-5 years') { expMin = 3; expMax = 5; }
    else if (experienceLevel === '5+ years') { expMin = 5; expMax = 15; }

    const recruiter = await Recruiter.query().findById(recruiterId).select('company_name');
    const companyName = recruiter?.company_name ?? 'Unknown Company';

    const newJob = await Job.query().insert({
      title,
      company_name: companyName,
      description: description || '',
      about_role: description || '',
      location,
      job_type: jobType,
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
        experienceLevel,
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
    if (updateData.status != null && !['active', 'closed', 'draft'].includes(updateData.status)) {
      details.status = 'Invalid status value';
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
    if (updateData.title != null)       mappedUpdate.title = updateData.title.trim();
    if (updateData.description != null) { mappedUpdate.description = updateData.description.trim(); mappedUpdate.about_role = updateData.description.trim(); }
    if (updateData.location != null)    mappedUpdate.location = updateData.location.trim();
    if (updateData.jobType != null)     mappedUpdate.job_type = updateData.jobType;
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

    if (updateData.experienceLevel != null) {
      let expMin = 0, expMax = 10;
      if (updateData.experienceLevel === 'Fresher')   { expMin = 0; expMax = 1; }
      else if (updateData.experienceLevel === '1-2 years') { expMin = 1; expMax = 2; }
      else if (updateData.experienceLevel === '2-3 years') { expMin = 2; expMax = 3; }
      else if (updateData.experienceLevel === '3-5 years') { expMin = 3; expMax = 5; }
      else if (updateData.experienceLevel === '5+ years')  { expMin = 5; expMax = 15; }
      mappedUpdate.experience_min = expMin;
      mappedUpdate.experience_max = expMax;
    }

    const updatedJob = await job.$query().patchAndFetch(mappedUpdate);
    const appCount = await Application.query().where('job_id', updatedJob.id).resultSize();

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
        postedDate: updatedJob.status === 'active' ? updatedJob.created_at : null,
        status: updatedJob.status,
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
