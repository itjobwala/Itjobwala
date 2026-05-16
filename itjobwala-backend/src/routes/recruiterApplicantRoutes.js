import { 
  getApplicants, 
  getApplicantById, 
  updateStatus, 
  shortlistApplicant, 
  rejectApplicant, 
  hireApplicant 
} from '../controllers/recruiterApplicantController.js';

export default async function recruiterApplicantRoutes(fastify, options) {
  const preValidation = [fastify.requireRecruiter];

  fastify.get('/recruiter/applicants', { preValidation }, getApplicants);
  fastify.get('/recruiter/applicants/:applicantId', { preValidation }, getApplicantById);
  fastify.put('/recruiter/applicants/:applicantId/status', { preValidation }, updateStatus);
  fastify.post('/recruiter/applicants/:applicantId/shortlist', { preValidation }, shortlistApplicant);
  fastify.post('/recruiter/applicants/:applicantId/reject', { preValidation }, rejectApplicant);
  fastify.post('/recruiter/applicants/:applicantId/hire', { preValidation }, hireApplicant);
}
