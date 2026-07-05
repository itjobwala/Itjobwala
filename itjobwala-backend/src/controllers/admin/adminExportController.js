/**
 * CSV export endpoints — return raw text/csv, NOT the JSON envelope.
 * Each export is logged to admin_actions as a data-access audit record.
 * Exports are capped at EXPORT_CAP rows to prevent runaway queries.
 */
import knex from '../../config/db.js';
import AdminAction from '../../models/admin/AdminAction.js';

const EXPORT_CAP = 10_000;

const SAFE_USER_COLS = [
  'id', 'full_name', 'email', 'mobile', 'location', 'title',
  'work_status', 'profile_completion', 'open_to_work',
  'is_active', 'email_verified', 'created_at',
];

const SAFE_RECRUITER_COLS = [
  'id', 'full_name', 'company_name', 'email', 'industry',
  'company_type', 'location', 'is_active', 'is_verified',
  'email_verified', 'created_at',
];

const JOB_COLS = [
  'jobs.id', 'jobs.title', 'jobs.company_name', 'jobs.location',
  'jobs.job_type', 'jobs.work_mode', 'jobs.status', 'jobs.created_at',
  'recruiters.full_name as poster_name', 'recruiters.email as poster_email',
];

const REPORT_COLS = [
  'reports.id', 'reports.target_type', 'reports.target_id', 'reports.reason',
  'reports.details', 'reports.status', 'reports.resolution_note',
  'reports.created_at', 'reports.resolved_at',
  'users.full_name as reporter_name', 'users.email as reporter_email',
];

async function logAction(adminId, action, targetType, targetId, note = null) {
  await AdminAction.query().insert({
    admin_id: adminId, action, target_type: targetType, target_id: targetId, note,
  });
}

function csvEscape(val) {
  if (val == null) return '';
  const s = String(val);
  return /[,"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function buildCsv(headers, rows) {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => csvEscape(row[h])).join(','));
  }
  return lines.join('\r\n');
}

function csvReply(reply, csv, filename) {
  return reply
    .header('Content-Type', 'text/csv; charset=utf-8')
    .header('Content-Disposition', `attachment; filename="${filename}"`)
    .send(csv);
}

// ── GET /admin/export/users?role=candidate|recruiter&status=... ───────────────
export const exportUsers = async (request, reply) => {
  try {
    const { role = 'candidate', status } = request.query;
    const adminId = request.user.id;

    const cols  = role === 'recruiter' ? SAFE_RECRUITER_COLS : SAFE_USER_COLS;
    const table = role === 'recruiter' ? 'recruiters' : 'users';

    let query = knex(table).select(cols);
    if (status === 'active')    query = query.where('is_active', true);
    if (status === 'suspended') query = query.where('is_active', false);

    const rows     = await query.orderBy('created_at', 'desc').limit(EXPORT_CAP);
    const filename = `users_${role}_${Date.now()}.csv`;
    const csv      = buildCsv(cols, rows);

    await logAction(adminId, 'export_csv_users', role, 0, `${filename} — ${rows.length} rows`);

    return csvReply(reply, csv, filename);
  } catch (err) {
    request.server.log.error(err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// ── GET /admin/export/jobs?status=... ─────────────────────────────────────────
export const exportJobs = async (request, reply) => {
  try {
    const { status } = request.query;
    const adminId = request.user.id;

    let query = knex('jobs')
      .leftJoin('recruiters', 'jobs.recruiter_id', 'recruiters.id')
      .select(JOB_COLS);

    if (status) query = query.where('jobs.status', status);

    const rows     = await query.orderBy('jobs.created_at', 'desc').limit(EXPORT_CAP);
    const headers  = [
      'id', 'title', 'company_name', 'location', 'job_type', 'work_mode',
      'status', 'created_at', 'poster_name', 'poster_email',
    ];
    const filename = `jobs_${Date.now()}.csv`;
    const csv      = buildCsv(headers, rows);

    await logAction(adminId, 'export_csv_jobs', 'job', 0, `${filename} — ${rows.length} rows`);

    return csvReply(reply, csv, filename);
  } catch (err) {
    request.server.log.error(err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// ── GET /admin/export/reports?status=... ──────────────────────────────────────
export const exportReports = async (request, reply) => {
  try {
    const { status } = request.query;
    const adminId = request.user.id;

    let query = knex('reports')
      .leftJoin('users', 'reports.reporter_id', 'users.id')
      .select(REPORT_COLS);

    if (status) query = query.where('reports.status', status);

    const rows     = await query.orderBy('reports.created_at', 'desc').limit(EXPORT_CAP);
    const headers  = [
      'id', 'target_type', 'target_id', 'reason', 'details', 'status',
      'resolution_note', 'created_at', 'resolved_at', 'reporter_name', 'reporter_email',
    ];
    const filename = `reports_${Date.now()}.csv`;
    const csv      = buildCsv(headers, rows);

    await logAction(adminId, 'export_csv_reports', 'report', 0, `${filename} — ${rows.length} rows`);

    return csvReply(reply, csv, filename);
  } catch (err) {
    request.server.log.error(err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
