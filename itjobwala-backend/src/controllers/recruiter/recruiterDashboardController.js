import { raw } from 'objection';
import Job from '../../models/jobs/Job.js';
import Application from '../../models/jobs/Application.js';
import Activity from '../../models/recruiter/Activity.js';
import ResumeInsight from '../../models/candidate/ResumeInsight.js';
import ProfileView from '../../models/recruiter/ProfileView.js';

const AVATAR_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-500',
  'from-green-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600',
  'from-cyan-500 to-blue-500',
];

export const getDashboardStats = async (request, reply) => {
  try {
    const recruiterId = request.user.id;

    const sevenDaysAgo     = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo  = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const sevenDaysAgoISO  = sevenDaysAgo.toISOString();
    const fourteenDaysAgoISO = fourteenDaysAgo.toISOString();
    const sevenDaysAgoDate   = sevenDaysAgo.toISOString().split('T')[0];
    const fourteenDaysAgoDate = fourteenDaysAgo.toISOString().split('T')[0];

    const [jobsCount, applications, jobsThisWeek, jobsLastWeek, pvThisWeek, pvLastWeek] = await Promise.all([
      Job.query().where({ recruiter_id: recruiterId, status: 'active' }).resultSize(),
      Application.query()
        .join('jobs', 'applications.job_id', 'jobs.id')
        .where('jobs.recruiter_id', recruiterId)
        .select(
          'applications.status',
          'applications.applied_at',
          'applications.updated_at',
          'applications.timeline'
        ),
      Job.query().where('recruiter_id', recruiterId).where('created_at', '>=', sevenDaysAgoISO).resultSize(),
      Job.query().where('recruiter_id', recruiterId)
        .where('created_at', '>=', fourteenDaysAgoISO)
        .where('created_at', '<', sevenDaysAgoISO)
        .resultSize(),
      ProfileView.query()
        .where('recruiter_id', recruiterId)
        .where('viewed_date', '>=', sevenDaysAgoDate)
        .countDistinct('candidate_user_id as count')
        .first(),
      ProfileView.query()
        .where('recruiter_id', recruiterId)
        .where('viewed_date', '>=', fourteenDaysAgoDate)
        .where('viewed_date', '<', sevenDaysAgoDate)
        .countDistinct('candidate_user_id as count')
        .first(),
    ]);

    // Period deltas computed from the already-fetched applications array
    const inRange = (val, from, to) => {
      const d = new Date(val);
      return d >= from && (!to || d < to);
    };

    const thisWeekApps = applications.filter(a => inRange(a.applied_at, sevenDaysAgo)).length;
    const lastWeekApps = applications.filter(a => inRange(a.applied_at, fourteenDaysAgo, sevenDaysAgo)).length;

    const thisWeekInterviews = applications.filter(a => a.status === 'interview' && inRange(a.updated_at, sevenDaysAgo)).length;
    const lastWeekInterviews = applications.filter(a => a.status === 'interview' && inRange(a.updated_at, fourteenDaysAgo, sevenDaysAgo)).length;

    const thisWeekHires = applications.filter(a => a.status === 'hired' && inRange(a.updated_at, sevenDaysAgo)).length;
    const lastWeekHires = applications.filter(a => a.status === 'hired' && inRange(a.updated_at, fourteenDaysAgo, sevenDaysAgo)).length;

    // Average days from applied to hired (null when no hires yet)
    const hiredApps = applications.filter(a => a.status === 'hired');
    const hireTimes = hiredApps.map(app => {
      const tl = typeof app.timeline === 'string' ? JSON.parse(app.timeline) : (app.timeline ?? []);
      const hiredEntry = Array.isArray(tl) ? tl.find(e => e.status === 'hired') : null;
      const hiredAt   = hiredEntry?.at ? new Date(hiredEntry.at) : new Date(app.updated_at);
      const appliedAt = new Date(app.applied_at);
      const days = (hiredAt - appliedAt) / (1000 * 60 * 60 * 24);
      return days >= 0 ? days : null;
    }).filter(v => v !== null);
    const time_to_hire_days = hireTimes.length > 0
      ? Math.round(hireTimes.reduce((s, v) => s + v, 0) / hireTimes.length)
      : null;

    return reply.status(200).send({
      success: true,
      message: 'Dashboard stats fetched.',
      data: {
        active_jobs:           jobsCount,
        active_jobs_change:    jobsThisWeek - jobsLastWeek,
        total_applicants:      applications.length,
        applicants_change:     thisWeekApps - lastWeekApps,
        interviews_scheduled:  applications.filter(a => a.status === 'interview').length,
        interviews_change:     thisWeekInterviews - lastWeekInterviews,
        hires_made:            applications.filter(a => a.status === 'hired').length,
        hires_change:          thisWeekHires - lastWeekHires,
        profile_views:         parseInt(pvThisWeek?.count  ?? '0', 10),
        profile_views_change:  parseInt(pvThisWeek?.count  ?? '0', 10) - parseInt(pvLastWeek?.count ?? '0', 10),
        time_to_hire_days
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getPostedJobs = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const { page = 1, limit = 10, status, sort = 'newest', q } = request.query;

    const query = Job.query().where('recruiter_id', recruiterId);

    if (status) query.where('status', status);
    if (q) query.where('title', 'ILIKE', `%${q}%`);

    if (sort === 'newest') query.orderBy('created_at', 'desc');
    else query.orderBy('created_at', 'asc');

    const pageIndex = Math.max(0, parseInt(page, 10) - 1);
    const pageSize = parseInt(limit, 10);

    const result = await query.page(pageIndex, pageSize);

    // Real per-job applicant counts and view counts via single grouped aggregate queries
    const countMap = new Map();
    const viewsMap = new Map();
    if (result.results.length > 0) {
      const jobIds = result.results.map(j => j.id);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const [rows, viewRows] = await Promise.all([
        Application.query()
          .whereIn('job_id', jobIds)
          .groupBy('job_id')
          .select('job_id')
          .select(raw('COUNT(*)::int AS total'))
          .select(raw(`SUM(CASE WHEN status = 'shortlisted' THEN 1 ELSE 0 END)::int AS shortlisted_cnt`))
          .select(raw(`SUM(CASE WHEN applied_at >= ? THEN 1 ELSE 0 END)::int AS new_cnt`, [sevenDaysAgo])),
        Job.knex()('job_views')
          .whereIn('job_id', jobIds)
          .groupBy('job_id')
          .select('job_id')
          .count('* as view_count'),
      ]);
      for (const row of rows) countMap.set(row.job_id, row);
      for (const row of viewRows) viewsMap.set(row.job_id, parseInt(row.view_count, 10));
    }

    return reply.status(200).send({
      success: true,
      message: 'Posted jobs fetched.',
      data: {
        jobs: result.results.map(job => {
          const c = countMap.get(job.id);
          return {
            id: `job_${job.id}`,
            title: job.title,
            location: job.location,
            work_mode: job.work_mode,
            job_type: job.job_type,
            status: job.status,
            applicants_count:     c?.total          ?? 0,
            new_applicants_count: c?.new_cnt        ?? 0,
            shortlisted_count:    c?.shortlisted_cnt ?? 0,
            views:     viewsMap.get(job.id) ?? 0,
            posted_at: job.posted_at || job.created_at,
            closes_at: job.closes_at
          };
        }),
        pagination: {
          page:        pageIndex + 1,
          limit:       pageSize,
          total:       result.total,
          total_pages: Math.ceil(result.total / pageSize),
          has_next:    (pageIndex + 1) * pageSize < result.total,
          has_prev:    pageIndex > 0
        }
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getRecentApplicants = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const limit = parseInt(request.query.limit, 10) || 8;

    const applications = await Application.query()
      .join('jobs', 'applications.job_id', 'jobs.id')
      .join('users', 'applications.user_id', 'users.id')
      .where('jobs.recruiter_id', recruiterId)
      .select(
        'applications.id',
        'applications.status',
        'applications.applied_at',
        'applications.job_id',
        'jobs.id as job_id_raw',
        'jobs.title as job_title',
        'users.id as user_id_raw',
        'users.full_name as candidate_name',
        'users.location as candidate_location',
        'users.experience_years as candidate_exp'
      )
      .orderBy('applications.applied_at', 'desc')
      .limit(limit);

    // Real match scores from resume_insights
    const userIds = [...new Set(applications.map(a => a.user_id_raw))];
    const insights = userIds.length > 0
      ? await ResumeInsight.query().whereIn('candidate_id', userIds).select('candidate_id', 'qa_match_score')
      : [];
    const insightMap = new Map(insights.map(i => [i.candidate_id, i]));

    return reply.status(200).send({
      success: true,
      message: 'Recent applicants fetched.',
      data: {
        applicants: applications.map(app => ({
          application_id: `app_${app.id}`,
          candidate_id:   `cand_${app.user_id_raw}`,
          candidate_name: app.candidate_name,
          candidate_initials: app.candidate_name ? app.candidate_name.substring(0, 2).toUpperCase() : 'NA',
          candidate_avatar_color_class: AVATAR_GRADIENTS[app.user_id_raw % AVATAR_GRADIENTS.length],
          job_id:          `job_${app.job_id_raw}`,
          job_title:       app.job_title,
          experience_years: app.candidate_exp,
          location:        app.candidate_location,
          status:          app.status,
          match_score:     insightMap.get(app.user_id_raw)?.qa_match_score ?? null,
          applied_at:      app.applied_at
        }))
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getPipeline = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const jobId = request.query.job_id ? request.query.job_id.replace('job_', '') : null;

    const query = Application.query()
      .join('jobs', 'applications.job_id', 'jobs.id')
      .where('jobs.recruiter_id', recruiterId);

    if (jobId) query.where('jobs.id', jobId);

    const applications = await query.select('applications.status');

    const stages = [
      { stage: 'applied',     label: 'Applied',     color: 'blue'   },
      { stage: 'shortlisted', label: 'Shortlisted', color: 'purple' },
      { stage: 'interview',   label: 'Interview',   color: 'amber'  },
      { stage: 'hired',       label: 'Hired',       color: 'emerald'},
      { stage: 'rejected',    label: 'Rejected',    color: 'red'    },
    ];

    const data = stages.map(s => ({
      ...s,
      count: applications.filter(a => a.status === s.stage).length
    }));

    return reply.status(200).send({
      success: true,
      message: 'Pipeline fetched.',
      data: { stages: data }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getTopCandidates = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const limit = Math.min(parseInt(request.query.limit, 10) || 5, 20);

    const qaScoreSub       = '(SELECT ri.qa_match_score FROM resume_insights ri WHERE ri.candidate_id = applications.user_id LIMIT 1)';
    const careerLevelSub   = '(SELECT ri.career_level FROM resume_insights ri WHERE ri.candidate_id = applications.user_id LIMIT 1)';
    const extractedSkillsSub = '(SELECT ri.extracted_skills::text FROM resume_insights ri WHERE ri.candidate_id = applications.user_id LIMIT 1)';

    const rows = await Application.query()
      .join('jobs', 'applications.job_id', 'jobs.id')
      .join('users', 'applications.user_id', 'users.id')
      .where('jobs.recruiter_id', recruiterId)
      .whereNotIn('applications.status', ['rejected', 'withdrawn'])
      .whereRaw(`${qaScoreSub} IS NOT NULL`)
      .orderByRaw(`${qaScoreSub} DESC`)
      .limit(limit)
      .select(
        'applications.id',
        'applications.status',
        'applications.applied_at',
        'applications.job_id as job_id_raw',
        'users.full_name as candidate_name',
        'jobs.title as job_title',
        Application.knex().raw(`${qaScoreSub} AS qa_match_score`),
        Application.knex().raw(`${careerLevelSub} AS career_level`),
        Application.knex().raw(`${extractedSkillsSub} AS extracted_skills_raw`),
      );

    return reply.status(200).send({
      success: true,
      message: 'Top candidates fetched.',
      data: {
        candidates: rows.map(app => {
          let topSkills = [];
          try {
            const parsed = typeof app.extracted_skills_raw === 'string'
              ? JSON.parse(app.extracted_skills_raw)
              : (app.extracted_skills_raw || []);
            topSkills = Array.isArray(parsed) ? parsed.slice(0, 3) : [];
          } catch {}
          return {
            id:           `applicant_${app.id}`,
            candidateName: app.candidate_name,
            jobTitle:     app.job_title,
            jobId:        `job_${app.job_id_raw}`,
            qaMatchScore: app.qa_match_score,
            careerLevel:  app.career_level || null,
            status:       app.status,
            appliedDate:  app.applied_at,
            topSkills,
          };
        }),
      },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getActivityFeed = async (request, reply) => {
  try {
    const recruiterId = request.user.id;
    const limit = parseInt(request.query.limit, 10) || 10;

    const activities = await Activity.query()
      .where('recruiter_id', recruiterId)
      .orderBy('created_at', 'desc')
      .limit(limit);

    return reply.status(200).send({
      success: true,
      message: 'Activity feed fetched.',
      data: {
        activities: activities.map(act => ({
          id:          `act_${act.id}`,
          type:        act.type,
          message:     act.message,
          entity_id:   act.entity_id,
          entity_type: act.entity_type,
          created_at:  act.created_at
        }))
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
