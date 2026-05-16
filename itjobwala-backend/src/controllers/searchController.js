import Job from '../models/Job.js';
import Recruiter from '../models/Recruiter.js';
import { raw } from 'objection';

export const getSearchSuggestions = async (request, reply) => {
  try {
    const { q } = request.query;
    if (!q || q.length < 2) {
      return reply.status(200).send({
        success: true,
        data: { suggestions: [] }
      });
    }

    const searchQuery = `%${q}%`;

    // 1. Search job titles
    const titles = await Job.query()
      .distinct('title')
      .where('title', 'ILIKE', searchQuery)
      .where('status', 'active')
      .limit(3);

    // 2. Search companies
    const companies = await Recruiter.query()
      .distinct('company_name')
      .where('company_name', 'ILIKE', searchQuery)
      .limit(3);

    // 3. Search skills inside JSONB
    // This is a generic raw approach to unnest jsonb array and filter
    let skills = [];
    try {
      const skillsResult = await Job.knex().raw(`
        SELECT DISTINCT skill 
        FROM jobs, jsonb_array_elements_text(skills) AS skill
        WHERE skill ILIKE ?
        LIMIT 3
      `, [searchQuery]);
      skills = skillsResult.rows || [];
    } catch (err) {
      // Ignore if skills are not properly formatted JSONB arrays
      request.server.log.error(err);
    }

    const suggestions = [
      ...titles.map(t => ({ text: t.title, type: 'job_title' })),
      ...companies.map(c => ({ text: c.company_name, type: 'company' })),
      ...skills.map(s => ({ text: s.skill, type: 'skill' }))
    ];

    return reply.status(200).send({
      success: true,
      message: 'Suggestions fetched.',
      data: { suggestions }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const searchCompanies = async (request, reply) => {
  try {
    const { q, industry, size, page = 1, limit = 10 } = request.query;

    // We'll join jobs to count active jobs
    const query = Recruiter.query()
      .select('recruiters.*', Job.relatedQuery('jobs').count().as('active_jobs_count'))
      .where('jobs.status', 'active')
      .leftJoin('jobs', 'recruiters.id', 'jobs.recruiter_id')
      .groupBy('recruiters.id');

    // Wait, the relatedQuery subquery approach is cleaner in Objection:
    const cleanQuery = Recruiter.query()
      .select(
        'recruiters.*',
        Recruiter.relatedQuery('jobs')
          .where('status', 'active')
          .count()
          .as('active_jobs_count')
      );

    if (q) cleanQuery.where('company_name', 'ILIKE', `%${q}%`);
    if (industry) cleanQuery.where('industry', 'ILIKE', `%${industry}%`);
    if (size) cleanQuery.where('size', size);

    const pageIndex = Math.max(0, parseInt(page, 10) - 1);
    const pageSize = parseInt(limit, 10);

    const result = await cleanQuery.page(pageIndex, pageSize);

    return reply.status(200).send({
      success: true,
      message: 'Companies fetched.',
      data: {
        companies: result.results.map(company => ({
          id: `company_${company.id}`,
          name: company.company_name,
          logo: company.logo,
          industry: company.industry,
          location: company.headquarters, // We stored HQ as location
          rating: 4.5, // Mock rating
          active_jobs_count: parseInt(company.active_jobs_count, 10) || 0
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
