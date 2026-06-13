import { searchCandidates, getCandidateProfile } from '../../controllers/recruiter/candidateSearchController.js';

export default async function recruiterCandidateRoutes(fastify, options) {
  const preValidation = [fastify.requireRecruiter];

  const candidateIdSchema = {
    params: {
      type: 'object',
      required: ['candidate_id'],
      properties: {
        candidate_id: { type: 'string', pattern: '^candidate_\\d+$' },
      },
    },
  };

  // Static path must come before the parameterised route (belt-and-suspenders for find-my-way)
  fastify.get('/recruiter/candidates/search', { preValidation }, searchCandidates);
  fastify.get('/recruiter/candidates/:candidate_id', { preValidation, schema: candidateIdSchema }, getCandidateProfile);
}
