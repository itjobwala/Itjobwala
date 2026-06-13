import {
  getMyProfile,
  updateProfile,
  uploadResume,
  updateSkills,
  addExperience,
  updateExperience,
  deleteExperience,
  addEducation,
  updateEducation,
  deleteEducation,
  addCertification,
  updateCertification,
  deleteCertification,
  uploadProfilePhoto,
  uploadCertificate,
  uploadProfileCover,
  getProfileCompletion
} from '../../controllers/candidate/candidateProfileController.js';
import { getRecruiterVisibility, updateRecruiterVisibility } from '../../controllers/recruiter/recruiterVisibilityController.js';

export default async function candidateProfileRoutes(fastify, options) {
  // Pre-validation to ensure user is authenticated as candidate
  const authOpts = {
    preValidation: [fastify.requireCandidate]
  };

  // Recruiter Visibility endpoints
  fastify.get('/candidate/profile/recruiter-visibility', authOpts, getRecruiterVisibility);
  fastify.put('/candidate/profile/recruiter-visibility', authOpts, updateRecruiterVisibility);

  // Profile endpoints
  fastify.get('/candidate/profile/completion', authOpts, getProfileCompletion);
  fastify.get('/candidate/profile', authOpts, getMyProfile);

  fastify.put('/candidate/profile', {
    ...authOpts,
    schema: {
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          first_name: { type: ['string', 'null'], maxLength: 255 },
          last_name: { type: ['string', 'null'], maxLength: 255 },
          title: { type: ['string', 'null'], maxLength: 255 },
          email: { type: 'string', format: 'email', maxLength: 255 },
          phone: { type: ['string', 'null'], maxLength: 20 },
          location: { type: ['string', 'null'], maxLength: 150 },
          experience_years: { type: ['integer', 'number', 'null'] },
          current_salary: { type: ['string', 'number', 'null'] },
          expected_salary: { type: ['string', 'number', 'null'] },
          work_status: { type: ['string', 'null'] }, // Can be YYYY-MM-DD or fresher/experienced
          open_to_work: { type: 'boolean' },
          linked_in: { type: ['string', 'null'], maxLength: 255 },
          github: { type: ['string', 'null'], maxLength: 255 },
          resume_name: { type: ['string', 'null'] },
          about: { type: ['string', 'null'], maxLength: 2000 },
          availability_to_join: { type: ['string', 'null'] },
          career_profile: {
            type: ['object', 'null'],
            properties: {
              current_industry: { type: 'string', minLength: 1, maxLength: 255 },
              department: { type: 'string', minLength: 1, maxLength: 255 },
              role_category: { type: 'string', minLength: 1, maxLength: 255 },
              job_role: { type: 'string', minLength: 1, maxLength: 255 },
              desired_job_type: {
                type: ['string', 'null'],
                enum: ["Full-time", "Part-time", "Contract", "Internship", "Freelance", null]
              },
              desired_employment_type: {
                type: ['string', 'null'],
                enum: ["Permanent", "Temporary", "Contractual", null]
              },
              preferred_shift: {
                type: ['string', 'null'],
                enum: ["Day Shift", "Night Shift", "Flexible", null]
              },
              preferred_work_location: {
                anyOf: [
                  { type: 'string', enum: ["Remote", "On-site", "Hybrid"] },
                  { type: 'array', items: { type: 'string', enum: ["Remote", "On-site", "Hybrid"] } },
                  { type: 'null' }
                ]
              }
            }
          },
          personal_details: {
            type: ['object', 'null'],
            properties: {
              gender: { type: 'string', maxLength: 50 },
              marital_status: { type: 'string', maxLength: 50 },
              date_of_birth: { type: ['string', 'null'], format: 'date' },
              category: { type: 'string', maxLength: 100 },
              authorized_to_work_in_us: { type: ['boolean', 'null'] },
              work_permit_other_countries: { type: ['boolean', 'null'] },
              address: { type: 'string', maxLength: 500 },
              languages: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['id', 'name', 'proficiency', 'read', 'write', 'speak'],
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    proficiency: { type: 'string', enum: ['beginner', 'intermediate', 'fluent'] },
                    read: { type: 'boolean' },
                    write: { type: 'boolean' },
                    speak: { type: 'boolean' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, updateProfile);

  const uploadOpts = { ...authOpts, config: { rateLimit: { max: 10, timeWindow: '1 minute' } } };
  fastify.post('/candidate/profile/resume', uploadOpts, uploadResume);
  fastify.post('/candidate/profile/photo', uploadOpts, uploadProfilePhoto);
  fastify.post('/candidate/profile/cover', uploadOpts, uploadProfileCover);
  fastify.post('/candidate/profile/certifications/:cert_id/upload', uploadOpts, uploadCertificate);

  fastify.put('/candidate/profile/skills', {
    ...authOpts,
    schema: {
      body: {
        type: 'object',
        required: ['skills'],
        properties: {
          skills: {
            type: 'array',
            minItems: 1,
            maxItems: 30,
            items: { type: 'string', maxLength: 50 }
          }
        }
      }
    }
  }, updateSkills);

  const expSchema = {
    body: {
      type: 'object',
      required: ['company', 'role', 'employment_type', 'start_date', 'is_current'],
      properties: {
        company: { type: 'string', minLength: 1, maxLength: 150 },
        role: { type: 'string', minLength: 1, maxLength: 150 },
        employment_type: {
          type: 'string',
          enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'full-time', 'part-time', 'contract', 'internship', 'freelance']
        },
        location: { type: ['string', 'null'], maxLength: 150 },
        start_date: { type: 'string', format: 'date' },
        end_date: {
          anyOf: [
            { type: 'string', format: 'date' },
            { type: 'string', maxLength: 0 },
            { type: 'null' }
          ]
        },
        is_current: { type: 'boolean' },
        description: { type: ['string', 'null'], maxLength: 1000 },
        skills: {
          type: 'array',
          items: { type: 'string' }
        }
      },
      if: {
        properties: { is_current: { const: false } }
      },
      then: {
        required: ['end_date']
      }
    }
  };

  fastify.post('/candidate/profile/experience', { ...authOpts, schema: expSchema }, addExperience);
  fastify.put('/candidate/profile/experience/:exp_id', { ...authOpts, schema: expSchema }, updateExperience);
  fastify.delete('/candidate/profile/experience/:exp_id', authOpts, deleteExperience);

  const eduSchema = {
    body: {
      type: 'object',
      required: ['institution', 'degree', 'field_of_study', 'start_date', 'is_current'],
      properties: {
        institution: { type: 'string', minLength: 1, maxLength: 200 },
        degree: { type: 'string', minLength: 1, maxLength: 100 },
        field_of_study: { type: 'string', minLength: 1, maxLength: 200 },
        location: { type: ['string', 'null'], maxLength: 200 },
        start_date: { type: 'string', format: 'date' },
        end_date: {
          anyOf: [
            { type: 'string', format: 'date' },
            { type: 'string', maxLength: 0 },
            { type: 'null' }
          ]
        },
        grade: { type: ['string', 'null'], maxLength: 50 },
        is_current: { type: 'boolean' }
      },
      if: {
        properties: { is_current: { const: false } }
      },
      then: {
        required: ['end_date']
      }
    }
  };

  fastify.post('/candidate/profile/education', { ...authOpts, schema: eduSchema }, addEducation);
  fastify.put('/candidate/profile/education/:edu_id', { ...authOpts, schema: eduSchema }, updateEducation);
  fastify.delete('/candidate/profile/education/:edu_id', authOpts, deleteEducation);

  const certSchema = {
    body: {
      type: 'object',
      required: ['name', 'issuer', 'issue_date'],
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 255 },
        issuer: { type: 'string', minLength: 1, maxLength: 255 },
        issue_date: { type: 'string', format: 'date' },
        expiry_date: { type: ['string', 'null'] },
        credential_id: { type: 'string', maxLength: 100 },
        credential_url: { type: 'string' }
      }
    }
  };

  fastify.post('/candidate/profile/certifications', { ...authOpts, schema: certSchema }, addCertification);
  fastify.put('/candidate/profile/certifications/:cert_id', { ...authOpts, schema: certSchema }, updateCertification);
  fastify.delete('/candidate/profile/certifications/:cert_id', authOpts, deleteCertification);
}
