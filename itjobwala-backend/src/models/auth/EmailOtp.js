import { Model } from 'objection';

class EmailOtp extends Model {
  static get tableName() {
    return 'email_otps';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'role', 'otp_hash', 'expires_at', 'last_sent_at'],
      properties: {
        id:           { type: 'integer' },
        email:        { type: 'string', maxLength: 255 },
        role:         { type: 'string', enum: ['candidate', 'recruiter'] },
        purpose:      { type: 'string', enum: ['signup', 'reset'], default: 'signup' },
        otp_hash:     { type: 'string' },
        expires_at:   { type: 'string' },
        attempts:     { type: 'integer', default: 0 },
        last_sent_at: { type: 'string' },
        created_at:   { type: 'string' },
      },
    };
  }
}

export default EmailOtp;
