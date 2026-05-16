import { candidateRegister, candidateSignin } from '../controllers/userController.js';

const signupSchema = {
  schema: {
    body: {
      type: 'object',
      required: ['full_name', 'email', 'mobile', 'password', 'work_status', 'terms_accepted'],
      properties: {
        full_name: { type: 'string', minLength: 5 },
        email: { type: 'string', format: 'email' },
        mobile: { type: 'string', pattern: '^\\+91\\d{10}$' },
        password: { type: 'string', minLength: 6 },
        work_status: { type: 'string', enum: ['fresher', 'experienced'] },
        terms_accepted: { type: 'boolean', const: true }
      }
    }
  }
};

const signinSchema = {
  schema: {
    body: {
      type: 'object',
      required: ['password'],
      anyOf: [
        { required: ['email'] },
        { required: ['mobile'] }
      ],
      properties: {
        email: { type: 'string', format: 'email' },
        mobile: { type: 'string', pattern: '^\\+91\\d{10}$' },
        password: { type: 'string', minLength: 6 }
      }
    }
  }
};

export default async function userRoutes(fastify, options) {
  const authLimit = {
    rateLimit: {
      max: 5,
      timeWindow: '1 minute'
    }
  };

  fastify.post('/auth/candidate/signup', { schema: signupSchema.schema, config: authLimit }, candidateRegister);
  fastify.post('/auth/candidate/signin', { schema: signinSchema.schema, config: authLimit }, candidateSignin);
}
