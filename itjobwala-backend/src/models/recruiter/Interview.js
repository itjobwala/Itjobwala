import { Model } from 'objection';

class Interview extends Model {
  static get tableName() {
    return 'interviews';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['application_id', 'recruiter_id', 'interview_type', 'scheduled_at'],
      properties: {
        id: { type: 'integer' },
        application_id: { type: 'integer' },
        recruiter_id: { type: 'integer' },
        interview_type: { type: 'string', maxLength: 50 },
        scheduled_at: { type: 'string' },
        duration_minutes: { type: ['integer', 'null'] },
        meeting_link: { type: ['string', 'null'], maxLength: 500 },
        location: { type: ['string', 'null'], maxLength: 200 },
        note: { type: ['string', 'null'] }
      }
    };
  }
}

export default Interview;
