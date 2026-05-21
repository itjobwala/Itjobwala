import { getSearchSuggestions, searchCompanies } from '../../controllers/common/searchController.js';

export default async function searchRoutes(fastify, options) {
  fastify.get('/search/suggestions', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' }
        }
      }
    }
  }, getSearchSuggestions);

  fastify.get('/search/companies', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          industry: { type: 'string' },
          size: { type: 'string' },
          page: { type: 'integer', minimum: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 50 }
        }
      }
    }
  }, searchCompanies);
}
