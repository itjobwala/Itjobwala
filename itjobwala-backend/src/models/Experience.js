import { Model } from 'objection';

class Experience extends Model {
  static get tableName() {
    return 'experiences';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['company', 'role', 'employment_type', 'start_date', 'is_current'],
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        company: { type: 'string', minLength: 1, maxLength: 150 },
        company_logo: { type: ['string', 'null'] },
        role: { type: 'string', minLength: 1, maxLength: 150 },
        employment_type: { type: 'string', minLength: 1, maxLength: 50 },
        location: { type: ['string', 'null'] },
        start_date: { type: 'string', minLength: 1, maxLength: 20 },
        end_date: { type: ['string', 'null'] },
        is_current: { type: 'boolean' },
        description: { type: ['string', 'null'] },
        skills: { type: ['array', 'object', 'null'] }
      }
    };
  }
}

export default Experience;
