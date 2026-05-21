import { Model } from 'objection';

class Skill extends Model {
  static get tableName() {
    return 'skills';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'name_lower'],
      properties: {
        id:          { type: 'integer' },
        name:        { type: 'string', minLength: 1, maxLength: 100 },
        name_lower:  { type: 'string', minLength: 1, maxLength: 100 },
        category:    { type: 'string', maxLength: 50 },
        usage_count: { type: 'integer', minimum: 0 },
        created_at:  { type: 'string' },
      },
    };
  }
}

export default Skill;
