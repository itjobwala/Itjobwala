import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwtPlugin from './src/plugins/jwt.js';
import 'dotenv/config';

import multipart from '@fastify/multipart';
import indexRoutes from './src/routes/indexRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import recruiterRoutes from './src/routes/recruiterRoutes.js';
import jobRoutes from './src/routes/jobRoutes.js';
import candidateProfileRoutes from './src/routes/candidateProfileRoutes.js';
import applicationRoutes from './src/routes/applicationRoutes.js';

const fastify = Fastify({ logger: true });

// Register plugins
fastify.register(cors, {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
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

fastify.register(fastifyRateLimit, {
  max: 100, // global max 100 requests per minute
  timeWindow: '1 minute'
});

fastify.register(jwtPlugin);

import xss from 'xss';
fastify.addHook('preValidation', async (request, reply) => {
  if (request.body && typeof request.body === 'object') {
    for (let key in request.body) {
      if (typeof request.body[key] === 'string') {
        request.body[key] = xss(request.body[key]);
      }
    }
  }
});

// Register routes
fastify.register(indexRoutes);
fastify.register(userRoutes, { prefix: '/api' });
fastify.register(recruiterRoutes, { prefix: '/api' });
fastify.register(jobRoutes, { prefix: '/api' });
fastify.register(candidateProfileRoutes, { prefix: '/api' });
fastify.register(applicationRoutes, { prefix: '/api' });
fastify.register((await import('./src/routes/savedJobRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/recruiterDashboardRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/recruiterJobRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/recruiterApplicantRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/notificationRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/searchRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/companyRoutes.js')).default, { prefix: '/api' });
fastify.register((await import('./src/routes/homeRoutes.js')).default, { prefix: '/api' });

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
    const port = process.env.PORT || 4000;
    await fastify.listen({ port: port, host: '0.0.0.0' });
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
