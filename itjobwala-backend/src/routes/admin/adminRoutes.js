import { adminLogin, adminMe }    from '../../controllers/admin/adminAuthController.js';
import {
  getStats,
  getUsers,
  getUserDetail,
  patchUserStatus,
  patchRecruiterVerify,
  getJobs,
  getJobQueue,
  moderateJob,
  patchJobStatus,
  getReports,
  resolveReport,
  getActions,
} from '../../controllers/admin/adminController.js';
import {
  getSignupAnalytics,
  getJobAnalytics,
  getApplicationAnalytics,
} from '../../controllers/admin/adminAnalyticsController.js';
import {
  exportUsers,
  exportJobs,
  exportReports,
} from '../../controllers/admin/adminExportController.js';

export default async function adminRoutes(fastify, _opts) {
  const auth = { preValidation: [fastify.requireAdmin] };

  // ── Auth (public within admin namespace) ──────────────────────────────────
  fastify.post('/admin/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email:    { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 1 },
        },
      },
    },
    config: { rateLimit: { max: 10, timeWindow: '10 minutes' } },
  }, adminLogin);

  fastify.get('/admin/me', auth, adminMe);

  // ── Stats ─────────────────────────────────────────────────────────────────
  fastify.get('/admin/stats', auth, getStats);

  // ── Users ─────────────────────────────────────────────────────────────────
  fastify.get('/admin/users', {
    ...auth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          role:   { type: 'string', enum: ['candidate', 'recruiter'], default: 'candidate' },
          search: { type: 'string', default: '' },
          status: { type: 'string', enum: ['active', 'suspended'] },
          page:   { type: 'integer', minimum: 1, default: 1 },
        },
      },
    },
  }, getUsers);

  fastify.get('/admin/users/:role/:id', {
    ...auth,
    schema: {
      params: {
        type: 'object',
        required: ['role', 'id'],
        properties: {
          role: { type: 'string', enum: ['candidate', 'recruiter'] },
          id:   { type: 'integer' },
        },
      },
    },
  }, getUserDetail);

  fastify.patch('/admin/users/:role/:id/status', {
    ...auth,
    schema: {
      params: {
        type: 'object',
        required: ['role', 'id'],
        properties: {
          role: { type: 'string', enum: ['candidate', 'recruiter'] },
          id:   { type: 'integer' },
        },
      },
      body: {
        type: 'object',
        required: ['is_active'],
        properties: { is_active: { type: 'boolean' } },
      },
    },
  }, patchUserStatus);

  // ── Recruiter verification ────────────────────────────────────────────────
  fastify.patch('/admin/recruiters/:id/verify', {
    ...auth,
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer' } },
      },
      body: {
        type: 'object',
        required: ['is_verified'],
        properties: { is_verified: { type: 'boolean' } },
      },
    },
  }, patchRecruiterVerify);

  // ── Jobs ──────────────────────────────────────────────────────────────────
  fastify.get('/admin/jobs', {
    ...auth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          search: { type: 'string', default: '' },
          status: { type: 'string' },
          page:   { type: 'integer', minimum: 1, default: 1 },
        },
      },
    },
  }, getJobs);

  fastify.patch('/admin/jobs/:id/status', {
    ...auth,
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer' } },
      },
      body: {
        type: 'object',
        required: ['status'],
        properties: { status: { type: 'string' } },
      },
    },
  }, patchJobStatus);

  // ── Job moderation queue ─────────────────────────────────────────────────
  fastify.get('/admin/jobs/queue', {
    ...auth,
    schema: {
      querystring: {
        type: 'object',
        properties: { page: { type: 'integer', minimum: 1, default: 1 } },
      },
    },
  }, getJobQueue);

  fastify.patch('/admin/jobs/:id/moderate', {
    ...auth,
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer' } },
      },
      body: {
        type: 'object',
        required: ['decision'],
        properties: {
          decision:        { type: 'string', enum: ['approve', 'needs_changes', 'remove'] },
          reason:          { type: 'string' },
        },
      },
    },
  }, moderateJob);

  // ── Reports ───────────────────────────────────────────────────────────────
  fastify.get('/admin/reports', {
    ...auth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['open', 'resolved', 'dismissed'] },
          page:   { type: 'integer', minimum: 1, default: 1 },
        },
      },
    },
  }, getReports);

  fastify.patch('/admin/reports/:id', {
    ...auth,
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer' } },
      },
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status:          { type: 'string', enum: ['resolved', 'dismissed'] },
          resolution_note: { type: 'string' },
        },
      },
    },
  }, resolveReport);

  // ── Audit log ─────────────────────────────────────────────────────────────
  fastify.get('/admin/actions', {
    ...auth,
    schema: {
      querystring: {
        type: 'object',
        properties: { page: { type: 'integer', minimum: 1, default: 1 } },
      },
    },
  }, getActions);

  // ── Analytics (read-only time-series, JSON envelope) ─────────────────────
  const rangeSchema = {
    querystring: {
      type: 'object',
      properties: {
        range: { type: 'string', pattern: '^\\d+d$', default: '30d' },
      },
    },
  };

  fastify.get('/admin/analytics/signups',      { ...auth, schema: rangeSchema }, getSignupAnalytics);
  fastify.get('/admin/analytics/jobs',         { ...auth, schema: rangeSchema }, getJobAnalytics);
  fastify.get('/admin/analytics/applications', { ...auth, schema: rangeSchema }, getApplicationAnalytics);

  // ── CSV exports (raw text/csv — no JSON envelope, logged to admin_actions) ─
  fastify.get('/admin/export/users', {
    ...auth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          role:   { type: 'string', enum: ['candidate', 'recruiter'], default: 'candidate' },
          status: { type: 'string', enum: ['active', 'suspended'] },
        },
      },
    },
  }, exportUsers);

  fastify.get('/admin/export/jobs', {
    ...auth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string' },
        },
      },
    },
  }, exportJobs);

  fastify.get('/admin/export/reports', {
    ...auth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['open', 'resolved', 'dismissed'] },
        },
      },
    },
  }, exportReports);
}
