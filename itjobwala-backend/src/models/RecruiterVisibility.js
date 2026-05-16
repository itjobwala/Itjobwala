import { Model } from 'objection';

class RecruiterVisibility extends Model {
  static get tableName() {
    return 'candidate_recruiter_visibility';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id'],
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        recruiter_visible: { type: 'boolean', default: true },
        open_to_job_types: { type: ['array', 'object', 'null'] },
        created_at: { type: 'string' },
        updated_at: { type: 'string' }
      }
    };
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}

export default RecruiterVisibility;
