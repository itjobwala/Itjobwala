import { parseResume }       from '../../controllers/resume/parseResume.js';
import { getResumeInsights } from '../../controllers/resume/getResumeInsights.js';
import { matchResumeToJob }  from '../../controllers/resume/matchResumeToJob.js';

export default async function resumeRoutes(fastify) {
  const candidateOnly = { preValidation: [fastify.requireCandidate] };

  // ── Parse resume + run ATS analysis ──────────────────────────────────────
  fastify.post('/resume/parse', {
    ...candidateOnly,
    schema: {
      body: {
        type: 'object',
        properties: {
          resume_url: { type: 'string', maxLength: 500 },
        },
      },
    },
  }, parseResume);

  // ── Get stored insights ───────────────────────────────────────────────────
  fastify.get('/resume/insights', candidateOnly, getResumeInsights);

  // ── Match resume to a specific job ───────────────────────────────────────
  fastify.post('/resume/match-job/:jobId', {
    ...candidateOnly,
    schema: {
      params: {
        type: 'object',
        required: ['jobId'],
        properties: { jobId: { type: 'string', pattern: '^\\d+$' } },
      },
    },
  }, matchResumeToJob);
}
