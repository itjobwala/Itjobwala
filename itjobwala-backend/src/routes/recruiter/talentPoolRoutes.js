import { getTalentPool, saveCandidate, removeCandidate } from '../../controllers/recruiter/talentPoolController.js';

export default async function talentPoolRoutes(fastify, options) {
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

  const saveSchema = {
    body: {
      type: 'object',
      required: ['candidate_id'],
      properties: {
        candidate_id: { type: 'string', pattern: '^candidate_\\d+$' },
        list_name:    { type: 'string', minLength: 1, maxLength: 80 },
        note:         { type: 'string', maxLength: 500 },
      },
    },
  };

  fastify.get('/recruiter/talent-pool', { preValidation }, getTalentPool);
  fastify.post('/recruiter/talent-pool', { preValidation, schema: saveSchema }, saveCandidate);
  fastify.delete('/recruiter/talent-pool/:candidate_id', { preValidation, schema: candidateIdSchema }, removeCandidate);
}
