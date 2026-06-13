import { getCandidateHiringSignals } from '../../services/resume/feedbackSignal.service.js';

/**
 * GET /resume/hiring-signals
 *
 * Returns anonymized recruiter hiring decisions + computed insights.
 * Candidate-only — no recruiter identities exposed.
 */
export const getResumeHiringSignalsHandler = async (request, reply) => {
  const candidateId = request.user.id;

  const data = await getCandidateHiringSignals(candidateId);

  return reply.send({
    success: true,
    message: 'Hiring signals loaded.',
    data,
  });
};
