import {
  getApplicants,
  getApplicantById,
  updateStatus,
  shortlistApplicant,
  rejectApplicant,
  hireApplicant,
  submitFeedbackNote,
} from '../../controllers/recruiter/recruiterApplicantController.js';
import { getApplicantIntelligence } from '../../controllers/recruiter/getApplicantIntelligence.js';
import { getJobPoolStats }          from '../../controllers/recruiter/getJobPoolStats.js';

export default async function recruiterApplicantRoutes(fastify, options) {
  const preValidation = [fastify.requireRecruiter];

  fastify.get('/recruiter/applicants', { preValidation }, getApplicants);
  fastify.get('/recruiter/applicants/:applicantId', { preValidation }, getApplicantById);
  fastify.put('/recruiter/applicants/:applicantId/status', { preValidation }, updateStatus);
  fastify.post('/recruiter/applicants/:applicantId/shortlist', { preValidation }, shortlistApplicant);
  fastify.post('/recruiter/applicants/:applicantId/reject', { preValidation }, rejectApplicant);
  fastify.post('/recruiter/applicants/:applicantId/hire', { preValidation }, hireApplicant);

  // Phase 8: ATS intelligence for a specific applicant
  fastify.get('/recruiter/applicants/:applicantId/ats-intelligence', { preValidation }, getApplicantIntelligence);

  // Phase 8: Pool-level ATS stats for a job
  fastify.get('/recruiter/jobs/:jobId/pool-stats', { preValidation }, getJobPoolStats);

  // Phase 5: Optional constructive feedback note for the candidate
  fastify.post('/recruiter/applicants/:applicantId/feedback-note', {
    preValidation,
    schema: {
      body: {
        type: 'object',
        required: ['note'],
        properties: { note: { type: 'string', minLength: 5, maxLength: 500 } },
      },
    },
  }, submitFeedbackNote);
}
