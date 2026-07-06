import JobAlert from '../../models/candidate/JobAlert.js';
import Job from '../../models/jobs/Job.js';
import { applyJobFilters } from './jobQueryHelper.js';
import { notifyCandidate } from '../../utils/notifyHelper.js';
import { sendJobAlertDigestEmail } from '../email/mailer.service.js';

const HOURS_24  = 24 * 60 * 60 * 1000;
const HOURS_23  = 23 * 60 * 60 * 1000;
const DAYS_7    =  7 * 24 * 60 * 60 * 1000;
// Slightly under INSTANT_POLL_INTERVAL_MS (server.js) so an instant alert is
// always eligible again by the time the next poll tick comes around.
const MINUTES_4 =  4 * 60 * 1000;

function shouldRun(alert, now) {
  if (!alert.last_run_at) return true;
  const elapsed = now - new Date(alert.last_run_at);
  if (alert.frequency === 'weekly') return elapsed >= DAYS_7;
  if (alert.frequency === 'instant') return elapsed >= MINUTES_4;
  return elapsed >= HOURS_23;
}

async function processAlert(alert, now, logger) {
  const cutoff = alert.last_run_at
    ? new Date(alert.last_run_at)
    : new Date(now - HOURS_24);

  const criteria = alert.criteria ?? {};

  const query = Job.query()
    .where('status', 'active')
    .where('created_at', '>', cutoff.toISOString())
    .select('id', 'title', 'location', 'work_mode', 'job_type', 'company_name');

  applyJobFilters(query, {
    q:          criteria.keywords  ?? null,
    location:   criteria.location  ?? null,
    job_type:   criteria.job_type  ?? null,
    work_mode:  criteria.work_mode ?? null,
    salary_min: criteria.salary_min ?? null,
    experience: criteria.experience ?? null,
  });

  const jobs = await query;

  await JobAlert.query()
    .findById(alert.id)
    .patch({ last_run_at: now.toISOString(), updated_at: now.toISOString() });

  if (!jobs.length) return;

  for (const job of jobs) {
    notifyCandidate(alert.user_id, {
      type:      'job_alert',
      title:     `New match: ${job.title}`,
      message:   `A new job matching your alert "${alert.name}" was posted${job.location ? ` in ${job.location}` : ''}.`,
      actionUrl: `/jobs/job_${job.id}`,
    });
  }

  if (alert.frequency === 'instant') {
    for (const job of jobs) {
      await sendJobAlertDigestEmail({
        to:        alert.user_email,
        name:      alert.user_name,
        alertName: alert.name,
        jobs:      [job],
        single:    true,
      });
    }
  } else {
    await sendJobAlertDigestEmail({
      to:        alert.user_email,
      name:      alert.user_name,
      alertName: alert.name,
      jobs,
    });
  }

  logger.info?.(`[job-alerts] alert ${alert.id} — ${jobs.length} match(es) sent to ${alert.user_email}`);
}

/**
 * @param {object} [options]
 * @param {string[]} [options.frequencies] - restrict to these alert frequencies
 *   (e.g. ['instant'] for the frequent poll, ['daily','weekly'] for the daily
 *   sweep). Omit to process all frequencies.
 */
export async function runJobAlertMatcher(log, { frequencies } = {}) {
  const logger = log ?? console;
  logger.info?.('[job-alerts] Matcher run started');

  try {
    let alertsQuery = JobAlert.query()
      .where('job_alerts.is_active', true)
      .join('users', 'job_alerts.user_id', 'users.id')
      .select(
        'job_alerts.*',
        'users.email as user_email',
        'users.full_name as user_name',
      );

    if (frequencies?.length) {
      alertsQuery = alertsQuery.whereIn('job_alerts.frequency', frequencies);
    }

    const alerts = await alertsQuery;

    const now     = new Date();
    const toRun   = alerts.filter(a => shouldRun(a, now));

    logger.info?.(`[job-alerts] ${alerts.length} active alerts, ${toRun.length} due to run`);

    for (const alert of toRun) {
      try {
        await processAlert(alert, now, logger);
      } catch (err) {
        logger.error?.({ err }, `[job-alerts] Failed processing alert ${alert.id}`);
      }
    }
  } catch (err) {
    logger.error?.({ err }, '[job-alerts] Matcher run failed');
  }
}
