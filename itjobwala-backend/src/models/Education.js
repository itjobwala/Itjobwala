import { Model } from 'objection';

class Education extends Model {
  static get tableName() {
    return 'education';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['institution', 'degree', 'field_of_study', 'start_date', 'is_current'],
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        institution: { type: 'string', minLength: 1, maxLength: 200 },
        degree: { type: 'string', minLength: 1, maxLength: 100 },
        field_of_study: { type: 'string', minLength: 1, maxLength: 200 },
        location: { type: ['string', 'null'], maxLength: 200 },
        start_date: { type: 'string', format: 'date' },
        end_date: { type: ['string', 'null'], format: 'date' },
        grade: { type: ['string', 'null'], maxLength: 50 },
        is_current: { type: 'boolean' }
      }
    };
  }
}

export default Education;
