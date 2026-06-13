import { Model } from 'objection';

class Admin extends Model {
  static get tableName() {
    return 'admins';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'password', 'full_name'],
      properties: {
        id:         { type: 'integer' },
        email:      { type: 'string', minLength: 1, maxLength: 255 },
        password:   { type: 'string', minLength: 1, maxLength: 255 },
        full_name:  { type: 'string', minLength: 1, maxLength: 255 },
        created_at: { type: 'string' },
        updated_at: { type: 'string' },
      },
    };
  }
}

export default Admin;
