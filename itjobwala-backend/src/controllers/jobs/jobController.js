import Job from '../../models/jobs/Job.js';
import Recruiter from '../../models/recruiter/Recruiter.js';
import Application from '../../models/jobs/Application.js';
import SavedJob from '../../models/jobs/SavedJob.js';
import ResumeInsight from '../../models/candidate/ResumeInsight.js';
import { ref, raw } from 'objection';

// Resolve candidate user ID from request JWT without throwing (optional auth).
// Tokens are signed as { sub: String(id), role, type } — sub must be mapped to id.
const getCandidateId = async (request) => {
  try {
    await request.jwtVerify();
    if (request.user?.role === 'recruiter') return null;
    // New-format tokens use sub; old-format tokens used id directly
    return request.user?.id ?? (request.user?.sub ? Number(request.user.sub) : null);
  } catch {
    return null;
  }
};

// Helper to map DB result to contract shape
const formatJob = (job, hasApplied = false, isSaved = false) => {
  return {
    id: `job_${job.id}`,
    title: job.title,
    company: job.company_name || job.recruiter?.company_name || 'Unknown',
    company_logo: job.recruiter?.logo || null,
    location: job.location,
    work_mode: job.work_mode,
    job_type: job.job_type,
    experience_min: job.experience_min,
    experience_max: job.experience_max,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    // LPA Conversion
    salary_lpa_min: job.salary_min ? (job.salary_min / 100000).toFixed(1) : null,
    salary_lpa_max: job.salary_max ? (job.salary_max / 100000).toFixed(1) : null,
    salary_currency: job.salary_currency || 'INR',
    salary_period: job.salary_period || 'annual',
    description: job.about_role || job.description || '',
    skills: job.skills || [],
    company_type: job.recruiter?.company_type || null,
    is_new: job.is_new || false,
    is_hot: job.is_hot || false,
    is_actively_hiring: job.is_actively_hiring || true,
    posted_at: job.posted_at || job.created_at,
    closes_at: job.closes_at || null,
    vacancies: job.vacancies || 1,
    job_level: job.job_level || 'Senior',
    office_details: job.office_details || (job.work_mode === 'onsite' ? 'Full-time Office' : 'Flexible Hybrid'),
    about_company: job.recruiter?.about || null,
    responsibilities: job.responsibilities || [],
    requirements: job.requirements || [],
    nice_to_have: job.nice_to_have || [],
    benefits: job.benefits || [],
    company_size: job.recruiter?.size || null,
    company_founded: job.recruiter?.founded || null,
    company_industry: job.recruiter?.industry || null,
    company_website: job.recruiter?.website || null,
    recruiter_name: job.recruiter?.recruiter_name || null,
    recruiter_title: job.recruiter?.recruiter_title || null,
    recruiter_response_days: job.recruiter?.recruiter_response_days || null,
    applicants: parseInt(job.applicant_count || 0, 10),
    // Performance Metrics
    metrics: {
      views: job.views || 0,
      applicants: parseInt(job.applicant_count || 0, 10),
      shortlisted: parseInt(job.shortlisted_count || 0, 10),
      interviews: parseInt(job.interview_count || 0, 10)
    },
    company_verified: job.recruiter?.is_verified === true,
    status:      job.status,
    is_saved: isSaved,
    has_applied: hasApplied,
  };
};

