import JobAlert from '../../models/candidate/JobAlert.js';
import { sanitizeText } from '../../utils/sanitize.js';

const MAX_ALERTS_PER_USER = 10;

function formatAlert(a) {
  return {
    id:          `alert_${a.id}`,
    name:        a.name,
    criteria:    a.criteria ?? {},
    frequency:   a.frequency,
    is_active:   a.is_active,
    last_run_at: a.last_run_at ?? null,
    created_at:  a.created_at,
    updated_at:  a.updated_at,
  };
}

function sanitizeCriteria(raw = {}) {
  return {
    keywords:  raw.keywords  ? sanitizeText(String(raw.keywords))  : null,
    location:  raw.location  ? sanitizeText(String(raw.location))  : null,
    work_mode: Array.isArray(raw.work_mode) ? raw.work_mode : [],
    job_type:  Array.isArray(raw.job_type)  ? raw.job_type  : [],
    salary_min: raw.salary_min != null ? parseInt(raw.salary_min, 10) : null,
    experience: raw.experience != null  ? raw.experience             : null,
  };
}

export const listAlerts = async (request, reply) => {
  try {
    const alerts = await JobAlert.query()
      .where('user_id', request.user.id)
      .orderBy('created_at', 'desc');

    return reply.status(200).send({
      success: true,
      message: 'Job alerts fetched.',
      data: { alerts: alerts.map(formatAlert) },
    });
  } catch (err) {
    request.server.log.error(err);
    return reply.status(500).send({ success: false, message: 'Internal server error.' });
  }
};

export const createAlert = async (request, reply) => {
  try {
    const userId = request.user.id;
    const { name, criteria = {}, frequency = 'daily' } = request.body;

    const count = await JobAlert.query().where('user_id', userId).resultSize();
    if (count >= MAX_ALERTS_PER_USER) {
      return reply.status(422).send({
        success: false,
        message: `Maximum ${MAX_ALERTS_PER_USER} job alerts per account.`,
      });
    }

    const alert = await JobAlert.query()
      .insert({
        user_id:   userId,
        name:      sanitizeText(String(name)),
        criteria:  sanitizeCriteria(criteria),
        frequency,
        is_active: true,
      })
      .returning('*');

    return reply.status(201).send({
      success: true,
      message: 'Job alert created.',
      data: { alert: formatAlert(alert) },
    });
  } catch (err) {
    request.server.log.error(err);
    return reply.status(500).send({ success: false, message: 'Internal server error.' });
  }
};

export const updateAlert = async (request, reply) => {
  try {
    const userId  = request.user.id;
    const rawId   = request.params.alertId;
    const alertId = parseInt(rawId.replace('alert_', ''), 10);

    if (isNaN(alertId)) {
      return reply.status(400).send({ success: false, message: 'Invalid alert ID.' });
    }

    const existing = await JobAlert.query().findOne({ id: alertId, user_id: userId });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Alert not found.' });
    }

    const { name, criteria, frequency, is_active } = request.body;
    const patch = { updated_at: new Date().toISOString() };

    if (name      !== undefined) patch.name      = sanitizeText(String(name));
    if (frequency !== undefined) patch.frequency = frequency;
    if (is_active !== undefined) patch.is_active = Boolean(is_active);
    if (criteria  !== undefined) patch.criteria  = sanitizeCriteria(criteria);

    const updated = await existing.$query().patchAndFetch(patch);

    return reply.status(200).send({
      success: true,
      message: 'Job alert updated.',
      data: { alert: formatAlert(updated) },
    });
  } catch (err) {
    request.server.log.error(err);
    return reply.status(500).send({ success: false, message: 'Internal server error.' });
  }
};

export const deleteAlert = async (request, reply) => {
  try {
    const userId  = request.user.id;
    const rawId   = request.params.alertId;
    const alertId = parseInt(rawId.replace('alert_', ''), 10);

    if (isNaN(alertId)) {
      return reply.status(400).send({ success: false, message: 'Invalid alert ID.' });
    }

    const existing = await JobAlert.query().findOne({ id: alertId, user_id: userId });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Alert not found.' });
    }

    await JobAlert.query().deleteById(alertId);

    return reply.status(200).send({ success: true, message: 'Job alert deleted.' });
  } catch (err) {
    request.server.log.error(err);
    return reply.status(500).send({ success: false, message: 'Internal server error.' });
  }
};
