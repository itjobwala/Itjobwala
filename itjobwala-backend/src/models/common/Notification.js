import { Model } from 'objection';

class Notification extends Model {
  static get tableName() {
    return 'notifications';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['type', 'title', 'message'],
      properties: {
        id: { type: 'integer' },
        candidate_id: { type: ['integer', 'null'] },
        recruiter_id: { type: ['integer', 'null'] },
        type: { type: 'string', maxLength: 50 },
        title: { type: 'string', maxLength: 255 },
        message: { type: 'string' },
        action_url: { type: ['string', 'null'], maxLength: 500 },
        is_read: { type: 'boolean' },
        metadata: { type: ['object', 'null'] }
      }
    };
  }
}

export default Notification;
