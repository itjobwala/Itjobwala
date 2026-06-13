import { parseResume }                  from '../../controllers/resume/parseResume.js';
import { getResumeInsights }            from '../../controllers/resume/getResumeInsights.js';
import { matchResumeToJob }             from '../../controllers/resume/matchResumeToJob.js';
import { getJobFitAnalysis }            from '../../controllers/resume/getJobFitAnalysis.js';
import { getResumeProgressHandler }     from '../../controllers/resume/getResumeProgress.js';
import { getResumeHiringSignalsHandler } from '../../controllers/resume/getResumeHiringSignals.js';
import { getSemanticMatch }             from '../../controllers/resume/getSemanticMatch.js';
import { getBehavioralHireability }    from '../../controllers/resume/getBehavioralHireability.js';

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

  // ── Phase 4: Version history + progress tracking ──────────────────────────
  fastify.get('/resume/progress', candidateOnly, getResumeProgressHandler);

  // ── Phase 5: Recruiter hiring signals (anonymized) ────────────────────────
  fastify.get('/resume/hiring-signals', candidateOnly, getResumeHiringSignalsHandler);

  // ── Phase 1: Job-aware fit analysis (deep, contextual, separate score) ───
  fastify.get('/resume/job-fit/:jobId', {
    ...candidateOnly,
    schema: {
      params: {
        type: 'object',
        required: ['jobId'],
        properties: { jobId: { type: 'string', pattern: '^\\d+$' } },
      },
    },
  }, getJobFitAnalysis);

  // ── Phase 10: Behavioral Hireability Intelligence ─────────────────────────
  fastify.get('/resume/behavioral-hireability', candidateOnly, getBehavioralHireability);

  // ── Phase 9: Semantic embedding match ────────────────────────────────────
  fastify.get('/resume/semantic-match/:jobId', {
    ...candidateOnly,
    schema: {
      params: {
        type: 'object',
        required: ['jobId'],
        properties: { jobId: { type: 'string', pattern: '^\\d+$' } },
      },
    },
  }, getSemanticMatch);

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
