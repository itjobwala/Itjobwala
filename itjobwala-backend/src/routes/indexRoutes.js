import knex from '../config/db.js';

export default async function indexRoutes(fastify, options) {
  fastify.get('/', async (request, reply) => {
    return { hello: 'world', framework: 'fastify', app: 'itjobwala' };
  });

  fastify.get('/db-test', async (request, reply) => {
    try {
      const result = await knex.raw('SELECT NOW()');
      return { success: true, message: 'Database connected successfully via Knex', time: result.rows[0].now };
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ success: false, message: 'Database connection failed' });
    }
  });
}
