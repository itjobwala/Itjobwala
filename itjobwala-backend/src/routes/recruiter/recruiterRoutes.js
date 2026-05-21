import {
  recruiterSignup,
  recruiterSignin,
  getCompanyProfile,
  updateCompanyProfile,
  uploadCompanyLogo
} from '../../controllers/recruiter/recruiterController.js';

const recruiterSignupSchema = {
  schema: {
    body: {
      type: 'object',
      required: ['company_name', 'email', 'password', 'terms_accepted'],
      properties: {
        company_name: { type: 'string', minLength: 2 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 6 },
        terms_accepted: { type: 'boolean', const: true }
      }
    }
  }
};

const recruiterSigninSchema = {
  schema: {
    body: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 6 }
      }
    }
  }
};

export default async function recruiterRoutes(fastify, options) {
  const authLimit = {
    rateLimit: {
      max: 5,
      timeWindow: '1 minute'
    }
  };

  fastify.post('/auth/recruiter/signup', { schema: recruiterSignupSchema.schema, config: authLimit }, recruiterSignup);
  fastify.post('/auth/recruiter/signin', { schema: recruiterSigninSchema.schema, config: authLimit }, recruiterSignin);

  // Company Profile routes
  fastify.get('/recruiter/company', { preValidation: [fastify.requireRecruiter] }, getCompanyProfile);
  fastify.put('/recruiter/company', { preValidation: [fastify.requireRecruiter] }, updateCompanyProfile);
  fastify.post('/recruiter/company/logo', { preValidation: [fastify.requireRecruiter] }, uploadCompanyLogo);
}
