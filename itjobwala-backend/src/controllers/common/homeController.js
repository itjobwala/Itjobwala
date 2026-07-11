import Job from '../../models/jobs/Job.js';
import Recruiter from '../../models/recruiter/Recruiter.js';
import User from '../../models/candidate/User.js';
import Application from '../../models/jobs/Application.js';

// Average days between a candidate applying and the recruiter's first
// status change on that application (their "first reply").
const getAvgResponseDays = async () => {
  const respondedApps = await Application.query()
    .whereNot('status', 'applied')
    .select('applied_at', 'timeline');

  const responseTimes = respondedApps.map(app => {
    const tl = typeof app.timeline === 'string' ? JSON.parse(app.timeline) : (app.timeline ?? []);
    const firstResponse = Array.isArray(tl) ? tl.find(e => e.status !== 'applied') : null;
    if (!firstResponse?.at || !app.applied_at) return null;

    const days = (new Date(firstResponse.at) - new Date(app.applied_at)) / (1000 * 60 * 60 * 24);
    return days >= 0 ? days : null;
  }).filter(v => v !== null);

  if (responseTimes.length === 0) return null;
  return Math.round(responseTimes.reduce((sum, v) => sum + v, 0) / responseTimes.length);
};

export const getHomeStats = async (request, reply) => {
  try {
    const total_jobs = await Job.query().where('status', 'active').resultSize();
    const total_companies = await Recruiter.query().resultSize();
    const total_candidates = await User.query().resultSize();
    const avg_response_days = await getAvgResponseDays();

    // Calculate jobs added today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const jobs_added_today = await Job.query()
      .where('status', 'active')
      .where('created_at', '>=', startOfDay.toISOString())
      .resultSize();

    return reply.status(200).send({
      success: true,
      message: 'Platform statistics fetched.',
      data: {
        total_jobs,
        total_companies,
        total_candidates,
        jobs_added_today,
        avg_response_days
      }
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

