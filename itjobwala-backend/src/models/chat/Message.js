import { Model }      from 'objection';
import Conversation   from './Conversation.js';

class Message extends Model {
  static get tableName() {
    return 'messages';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['conversation_id', 'sender_id', 'sender_role', 'message'],
      properties: {
        id:              { type: 'integer' },
        conversation_id: { type: 'integer' },
        sender_id:       { type: 'integer' },
        sender_role:     { type: 'string', enum: ['candidate', 'recruiter'] },
        message:         { type: 'string', minLength: 1 },
        message_type:    { type: 'string', enum: ['text', 'file', 'system'] },
        is_read:         { type: 'boolean' },
        created_at:      { type: ['string', 'null'] },
      },
    };
  }

  static get relationMappings() {
    return {
      conversation: {
        relation: Model.BelongsToOneRelation,
        modelClass: Conversation,
        join: { from: 'messages.conversation_id', to: 'conversations.id' },
      },
    };
  }
}

export default Message;
