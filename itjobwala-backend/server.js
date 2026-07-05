import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwtPlugin from './src/plugins/jwt.js';
import { env } from './src/config/env.js';
import { runCleanup } from './src/utils/cleanupJob.js';
import { runJobAlertMatcher } from './src/services/jobs/jobAlertMatcher.js';
import { initSocketServer } from './src/socket/index.js';

import multipart from '@fastify/multipart';
import indexRoutes from './src/routes/common/indexRoutes.js';
import userRoutes from './src/routes/candidate/userRoutes.js';
import recruiterRoutes from './src/routes/recruiter/recruiterRoutes.js';
import jobRoutes from './src/routes/jobs/jobRoutes.js';
import candidateProfileRoutes from './src/routes/candidate/candidateProfileRoutes.js';
import applicationRoutes from './src/routes/jobs/applicationRoutes.js';

// trustProxy lets Fastify read the real client IP from X-Forwarded-For when
// running behind a reverse proxy / CDN (Render, Cloudflare, nginx, etc.).
// Without this the rate-limiter would key on the proxy's IP, not the client's.
const fastify = Fastify({ logger: true, trustProxy: true });

// Register plugins
fastify.register(cors, {
  origin: env.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
});

fastify.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit as per contract
  }
});

import fastifyRateLimit from '@fastify/rate-limit';

let rateLimitRedis = null;
if (env.redisUrl) {
  const { default: Redis } = await import('ioredis');
  rateLimitRedis = new Redis(env.redisUrl, {
    // Fail fast so a Redis outage doesn't stall request handling
    connectTimeout: 2000,
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });
  rateLimitRedis.on('error', (err) => {
    fastify.log.error({ err }, '[rate-limit] Redis connection error');
  });
  await rateLimitRedis.connect();
  fastify.log.info('[rate-limit] Redis-backed distributed rate limiting active');
} else {
  fastify.log.info('[rate-limit] No REDIS_URL — using in-memory rate limiting (single instance only)');
}

fastify.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute',
  ...(rateLimitRedis ? { redis: rateLimitRedis } : {}),
});

fastify.register(jwtPlugin);

import { deepSanitize } from './src/utils/sanitize.js';
fastify.addHook('preValidation', async (request, _reply) => {
  if (request.body !== null && typeof request.body === 'object') {
    request.body = deepSanitize(request.body);
  }
});

// Register routes
fastify.register(indexRoutes);
fastify.register(userRoutes, { prefix: '/api' });
fastify.register(recruiterRoutes, { prefix: '/api' });
fastify.register(jobRoutes, { prefix: '/api' });
fastify.register(candidateProfileRoutes, { prefix: '/api' });
fastify.register((await import('./src/routes/candidate/candidateDashboardRoutes.js')).default, { prefix: '/api' });
fastify.register(applicationRoutes, { prefix: '/api' });
fastify.register((await import('./src/routes/jobs/savedJobRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/recruiter/recruiterDashboardRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/recruiter/recruiterJobRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/recruiter/recruiterApplicantRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/common/notificationRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/common/searchRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/recruiter/companyRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/common/homeRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/recruiter/recruiterInterviewRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/common/skillRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/auth/authRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/referrals/index.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/chat/index.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/resume/index.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/intelligence/index.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/candidate/resumeBuilderRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/admin/adminRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/reports/reportRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/recruiter/recruiterCandidateRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/recruiter/talentPoolRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/recruiter/bulkMessageRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/candidate/jobAlertRoutes.js')).default, { prefix: '/api' });

// Centralized Error Handler
fastify.setErrorHandler(function (error, request, reply) {
  this.log.error({ err: error, req: request.raw.url }, 'API Error occurred');

  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let errors = [];

  if (error.validation) {
    statusCode = 400;
    message = 'Validation Error';
    errors = error.validation.map(err => `${err.instancePath || 'Payload'} ${err.message}`);
  }

  if (error.code === '23505' || error.name === 'UniqueViolationError') {
    statusCode = 409;
    message = 'Resource already exists or duplicate detected.';
    errors = [error.detail || error.message];
  }

  if (error.code === '23502' || error.name === 'NotNullViolationError') {
    statusCode = 400;
    message = 'Missing required database field.';
    errors = [error.column ? `Field '${error.column}' cannot be null` : error.message];
  }

  reply.status(statusCode).send({
    success: false,
    message,
    data: {},
    errors
  });
});

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: env.port, host: '0.0.0.0' });
    fastify.log.info(`server listening on ${fastify.server.address().port}`);

    // Initialize Socket.IO after HTTP server is listening
    initSocketServer(fastify.server, fastify.log);

    // Run cleanup once on startup, then every 24 hours
    runCleanup(fastify.log);
    setInterval(() => runCleanup(fastify.log), 24 * 60 * 60 * 1000);

    // Run job alert matcher once on startup, then every 24 hours
    runJobAlertMatcher(fastify.log);
    setInterval(() => runJobAlertMatcher(fastify.log), 24 * 60 * 60 * 1000);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
