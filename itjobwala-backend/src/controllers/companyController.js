import Recruiter from '../models/Recruiter.js';
import Job from '../models/Job.js';

export const getCompanyProfile = async (request, reply) => {
  try {
    const companyId = request.params.company_id.replace('company_', '');

    const company = await Recruiter.query()
      .findById(companyId)
      .select(
        'recruiters.*',
        Recruiter.relatedQuery('jobs')
          .where('status', 'active')
          .count()
          .as('active_jobs_count')
      );

    if (!company) {
      return reply.status(404).send({ success: false, message: 'Company not found.' });
    }

    return reply.status(200).send({
      success: true,
      message: 'Company profile fetched.',
      data: {
        id: `company_${company.id}`,
        name: company.company_name,
        logo: company.logo,
        cover_image: company.cover_image,
        color_class: company.color_class,
        tagline: company.tagline,
        about: company.about,
        industry: company.industry,
        company_type: company.company_type,
        size: company.size,
        founded: company.founded,
        website: company.website,
        headquarters: company.headquarters,
        social_links: {
          linkedin: company.linkedin,
          twitter: company.twitter
        },
        rating: 4.5, // Mock rating
        active_jobs_count: parseInt(company.active_jobs_count, 10) || 0
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getCompanyJobs = async (request, reply) => {
  try {
    const companyId = request.params.company_id.replace('company_', '');
    const { page = 1, limit = 10 } = request.query;

    const query = Job.query()
      .where('recruiter_id', companyId)
      .where('status', 'active')
      .withGraphFetched('recruiter')
      .orderBy('created_at', 'desc');

    const pageIndex = Math.max(0, parseInt(page, 10) - 1);
    const pageSize = parseInt(limit, 10);

    const result = await query.page(pageIndex, pageSize);

    return reply.status(200).send({
      success: true,
      message: 'Company jobs fetched.',
      data: {
        jobs: result.results.map(job => ({
          id: `job_${job.id}`,
          title: job.title,
          company: job.recruiter?.company_name || job.company_name,
          company_logo: job.recruiter?.logo,
          company_color_class: job.recruiter?.color_class,
          location: job.location,
          work_mode: job.work_mode,
          job_type: job.job_type,
          experience_min: job.experience_min,
          experience_max: job.experience_max,
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          skills: job.skills || [],
          company_type: job.recruiter?.company_type,
          is_new: job.is_new || false,
          is_hot: job.is_hot || false,
          applicants: job.applicants || 0,
          is_actively_hiring: job.is_actively_hiring,
          posted_at: job.posted_at || job.created_at
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
