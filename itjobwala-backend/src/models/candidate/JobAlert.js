import { Model } from 'objection';

class JobAlert extends Model {
  static get tableName() { return 'job_alerts'; }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'name', 'frequency'],
      properties: {
        id:          { type: 'integer' },
        user_id:     { type: 'integer' },
        name:        { type: 'string', minLength: 1, maxLength: 200 },
        criteria:    { type: 'object' },
        frequency:   { type: 'string', enum: ['instant', 'daily', 'weekly'] },
        is_active:   { type: 'boolean' },
        last_run_at: { type: ['string', 'null'] },
        created_at:  { type: 'string' },
        updated_at:  { type: 'string' },
      },
    };
  }

  static get jsonAttributes() {
    return ['criteria'];
  }
}

export default JobAlert;
