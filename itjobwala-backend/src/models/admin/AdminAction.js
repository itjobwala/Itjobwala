import { Model } from 'objection';

class AdminAction extends Model {
  static get tableName() {
    return 'admin_actions';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['admin_id', 'action', 'target_type', 'target_id'],
      properties: {
        id:          { type: 'integer' },
        admin_id:    { type: 'integer' },
        action:      { type: 'string', maxLength: 100 },
        target_type: { type: 'string', maxLength: 50 },
        target_id:   { type: 'integer' },
        note:        { type: ['string', 'null'] },
        created_at:  { type: 'string' },
      },
    };
  }
}

export default AdminAction;
