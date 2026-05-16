import { Model } from 'objection';
import Job from './Job.js';
import User from './User.js';

class SavedJob extends Model {
  static get tableName() {
    return 'saved_jobs';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'job_id'],
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        job_id: { type: 'integer' },
        saved_at: { type: 'string' }
      }
    };
  }

  static get relationMappings() {
    return {
      job: {
        relation: Model.BelongsToOneRelation,
        modelClass: Job,
        join: {
          from: 'saved_jobs.job_id',
          to: 'jobs.id'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'saved_jobs.user_id',
          to: 'users.id'
        }
      }
    };
  }
}

export default SavedJob;
