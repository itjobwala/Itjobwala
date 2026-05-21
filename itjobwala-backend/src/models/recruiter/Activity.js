import { Model } from 'objection';

class Activity extends Model {
  static get tableName() {
    return 'activities';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['recruiter_id', 'type', 'message'],
      properties: {
        id: { type: 'integer' },
        recruiter_id: { type: 'integer' },
        type: { type: 'string', maxLength: 50 },
        message: { type: 'string' },
        entity_id: { type: ['string', 'null'], maxLength: 50 },
        entity_type: { type: ['string', 'null'], maxLength: 50 }
      }
    };
  }
}

export default Activity;
