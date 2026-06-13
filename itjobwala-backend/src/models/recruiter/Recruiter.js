import { Model } from 'objection';
import Job from '../jobs/Job.js';

class Recruiter extends Model {
  static get tableName() {
    return 'recruiters';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['full_name', 'company_name', 'email', 'password', 'terms_accepted'],
      properties: {
        id: { type: 'integer' },
        full_name: { type: 'string', minLength: 2, maxLength: 255 },
        company_name: { type: 'string', minLength: 2, maxLength: 255 },
        email: { type: 'string', minLength: 1, maxLength: 255 },
        password:    { type: 'string', minLength: 6, maxLength: 255 },
        is_active:   { type: 'boolean', default: true },
        is_verified: { type: 'boolean', default: false },
      }
    };
  }

  static get relationMappings() {
    return {
      jobs: {
        relation: Model.HasManyRelation,
        modelClass: Job,
        join: {
          from: 'recruiters.id',
          to: 'jobs.recruiter_id'
        }
      }
    };
  }
}

export default Recruiter;
