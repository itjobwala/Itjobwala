import { Model } from 'objection';

class RefreshToken extends Model {
  static get tableName() {
    return 'refresh_tokens';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'role', 'token_hash', 'expires_at'],
      properties: {
        id:           { type: 'integer' },
        user_id:      { type: 'integer' },
        role:         { type: 'string', enum: ['candidate', 'recruiter', 'admin'] },
        token_hash:   { type: 'string', maxLength: 64 },
        expires_at:   { type: 'string' },
        created_at:   { type: 'string' },
        last_used_at: { type: ['string', 'null'] },
        revoked_at:   { type: ['string', 'null'] },
        ip_address:   { type: ['string', 'null'] },
        user_agent:   { type: ['string', 'null'] },
      },
    };
  }
}

export default RefreshToken;
