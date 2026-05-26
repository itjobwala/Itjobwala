import { Model }   from 'objection';
import Message      from './Message.js';
import User         from '../candidate/User.js';
import Recruiter    from '../recruiter/Recruiter.js';

class Conversation extends Model {
  static get tableName() {
    return 'conversations';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['candidate_id', 'recruiter_id'],
      properties: {
        id:                  { type: 'integer' },
        candidate_id:        { type: 'integer' },
        recruiter_id:        { type: 'integer' },
        referral_request_id: { type: ['integer', 'null'] },
        last_message:        { type: ['string', 'null'] },
        last_message_at:     { type: ['string', 'null'] },
        created_at:          { type: ['string', 'null'] },
        updated_at:          { type: ['string', 'null'] },
      },
    };
  }

  static get relationMappings() {
    return {
      messages: {
        relation: Model.HasManyRelation,
        modelClass: Message,
        join: { from: 'conversations.id', to: 'messages.conversation_id' },
      },
      candidate: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: { from: 'conversations.candidate_id', to: 'users.id' },
      },
      recruiter: {
        relation: Model.BelongsToOneRelation,
        modelClass: Recruiter,
        join: { from: 'conversations.recruiter_id', to: 'recruiters.id' },
      },
    };
  }
}

export default Conversation;
