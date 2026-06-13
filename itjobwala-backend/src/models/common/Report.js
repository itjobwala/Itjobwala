import { Model } from 'objection';

class Report extends Model {
  static get tableName() {
    return 'reports';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['reporter_id', 'target_type', 'target_id', 'reason'],
      properties: {
        id:              { type: 'integer' },
        reporter_id:     { type: 'integer' },
        target_type:     { type: 'string', enum: ['job', 'recruiter', 'user'] },
        target_id:       { type: 'integer' },
        reason:          { type: 'string', maxLength: 100 },
        details:         { type: ['string', 'null'] },
        status:          { type: 'string', default: 'open' },
        resolution_note: { type: ['string', 'null'] },
        resolved_by:     { type: ['integer', 'null'] },
        resolved_at:     { type: ['string', 'null'] },
      },
    };
  }
}

export default Report;
