import { getVersionHistoryWithProgress } from '../../services/resume/versionHistory.service.js';

/**
 * GET /resume/progress
 *
 * Returns version history snapshots + computed progress metrics.
 * Returns { versions: [], progress: null } if never analyzed.
 */
export const getResumeProgressHandler = async (request, reply) => {
  const candidateId = request.user.id;

  const data = await getVersionHistoryWithProgress(candidateId);

  return reply.send({
    success: true,
    message: 'Resume progress loaded.',
    data,
  });
};
