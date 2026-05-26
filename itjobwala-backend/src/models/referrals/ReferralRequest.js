import { Model }    from 'objection';
import ReferralJob  from './ReferralJob.js';
import User         from '../candidate/User.js';

class ReferralRequest extends Model {
  static get tableName() {
    return 'referral_requests';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['referral_job_id', 'candidate_id', 'referrer_id', 'referrer_role'],
      properties: {
        id:              { type: 'integer' },
        referral_job_id: { type: 'integer' },
        candidate_id:    { type: 'integer' },
        referrer_id:     { type: 'integer' },
        referrer_role:   { type: 'string', enum: ['candidate', 'recruiter'] },
        message:         { type: ['string', 'null'] },
        resume_url:      { type: ['string', 'null'], maxLength: 500 },
        linkedin_url:    { type: ['string', 'null'], maxLength: 500 },
        status:          {
          type: 'string',
          enum: ['pending', 'accepted', 'rejected', 'referred', 'interview', 'hired', 'paid', 'applied'],
        },
        notes:           { type: ['string', 'null'] },
        apply_link:      { type: ['string', 'null'] },
        is_paid:         { type: 'boolean' },
        timeline:        { type: ['array', 'null'] },
        created_at:      { type: ['string', 'null'] },
        updated_at:      { type: ['string', 'null'] },
      },
    };
  }

  static get relationMappings() {
    return {
      referralJob: {
        relation: Model.BelongsToOneRelation,
        modelClass: ReferralJob,
        join: { from: 'referral_requests.referral_job_id', to: 'referral_jobs.id' },
      },
      candidate: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: { from: 'referral_requests.candidate_id', to: 'users.id' },
      },
    };
  }
}

export default ReferralRequest;
