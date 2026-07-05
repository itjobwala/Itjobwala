import { Model } from 'objection';

class JobView extends Model {
  static get tableName() {
    return 'job_views';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['job_id'],
      properties: {
        id:             { type: 'integer' },
        job_id:         { type: 'integer' },
        viewer_user_id: { type: ['integer', 'null'] },
        viewer_ip_hash: { type: ['string', 'null'], maxLength: 64 },
        viewed_date:    { type: 'string' },
        viewed_at:      { type: 'string' },
      }
    };
  }
}

export default JobView;
