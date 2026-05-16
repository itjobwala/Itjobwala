import { Model } from 'objection';
import User from './User.js';
import Job from './Job.js';

class Application extends Model {
  static get tableName() {
    return 'applications';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['job_id', 'user_id', 'status'],
      properties: {
        id: { type: 'integer' },
        job_id: { type: 'integer' },
        user_id: { type: 'integer' },
        resume_url: { type: ['string', 'null'], maxLength: 255 },
        status: { type: 'string', enum: ['applied', 'shortlisted', 'interview', 'rejected', 'selected', 'withdrawn', 'offer', 'hired'] },
        cover_letter: { type: ['string', 'null'] },
        expected_salary: { type: ['integer', 'null'] },
        notice_period_days: { type: ['integer', 'null'] },
        answers: { type: ['array', 'object', 'null'] },
        timeline: { type: ['array', 'object', 'null'] }
      }
    };
  }

  // Relations to User and Job
  static get relationMappings() {
    return {
      applicant: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'applications.user_id',
          to: 'users.id'
        }
      },
      job: {
        relation: Model.BelongsToOneRelation,
        modelClass: Job,
        join: {
          from: 'applications.job_id',
          to: 'jobs.id'
        }
      }
    };
  }
}

export default Application;
