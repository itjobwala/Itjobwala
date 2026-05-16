import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';

export default fp(async function (fastify, opts) {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'supersecret'
  });

  // Decorate the fastify instance with an authenticate middleware
  // You can use this in your routes as a preValidation hook
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ success: false, message: 'Unauthorized access', error: err.message });
    }
  });

  // Decorate the fastify instance with a role-based middleware for recruiters
  fastify.decorate('requireRecruiter', async function (request, reply) {
    try {
      await request.jwtVerify();
      if (request.user.role !== 'recruiter') {
        return reply.status(403).send({ success: false, message: 'Forbidden: Only recruiters can perform this action' });
      }
    } catch (err) {
      reply.status(401).send({ success: false, message: 'Unauthorized access', error: err.message });
    }
  });

  // Decorate the fastify instance with a role-based middleware for candidates
  fastify.decorate('requireCandidate', async function (request, reply) {
    try {
      await request.jwtVerify();
      if (request.user.role === 'recruiter') {
        return reply.status(403).send({ success: false, message: 'Forbidden: Recruiters cannot apply for jobs' });
      }
    } catch (err) {
      reply.status(401).send({ success: false, message: 'Unauthorized access', error: err.message });
    }
  });
});
