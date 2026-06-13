import knex from '../../config/db.js';
import User from '../../models/candidate/User.js';
import Recruiter from '../../models/recruiter/Recruiter.js';
import AdminAction from '../../models/admin/AdminAction.js';
import { revokeAllUserTokens } from '../../utils/tokenService.js';
import { sendJobModerationEmail } from '../../services/email/mailer.service.js';

const SAFE_USER_COLS = [
  'id', 'full_name', 'email', 'mobile', 'location', 'title',
  'work_status', 'profile_completion', 'open_to_work',
  'profile_photo_url', 'is_active', 'email_verified', 'created_at',
];

const SAFE_RECRUITER_COLS = [
  'id', 'full_name', 'company_name', 'email', 'industry',
  'company_type', 'location', 'is_active', 'is_verified',
  'email_verified', 'created_at',
];

async function logAction(adminId, action, targetType, targetId, note = null) {
  await AdminAction.query().insert({ admin_id: adminId, action, target_type: targetType, target_id: targetId, note });
}

// ── GET /admin/stats ──────────────────────────────────────────────────────────
export const getStats = async (request, reply) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      [{ total_candidates }],
      [{ total_recruiters }],
      [{ total_jobs }],
      [{ active_jobs }],
      [{ total_applications }],
      [{ total_interviews }],
      [{ new_candidates_7d }],
      [{ new_recruiters_7d }],
    ] = await Promise.all([
      knex('users').count('id as total_candidates'),
      knex('recruiters').count('id as total_recruiters'),
      knex('jobs').count('id as total_jobs'),
      knex('jobs').where('status', 'active').count('id as active_jobs'),
      knex('applications').count('id as total_applications'),
      knex('interviews').count('id as total_interviews'),
      knex('users').where('created_at', '>=', sevenDaysAgo).count('id as new_candidates_7d'),
      knex('recruiters').where('created_at', '>=', sevenDaysAgo).count('id as new_recruiters_7d'),
    ]);

    return reply.status(200).send({
      success: true,
      message: 'OK',
      data: {
        total_candidates:   Number(total_candidates),
        total_recruiters:   Number(total_recruiters),
        total_jobs:         Number(total_jobs),
        active_jobs:        Number(active_jobs),
        total_applications: Number(total_applications),
        total_interviews:   Number(total_interviews),
        new_candidates_7d:  Number(new_candidates_7d),
        new_recruiters_7d:  Number(new_recruiters_7d),
      },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// ── GET /admin/users ──────────────────────────────────────────────────────────
export const getUsers = async (request, reply) => {
  const { role = 'candidate', search = '', status, page = 1 } = request.query;
  const limit  = 20;
  const offset = (Number(page) - 1) * limit;

  try {
    const cols = role === 'recruiter' ? SAFE_RECRUITER_COLS : SAFE_USER_COLS;
    const table = role === 'recruiter' ? 'recruiters' : 'users';

    let query = knex(table).select(cols);
    let countQuery = knex(table).count('id as total');

    if (search) {
      const term = `%${search}%`;
      query      = query.where(b => b.whereILike('full_name', term).orWhereILike('email', term));
      countQuery = countQuery.where(b => b.whereILike('full_name', term).orWhereILike('email', term));
    }

    if (status === 'active') {
      query      = query.where('is_active', true);
      countQuery = countQuery.where('is_active', true);
    } else if (status === 'suspended') {
      query      = query.where('is_active', false);
      countQuery = countQuery.where('is_active', false);
    }

    const [rows, [{ total }]] = await Promise.all([
      query.orderBy('created_at', 'desc').limit(limit).offset(offset),
      countQuery,
    ]);

    return reply.status(200).send({
      success: true,
      message: 'OK',
      data: { users: rows, total: Number(total), page: Number(page), limit },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// ── GET /admin/users/:role/:id ────────────────────────────────────────────────
export const getUserDetail = async (request, reply) => {
  const { role, id } = request.params;
  try {
    if (role === 'recruiter') {
      const rec = await Recruiter.query()
        .select(...SAFE_RECRUITER_COLS)
        .findById(id);
      if (!rec) return reply.status(404).send({ success: false, message: 'Not found' });

      const [{ job_count }] = await knex('jobs').where('recruiter_id', id).count('id as job_count');

      return reply.status(200).send({ success: true, message: 'OK', data: { ...rec, job_count: Number(job_count) } });
    }

    const user = await User.query()
      .select(...SAFE_USER_COLS)
      .findById(id);
    if (!user) return reply.status(404).send({ success: false, message: 'Not found' });

    const [{ app_count }] = await knex('applications').where('user_id', id).count('id as app_count');

    return reply.status(200).send({ success: true, message: 'OK', data: { ...user, app_count: Number(app_count) } });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// ── PATCH /admin/users/:role/:id/status ───────────────────────────────────────
export const patchUserStatus = async (request, reply) => {
  const { role, id } = request.params;
  const { is_active } = request.body;
  const adminId = request.user.id;

  try {
    const Model = role === 'recruiter' ? Recruiter : User;
    const target = await Model.query().findById(id);
    if (!target) return reply.status(404).send({ success: false, message: 'Not found' });

    await Model.query().patchAndFetchById(id, { is_active });

    if (!is_active) {
      await revokeAllUserTokens(id, role);
    }

    await logAction(adminId, is_active ? 'reactivate' : 'suspend', role, Number(id));

    return reply.status(200).send({
      success: true,
      message: is_active ? 'Account reactivated' : 'Account suspended and sessions revoked',
      data: { id: Number(id), is_active },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// ── PATCH /admin/recruiters/:id/verify ───────────────────────────────────────
export const patchRecruiterVerify = async (request, reply) => {
  const { id } = request.params;
  const { is_verified } = request.body;
  const adminId = request.user.id;

  try {
    const rec = await Recruiter.query().findById(id);
    if (!rec) return reply.status(404).send({ success: false, message: 'Recruiter not found' });

    await Recruiter.query().patchAndFetchById(id, { is_verified });
    await logAction(adminId, is_verified ? 'verify_recruiter' : 'unverify_recruiter', 'recruiter', Number(id));

    return reply.status(200).send({
      success: true,
      message: is_verified ? 'Recruiter verified' : 'Recruiter verification removed',
      data: { id: Number(id), is_verified },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// ── GET /admin/jobs ───────────────────────────────────────────────────────────
export const getJobs = async (request, reply) => {
  const { search = '', status, page = 1 } = request.query;
  const limit  = 20;
  const offset = (Number(page) - 1) * limit;

  try {
    let query = knex('jobs')
      .select(
        'jobs.id', 'jobs.title', 'jobs.company_name', 'jobs.location',
        'jobs.job_type', 'jobs.status', 'jobs.created_at',
        'recruiters.full_name as poster_name', 'recruiters.email as poster_email',
      )
      .leftJoin('recruiters', 'jobs.recruiter_id', 'recruiters.id');

    let countQuery = knex('jobs').count('jobs.id as total')
      .leftJoin('recruiters', 'jobs.recruiter_id', 'recruiters.id');

    if (search) {
      const term = `%${search}%`;
      query      = query.where(b => b.whereILike('jobs.title', term).orWhereILike('jobs.company_name', term));
      countQuery = countQuery.where(b => b.whereILike('jobs.title', term).orWhereILike('jobs.company_name', term));
    }

    if (status) {
      query      = query.where('jobs.status', status);
      countQuery = countQuery.where('jobs.status', status);
    }

    const [rows, [{ total }]] = await Promise.all([
      query.orderBy('jobs.created_at', 'desc').limit(limit).offset(offset),
      countQuery,
    ]);

    return reply.status(200).send({
      success: true,
      message: 'OK',
      data: { jobs: rows, total: Number(total), page: Number(page), limit },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// ── GET /admin/jobs/queue ─────────────────────────────────────────────────────
export const getJobQueue = async (request, reply) => {
  const { page = 1 } = request.query;
  const limit  = 20;
  const offset = (Number(page) - 1) * limit;

  try {
    const [rows, [{ total }]] = await Promise.all([
      knex('jobs')
        .select(
          'jobs.id', 'jobs.title', 'jobs.company_name', 'jobs.location',
          'jobs.job_type', 'jobs.status', 'jobs.moderation_reason', 'jobs.auto_flags',
          'jobs.submitted_at', 'jobs.created_at',
          'recruiters.id as recruiter_id', 'recruiters.full_name as poster_name',
          'recruiters.email as poster_email', 'recruiters.is_verified as recruiter_verified',
        )
        .leftJoin('recruiters', 'jobs.recruiter_id', 'recruiters.id')
        .whereIn('jobs.status', ['pending', 'needs_changes'])
        .orderBy('jobs.submitted_at', 'asc')
        .limit(limit)
        .offset(offset),
      knex('jobs').whereIn('status', ['pending', 'needs_changes']).count('id as total'),
    ]);

    return reply.status(200).send({
      success: true,
      message: 'OK',
      data: { jobs: rows, total: Number(total), page: Number(page), limit },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// ── PATCH /admin/jobs/:id/moderate ────────────────────────────────────────────
export const moderateJob = async (request, reply) => {
  const { id } = request.params;
  const { decision, reason } = request.body; // decision: 'approve' | 'needs_changes' | 'remove'
  const adminId = request.user.id;

  const validDecisions = ['approve', 'needs_changes', 'remove'];
  if (!validDecisions.includes(decision)) {
    return reply.status(400).send({ success: false, message: `decision must be one of: ${validDecisions.join(', ')}` });
  }

  if ((decision === 'needs_changes' || decision === 'remove') && !reason?.trim()) {
    return reply.status(400).send({ success: false, message: 'reason is required when decision is needs_changes or remove' });
  }

  try {
    const [job] = await knex('jobs')
      .where('jobs.id', id)
      .select('jobs.id', 'jobs.title', 'jobs.status', 'jobs.recruiter_id')
      .leftJoin('recruiters', 'jobs.recruiter_id', 'recruiters.id');

    // Re-fetch with recruiter email for the notification
    const jobRow = await knex('jobs')
      .where('jobs.id', id)
      .select('jobs.id', 'jobs.title', 'jobs.status', 'jobs.recruiter_id',
              'recruiters.email as recruiter_email', 'recruiters.full_name as recruiter_name')
      .leftJoin('recruiters', 'jobs.recruiter_id', 'recruiters.id')
      .first();

    if (!jobRow) return reply.status(404).send({ success: false, message: 'Job not found' });

    const statusMap = { approve: 'active', needs_changes: 'needs_changes', remove: 'removed' };
    const newStatus = statusMap[decision];

    await knex('jobs').where({ id }).update({
      status:          newStatus,
      moderation_reason: decision === 'approve' ? null : reason,
      reviewed_by:     adminId,
      reviewed_at:     new Date().toISOString(),
    });

    await logAction(adminId, `moderate_job_${decision}`, 'job', Number(id), `${jobRow.title} → ${newStatus}${reason ? ` | ${reason}` : ''}`);

    // Notify recruiter (fire-and-forget)
    if (jobRow.recruiter_email) {
      sendJobModerationEmail({
        to:       jobRow.recruiter_email,
        name:     jobRow.recruiter_name,
        jobTitle: jobRow.title,
        decision,
        reason:   reason || null,
        jobUrl:   null,
      }).catch(() => {});
    }

    return reply.status(200).send({
      success: true,
      message: `Job moderated: ${newStatus}`,
      data: { id: Number(id), status: newStatus, moderation_reason: reason || null },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// ── PATCH /admin/jobs/:id/status ──────────────────────────────────────────────
export const patchJobStatus = async (request, reply) => {
  const { id } = request.params;
  const { status } = request.body;
  const adminId = request.user.id;

  const allowed = ['active', 'removed', 'closed', 'needs_changes'];
  if (!allowed.includes(status)) {
    return reply.status(400).send({ success: false, message: `status must be one of: ${allowed.join(', ')}` });
  }

  try {
    const [job] = await knex('jobs').where({ id }).select('id', 'title');
    if (!job) return reply.status(404).send({ success: false, message: 'Job not found' });

    await knex('jobs').where({ id }).update({ status });
    await logAction(adminId, `set_job_status_${status}`, 'job', Number(id), job.title);

    return reply.status(200).send({
      success: true,
      message: `Job status set to '${status}'`,
      data: { id: Number(id), status },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// ── GET /admin/reports ────────────────────────────────────────────────────────
export const getReports = async (request, reply) => {
  const { status, page = 1 } = request.query;
  const limit  = 20;
  const offset = (Number(page) - 1) * limit;

  try {
    let query = knex('reports')
      .select(
        'reports.id', 'reports.target_type', 'reports.target_id', 'reports.reason',
        'reports.details', 'reports.status', 'reports.resolution_note',
        'reports.created_at', 'reports.resolved_at',
        'users.full_name as reporter_name', 'users.email as reporter_email',
      )
      .leftJoin('users', 'reports.reporter_id', 'users.id');

    let countQuery = knex('reports').count('id as total');

    if (status) {
      query      = query.where('reports.status', status);
      countQuery = countQuery.where('reports.status', status);
    }

    const [rows, [{ total }]] = await Promise.all([
      query.orderBy('reports.created_at', 'desc').limit(limit).offset(offset),
      countQuery,
    ]);

    return reply.status(200).send({
      success: true,
      message: 'OK',
      data: { reports: rows, total: Number(total), page: Number(page), limit },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// ── PATCH /admin/reports/:id ──────────────────────────────────────────────────
export const resolveReport = async (request, reply) => {
  const { id } = request.params;
  const { status, resolution_note } = request.body; // status: 'resolved' | 'dismissed'
  const adminId = request.user.id;

  const validStatuses = ['resolved', 'dismissed'];
  if (!validStatuses.includes(status)) {
    return reply.status(400).send({ success: false, message: `status must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const report = await knex('reports').where({ id }).first();
    if (!report) return reply.status(404).send({ success: false, message: 'Report not found' });
    if (report.status !== 'open') {
      return reply.status(409).send({ success: false, message: 'Report is already resolved' });
    }

    await knex('reports').where({ id }).update({
      status,
      resolution_note: resolution_note || null,
      resolved_by:     adminId,
      resolved_at:     new Date().toISOString(),
    });

    await logAction(adminId, `report_${status}`, 'report', Number(id), resolution_note || null);

    return reply.status(200).send({
      success: true,
      message: `Report ${status}`,
      data: { id: Number(id), status },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// ── GET /admin/actions ────────────────────────────────────────────────────────
export const getActions = async (request, reply) => {
  const { page = 1 } = request.query;
  const limit  = 30;
  const offset = (Number(page) - 1) * limit;

  try {
    const [rows, [{ total }]] = await Promise.all([
      knex('admin_actions')
        .select(
          'admin_actions.id', 'admin_actions.action', 'admin_actions.target_type',
          'admin_actions.target_id', 'admin_actions.note', 'admin_actions.created_at',
          'admins.full_name as admin_name', 'admins.email as admin_email',
        )
        .leftJoin('admins', 'admin_actions.admin_id', 'admins.id')
        .orderBy('admin_actions.created_at', 'desc')
        .limit(limit)
        .offset(offset),
      knex('admin_actions').count('id as total'),
    ]);

    return reply.status(200).send({
      success: true,
      message: 'OK',
      data: { actions: rows, total: Number(total), page: Number(page), limit },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
