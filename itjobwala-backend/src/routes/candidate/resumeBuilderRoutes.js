import {
  listResumes,
  createResume,
  getResume,
  updateResume,
  deleteResume,
  getPrefill,
} from '../../controllers/candidate/resumeBuilderController.js';

export default async function resumeBuilderRoutes(fastify) {
  const auth = { preValidation: [fastify.requireCandidate] };

  // prefill registered before /:id so the literal segment wins
  fastify.get('/candidate/resumes/prefill', auth, getPrefill);
  fastify.get('/candidate/resumes',         auth, listResumes);
  fastify.post('/candidate/resumes',        auth, createResume);
  fastify.get('/candidate/resumes/:id',     auth, getResume);
  fastify.put('/candidate/resumes/:id',     auth, updateResume);
  fastify.delete('/candidate/resumes/:id',  auth, deleteResume);
}
