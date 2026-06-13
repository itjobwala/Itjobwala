import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import { env } from '../config/env.js';
import { verifyRefreshToken } from '../utils/tokenService.js';

export default fp(async function (fastify, opts) {
  // ── Cookie support ────────────────────────────────────────────────────────
  fastify.register(fastifyCookie);

  // ── Access token JWT (used by existing protected routes) ──────────────────
  // Existing routes call request.jwtVerify() / request.server.jwt.sign().
  // @fastify/jwt is kept as the default namespace so no existing code changes.
  fastify.register(fastifyJwt, {
    secret: env.accessTokenSecret,
  });

  // Normalize JWT payload so controllers can always read request.user.id
  // Old tokens:  { id: 123, role }        → already has .id
  // New tokens:  { sub: '123', role, type } → .sub must be mapped to .id
  function normalizeUser(request) {
    if (request.user.id === undefined && request.user.sub !== undefined) {
      request.user.id = Number(request.user.sub);
    }
  }

  // ── Middleware: verify any valid access token ─────────────────────────────
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
      if (request.user.type && request.user.type !== 'access') {
        return reply.status(401).send({ success: false, message: 'Invalid token type' });
      }
      normalizeUser(request);
    } catch (err) {
      reply.status(401).send({ success: false, message: 'Unauthorized access', error: err.message });
    }
  });

  // ── Middleware: recruiter-only routes ─────────────────────────────────────
  fastify.decorate('requireRecruiter', async function (request, reply) {
    try {
      await request.jwtVerify();
      if (request.user.type && request.user.type !== 'access') {
        return reply.status(401).send({ success: false, message: 'Invalid token type' });
      }
      if (request.user.role !== 'recruiter') {
        return reply.status(403).send({ success: false, message: 'Forbidden: Only recruiters can perform this action' });
      }
      normalizeUser(request);
    } catch (err) {
      reply.status(401).send({ success: false, message: 'Unauthorized access', error: err.message });
    }
  });

  // ── Middleware: candidate-only routes ─────────────────────────────────────
  // Explicitly require role === 'candidate' so admin/recruiter tokens are rejected.
  fastify.decorate('requireCandidate', async function (request, reply) {
    try {
      await request.jwtVerify();
      if (request.user.type && request.user.type !== 'access') {
        return reply.status(401).send({ success: false, message: 'Invalid token type' });
      }
      if (request.user.role !== 'candidate') {
        return reply.status(403).send({ success: false, message: 'Forbidden: Candidates only' });
      }
      normalizeUser(request);
    } catch (err) {
      reply.status(401).send({ success: false, message: 'Unauthorized access', error: err.message });
    }
  });

  // ── Middleware: admin-only routes ─────────────────────────────────────────
  fastify.decorate('requireAdmin', async function (request, reply) {
    try {
      await request.jwtVerify();
      if (request.user.type && request.user.type !== 'access') {
        return reply.status(401).send({ success: false, message: 'Invalid token type' });
      }
      if (request.user.role !== 'admin') {
        return reply.status(403).send({ success: false, message: 'Forbidden: Admin access required' });
      }
      normalizeUser(request);
    } catch (err) {
      reply.status(401).send({ success: false, message: 'Unauthorized access', error: err.message });
    }
  });

  // ── Middleware: refresh token validation (refresh endpoint ONLY) ──────────
  fastify.decorate('authenticateRefreshToken', async function (request, reply) {
    try {
      const rawToken = request.cookies?.refresh_token;
      if (!rawToken) {
        return reply.status(401).send({ success: false, message: 'No refresh token' });
      }
      const payload = verifyRefreshToken(rawToken);
      request.refreshPayload = payload;
      request.rawRefreshToken = rawToken;
    } catch (err) {
      reply.status(401).send({ success: false, message: 'Invalid or expired refresh token' });
    }
  });
});
