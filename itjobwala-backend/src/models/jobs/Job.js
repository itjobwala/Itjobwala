import { Model } from 'objection';
import Recruiter from '../recruiter/Recruiter.js';
import Application from './Application.js';

class Job extends Model {
  static get tableName() {
    return 'jobs';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['title', 'recruiter_id'],
      properties: {
        id: { type: 'integer' },
        recruiter_id: { type: 'integer' },
        title: { type: 'string', minLength: 1, maxLength: 255 },
        company_name: { type: 'string', maxLength: 255 },
        location: { type: 'string', maxLength: 255 },
        work_mode: { type: 'string', maxLength: 50 },
        job_type: { type: 'string', maxLength: 50 },
        category: { type: 'string', maxLength: 100 },
        salary_min: { type: 'integer' },
        salary_max: { type: 'integer' },
        experience_min: { type: 'integer' },
        experience_max: { type: 'integer' },
        skills: { type: ['array', 'object', 'null'] },
        responsibilities: { type: ['array', 'object', 'null'] },
        requirements: { type: ['array', 'object', 'null'] },
        benefits: { type: ['array', 'object', 'null'] },
        nice_to_have: { type: ['array', 'object', 'null'] },
        about_role: { type: ['string', 'null'] },
        job_level: { type: ['string', 'null'] },
        office_details: { type: ['string', 'null'] },
        status:            { type: 'string', default: 'draft' },
        moderation_reason: { type: ['string', 'null'] },
        auto_flags:        { type: ['array', 'object', 'null'] },
        reviewed_by:       { type: ['integer', 'null'] },
        reviewed_at:       { type: ['string', 'null'] },
        submitted_at:      { type: ['string', 'null'] },
      }
    };
  }

  static get relationMappings() {
    return {
      recruiter: {
        relation: Model.BelongsToOneRelation,
        modelClass: Recruiter,
        join: {
          from: 'jobs.recruiter_id',
          to: 'recruiters.id'
        }
      },
      applications: {
        relation: Model.HasManyRelation,
        modelClass: Application,
        join: {
          from: 'jobs.id',
          to: 'applications.job_id'
        }
      }
    };
  }
}

export default Job;
