import { getSkills, validateSkills } from '../../controllers/common/skillController.js';

export default async function skillRoutes(fastify, options) {
  // GET /api/skills?q=react&limit=8&category=Frontend
  fastify.get('/skills', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q:        { type: 'string', maxLength: 100 },
          limit:    { type: 'integer', minimum: 1, maximum: 20, default: 8 },
          category: { type: 'string', maxLength: 50 },
        },
      },
    },
  }, getSkills);

  // POST /api/skills/validate
  fastify.post('/skills/validate', {
    schema: {
      body: {
        type: 'object',
        required: ['skills'],
        properties: {
          skills: { type: 'array', items: { type: 'string' }, maxItems: 50 },
        },
      },
    },
  }, validateSkills);
}
