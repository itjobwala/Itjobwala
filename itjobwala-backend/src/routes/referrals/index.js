import { createReferralJob }      from '../../controllers/referrals/createReferralJob.js';
import { getReferralJobs, getReferralJobById } from '../../controllers/referrals/getReferralJobs.js';
import { applyReferral }          from '../../controllers/referrals/applyReferral.js';
import { getMyReferralRequests }  from '../../controllers/referrals/getMyReferralRequests.js';
import { getReceivedReferrals }   from '../../controllers/referrals/getReceivedReferrals.js';
import { updateReferralStatus }   from '../../controllers/referrals/updateReferralStatus.js';
import { getReferralDashboard }   from '../../controllers/referrals/referralDashboard.js';

export default async function referralRoutes(fastify) {
  const candidateOnly = { preValidation: [fastify.requireCandidate] };
  const authAny       = { preValidation: [fastify.authenticate] };

  // ── Public (browse) — optionally authenticated for user_request field ──
  fastify.get('/referrals/jobs', {
    preValidation: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page:     { type: 'integer', minimum: 1 },
          limit:    { type: 'integer', minimum: 1, maximum: 50 },
          company:  { type: 'string' },
          skills:   { type: 'string' },
          location: { type: 'string' },
          sort:     { type: 'string', enum: ['newest', 'popular'] },
          mine:     { type: 'string' },
        },
      },
    },
  }, getReferralJobs);

  fastify.get('/referrals/jobs/:id', {
    preValidation: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^\\d+$' } },
      },
    },
  }, getReferralJobById);

  // ── Create referral job (any authenticated user) ──
  fastify.post('/referrals/jobs', {
    ...authAny,
    schema: {
      body: {
        type: 'object',
        required: ['company_name', 'job_title'],
        properties: {
          company_name:          { type: 'string', minLength: 1, maxLength: 255 },
          job_title:             { type: 'string', minLength: 1, maxLength: 255 },
          location:              { type: 'string', maxLength: 255 },
          experience_required:   { type: 'string', maxLength: 100 },
          salary_range:          { type: 'string', maxLength: 100 },
          description:           { type: 'string', maxLength: 5000 },
          skills:                { type: 'array', items: { type: 'string' } },
          referral_reward:       { type: 'string', maxLength: 100 },
          average_response_time: { type: 'string', maxLength: 50 },
          referral_strength:     { type: 'integer', minimum: 0, maximum: 100 },
          recruiter_job_id:      { type: 'integer' },
        },
      },
    },
  }, createReferralJob);

  // ── Apply for a referral (candidates only) ──
  fastify.post('/referrals/jobs/:id/apply', {
    ...candidateOnly,
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^\\d+$' } },
      },
      body: {
        type: 'object',
        properties: {
          message:      { type: 'string', maxLength: 2000 },
          resume_url:   { type: 'string', maxLength: 500 },
          linkedin_url: { type: 'string', maxLength: 500 },
        },
      },
    },
  }, applyReferral);

  // ── My sent referral requests (candidate) ──
  fastify.get('/referrals/my-requests', {
    ...candidateOnly,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          page:   { type: 'integer', minimum: 1 },
          limit:  { type: 'integer', minimum: 1, maximum: 50 },
        },
      },
    },
  }, getMyReferralRequests);

  // ── Received referral requests (referrer) ──
  fastify.get('/referrals/received', {
    ...authAny,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          page:   { type: 'integer', minimum: 1 },
          limit:  { type: 'integer', minimum: 1, maximum: 50 },
        },
      },
    },
  }, getReceivedReferrals);

  // ── Update referral status ──
  fastify.patch('/referrals/request/:id/status', {
    ...authAny,
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^\\d+$' } },
      },
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['accepted', 'rejected', 'referred', 'interview', 'hired', 'paid', 'applied'],
          },
          notes:      { type: 'string', maxLength: 2000 },
          apply_link: { type: 'string', maxLength: 1000 },
        },
      },
    },
  }, updateReferralStatus);

  // ── Referral dashboard ──
  fastify.get('/referrals/dashboard', authAny, getReferralDashboard);
}