export const getJobs = async (request, reply) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      q, 
      location, 
      job_type, 
      work_mode, 
      experience, 
      company_type, 
      company_industry,
      company,
      category,
      salary_min, 
      salary_max, 
      skills, 
      sort = 'newest' 
    } = request.query;

    const query = Job.query()
      .withGraphFetched('recruiter')
      .select('jobs.*')
      .select(
        Job.relatedQuery('applications')
          .count()
          .as('applicant_count')
      )
      .select(
        Job.relatedQuery('applications')
          .where('status', 'shortlisted')
          .count()
          .as('shortlisted_count')
      )
      .select(
        Job.relatedQuery('applications')
          .where('status', 'interview')
          .count()
          .as('interview_count')
      )
      .where('status', 'active');

    if (q) query.where('title', 'ILIKE', `%${q}%`);
    if (location) query.where('location', 'ILIKE', `%${location}%`);
    if (job_type) query.whereIn('job_type', job_type.split(','));
    if (work_mode) query.whereIn('work_mode', work_mode.split(','));
    
    // Match against jobs.company_name OR the linked recruiter's company_name (handles
    // seeded/migrated rows where jobs.company_name was never populated)
    if (company) {
      query.where(builder => {
        builder
          .where('jobs.company_name', 'ILIKE', `%${company}%`)
          .orWhereRaw(
            `EXISTS (SELECT 1 FROM recruiters r WHERE r.id = jobs.recruiter_id AND r.company_name ILIKE ?)`,
            [`%${company}%`]
          );
      });
    }

    // company_type / company_industry live on the recruiters table — use a plain join
    // (joinRelated conflicts with withGraphFetched and produces 0 results)
    if (company_type || company_industry) {
      query.join('recruiters', 'jobs.recruiter_id', 'recruiters.id');
      if (company_type) query.where('recruiters.company_type', 'ILIKE', company_type);
      if (company_industry) query.where('recruiters.industry', 'ILIKE', company_industry);
    }

    if (category) query.where('category', 'ILIKE', category);
    if (salary_min) query.where('salary_min', '>=', parseInt(salary_min, 10));
    if (salary_max) query.where('salary_max', '<=', parseInt(salary_max, 10));

    if (experience) {
      const expValue = parseInt(experience, 10);
      query.where('experience_min', '<=', expValue).andWhere('experience_max', '>=', expValue);
    }

    if (skills) {
      const skillList = skills.split(',').map(s => s.trim());
      query.where(builder => {
        skillList.forEach(skill => {
          builder.orWhereRaw('CAST(skills AS TEXT) ILIKE ?', [`%${skill}%`]);
        });
      });
    }

    if (sort === 'newest') query.orderBy('created_at', 'desc');
    else if (sort === 'salary_high') query.orderBy('salary_max', 'desc');
    else if (sort === 'salary_low') query.orderBy('salary_min', 'asc');

    const pageIndex = Math.max(0, parseInt(page, 10) - 1);
    const pageSize = parseInt(limit, 10);

    const candidateId = await getCandidateId(request);
    const result = await query.page(pageIndex, pageSize);

    let appliedJobIds = new Set();
    let savedJobIds   = new Set();
    if (candidateId && result.results.length > 0) {
      const jobIds = result.results.map(j => j.id);
      const [applications, savedJobs] = await Promise.all([
        Application.query().whereIn('job_id', jobIds).where('user_id', candidateId).select('job_id'),
        SavedJob.query().whereIn('job_id', jobIds).where('user_id', candidateId).select('job_id'),
      ]);
      appliedJobIds = new Set(applications.map(a => a.job_id));
      savedJobIds   = new Set(savedJobs.map(s => s.job_id));
    }

    return reply.status(200).send({
      success: true,
      message: 'Jobs fetched successfully.',
      data: {
        jobs: result.results.map(j => formatJob(j, appliedJobIds.has(j.id), savedJobIds.has(j.id))),
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

export const getJobDetails = async (request, reply) => {
  try {
    const jobId = request.params.job_id.replace('job_', '');
    const candidateId = await getCandidateId(request);

    const [job, existingApplication, savedJob] = await Promise.all([
      Job.query()
        .findById(jobId)
        .withGraphFetched('recruiter')
        .select('jobs.*')
        .select(
          Job.relatedQuery('applications')
            .count()
            .as('applicant_count')
        )
        .select(
          Job.relatedQuery('applications')
            .where('status', 'shortlisted')
            .count()
            .as('shortlisted_count')
        )
        .select(
          Job.relatedQuery('applications')
            .where('status', 'interview')
            .count()
            .as('interview_count')
        ),
      candidateId
        ? Application.query()
            .findOne({ job_id: jobId, user_id: candidateId })
            .select('id')
        : Promise.resolve(null),
      candidateId
        ? SavedJob.query()
            .findOne({ job_id: jobId, user_id: candidateId })
            .select('id')
        : Promise.resolve(null),
    ]);

    if (!job || job.status !== 'active') {
      return reply.status(404).send({ success: false, message: 'Job not found or has been removed.' });
    }

    return reply.status(200).send({
      success: true,
      message: 'Job details fetched successfully.',
      data: formatJob(job, !!existingApplication, !!savedJob),
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getRecommendedJobs = async (request, reply) => {
  try {
    const limit      = parseInt(request.query.limit, 10) || 5;
    const excludeRaw = request.query.exclude;
    const excludeId  = excludeRaw ? excludeRaw.toString().replace('job_', '') : null;

    const candidateId = await getCandidateId(request);

    let candidateSkills  = [];
    if (candidateId) {
      const insight = await ResumeInsight.query()
        .findOne({ candidate_id: candidateId })
        .select('extracted_skills', 'qa_specialization');
      if (insight) {
        candidateSkills = insight.extracted_skills ?? [];
      }
    }

    let jobs;

    if (candidateSkills.length >= 3) {
      const lowerSkills = candidateSkills.map(s => s.toLowerCase());

      jobs = await Job.query()
        .withGraphFetched('recruiter')
        .select('jobs.*')
        .select(Job.relatedQuery('applications').count().as('applicant_count'))
        .select(Job.relatedQuery('applications').where('status', 'shortlisted').count().as('shortlisted_count'))
        .select(Job.relatedQuery('applications').where('status', 'interview').count().as('interview_count'))
        .where('status', 'active')
        .whereRaw(
          `(
            SELECT COUNT(*)
            FROM jsonb_array_elements_text(jobs.skills::jsonb) AS job_skill
            WHERE LOWER(job_skill) = ANY(?)
          ) >= 2`,
          [lowerSkills]
        )
        .orderByRaw(
          `(
            SELECT COUNT(*)
            FROM jsonb_array_elements_text(jobs.skills::jsonb) AS job_skill
            WHERE LOWER(job_skill) = ANY(?)
          ) DESC, jobs.created_at DESC`,
          [lowerSkills]
        )
        .limit(limit);

      if (jobs.length < limit) {
        const existingIds = jobs.map(j => j.id);
        const backfill = await Job.query()
          .withGraphFetched('recruiter')
          .select('jobs.*')
          .select(Job.relatedQuery('applications').count().as('applicant_count'))
          .select(Job.relatedQuery('applications').where('status', 'shortlisted').count().as('shortlisted_count'))
          .select(Job.relatedQuery('applications').where('status', 'interview').count().as('interview_count'))
          .where('status', 'active')
          .whereNotIn('id', existingIds.length ? existingIds : [0])
          .orderBy('created_at', 'desc')
          .limit(limit - jobs.length);
        jobs = [...jobs, ...backfill];
      }
    } else {
      jobs = await Job.query()
        .withGraphFetched('recruiter')
        .select('jobs.*')
        .select(Job.relatedQuery('applications').count().as('applicant_count'))
        .select(Job.relatedQuery('applications').where('status', 'shortlisted').count().as('shortlisted_count'))
        .select(Job.relatedQuery('applications').where('status', 'interview').count().as('interview_count'))
        .where('status', 'active')
        .orderBy('created_at', 'desc')
        .limit(limit);
    }

    if (excludeId) {
      jobs = jobs.filter(j => String(j.id) !== String(excludeId));
    }

    let savedJobIds = new Set();
    if (candidateId && jobs.length > 0) {
      const rows = await SavedJob.query()
        .whereIn('job_id', jobs.map(j => j.id))
        .where('user_id', candidateId)
        .select('job_id');
      savedJobIds = new Set(rows.map(r => r.job_id));
    }

    return reply.status(200).send({
      success: true,
      message: 'Recommended jobs fetched.',
      data: {
        skill_matched: candidateSkills.length >= 3,
        jobs: jobs.map(j => formatJob(j, false, savedJobIds.has(j.id))),
      },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getSimilarJobs = async (request, reply) => {
  try {
    const jobId = request.params.job_id.replace('job_', '');
    const limit = parseInt(request.query.limit, 10) || 5;

    const candidateId = await getCandidateId(request);
    const jobs = await Job.query()
      .withGraphFetched('recruiter')
      .select('jobs.*')
      .select(Job.relatedQuery('applications').count().as('applicant_count'))
      .select(Job.relatedQuery('applications').where('status', 'shortlisted').count().as('shortlisted_count'))
      .select(Job.relatedQuery('applications').where('status', 'interview').count().as('interview_count'))
      .whereNot('id', jobId)
      .where('status', 'active')
      .orderBy('created_at', 'desc')
      .limit(limit);

    let savedJobIds = new Set();
    if (candidateId && jobs.length > 0) {
      const rows = await SavedJob.query().whereIn('job_id', jobs.map(j => j.id)).where('user_id', candidateId).select('job_id');
      savedJobIds = new Set(rows.map(r => r.job_id));
    }

    return reply.status(200).send({
      success: true,
      message: 'Similar jobs fetched.',
      data: {
        jobs: jobs.map(j => formatJob(j, false, savedJobIds.has(j.id)))
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getFeaturedJobs = async (request, reply) => {
  try {
    const candidateId = await getCandidateId(request);
    const jobs = await Job.query()
      .withGraphFetched('recruiter')
      .select('jobs.*')
      .select(Job.relatedQuery('applications').count().as('applicant_count'))
      .select(Job.relatedQuery('applications').where('status', 'shortlisted').count().as('shortlisted_count'))
      .select(Job.relatedQuery('applications').where('status', 'interview').count().as('interview_count'))
      .where('status', 'active')
      .orderBy('is_hot', 'desc')
      .orderBy('created_at', 'desc')
      .limit(6);

    let savedJobIds = new Set();
    if (candidateId && jobs.length > 0) {
      const rows = await SavedJob.query().whereIn('job_id', jobs.map(j => j.id)).where('user_id', candidateId).select('job_id');
      savedJobIds = new Set(rows.map(r => r.job_id));
    }

    return reply.status(200).send({
      success: true,
      message: 'Featured jobs fetched.',
      data: {
        jobs: jobs.map(j => formatJob(j, false, savedJobIds.has(j.id)))
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// Existing module 6 / 3 controllers (kept for compatibility)
export const createJob = async (request, reply) => {
  try {
    const jobData = request.body;
    jobData.recruiter_id = request.user.id;
    const newJob = await Job.query().insert(jobData).returning('*');

    return reply.status(201).send({
      success: true,
      message: 'Job created successfully',
      data: { job_id: `job_${newJob.id}` }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getJobCategories = async (request, reply) => {
  try {
    const config = [
      { type: 'work_mode', table: 'jobs', column: 'work_mode', filter_key: 'work_mode' },
      { type: 'company_type', table: 'recruiters', column: 'company_type', filter_key: 'company_type' },
      { type: 'company_industry', table: 'recruiters', column: 'industry', filter_key: 'company_industry' },
      { type: 'job_category', table: 'jobs', column: 'category', filter_key: 'category' }
    ];

    const allCategories = [];

    for (const item of config) {
      let query;
      if (item.table === 'jobs') {
        query = Job.query()
          .select(item.column)
          .count(`${item.column} as count`)
          .whereNotNull(item.column)
          .where('status', 'active')
          .groupBy(item.column);
      } else {
        query = Job.query()
          .joinRelated('recruiter')
          .select(`recruiter.${item.column}`)
          .count(`recruiter.${item.column} as count`)
          .whereNotNull(`recruiter.${item.column}`)
          .where('jobs.status', 'active')
          .groupBy(`recruiter.${item.column}`);
      }

      const results = await query;

      results.forEach(row => {
        const val = row[item.column];
        if (val) {
          allCategories.push({
            key: val.toLowerCase().replace(/\s+/g, '_'),
            label: val,
            filter_key: item.filter_key,
            category_type: item.type,
            count: parseInt(row.count, 10)
          });
        }
      });
    }

    // Merge entries where the same value appears with different casing (e.g. "Remote" vs "remote")
    const categoryMap = new Map();
    for (const cat of allCategories) {
      const uniqueKey = `${cat.category_type}|${cat.key}`;
      if (categoryMap.has(uniqueKey)) {
        categoryMap.get(uniqueKey).count += cat.count;
      } else {
        categoryMap.set(uniqueKey, { ...cat });
      }
    }
    const deduped = Array.from(categoryMap.values());
    deduped.sort((a, b) => b.count - a.count);

    return reply.status(200).send({
      success: true,
      message: 'Categories fetched.',
      data: {
        categories: deduped
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getSimilarCompanies = async (request, reply) => {
  try {
    const jobId = request.params.job_id.replace('job_', '');
    const limit = Math.min(parseInt(request.query.limit, 10) || 5, 20);

    // 1. Find current job and company info
    const currentJob = await Job.query().findById(jobId).withGraphFetched('recruiter');
    if (!currentJob) {
      return reply.status(404).send({ success: false, error: 'Job not found' });
    }

    const industry = currentJob.recruiter?.industry;
    const currentRecruiterId = currentJob.recruiter_id;

    // 2. Find other companies in the same industry with open roles
    const companiesQuery = Recruiter.query()
      .select(
        'recruiters.id', 
        'recruiters.company_name as name', 
        'recruiters.industry', 
        'recruiters.logo'
      )
      .select(
        Job.query()
          .where('recruiter_id', ref('recruiters.id'))
          .where('status', 'active')
          .count()
          .as('open_roles_count')
      )
      .whereExists(
        Job.query()
          .where('recruiter_id', ref('recruiters.id'))
          .where('status', 'active')
      )
      .orderBy('open_roles_count', 'desc')
      .limit(limit);

    if (industry) {
      companiesQuery.where('recruiters.industry', 'ILIKE', industry);
    }

    if (currentRecruiterId) {
      companiesQuery.whereNot('recruiters.id', currentRecruiterId);
    }

    const companies = await companiesQuery;

    return reply.status(200).send({
      success: true,
      data: {
        companies: companies.map(c => ({
          id: `company_${c.id}`,
          name: c.name || 'Unknown Company',
          industry: c.industry || 'IT Services',
          logo: c.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || 'Company')}&background=random`,
          open_roles: parseInt(c.open_roles_count, 10),
          hiring_status: true
        }))
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, error: 'Internal server error' });
  }
};

// ── GET /jobs/sitemap — public, lightweight, used by Next.js sitemap.ts ──────
export const getSitemapJobs = async (request, reply) => {
  try {
    const jobs = await Job.query()
      .where('status', 'active')
      .select('id', 'updated_at')
      .orderBy('id', 'asc');

    return reply.status(200).send({
      success: true,
      message: 'OK',
      data: jobs.map(j => ({ id: `job_${j.id}`, updated_at: j.updated_at })),
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
