import { Model }         from 'objection';
import ReferralRequest   from './ReferralRequest.js';

class ReferralJob extends Model {
  static get tableName() {
    return 'referral_jobs';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['company_name', 'job_title', 'referral_owner_id', 'referral_owner_role'],
      properties: {
        id:                    { type: 'integer' },
        recruiter_job_id:      { type: ['integer', 'null'] },
        company_name:          { type: 'string', minLength: 1, maxLength: 255 },
        job_title:             { type: 'string', minLength: 1, maxLength: 255 },
        location:              { type: ['string', 'null'], maxLength: 255 },
        experience_required:   { type: ['string', 'null'], maxLength: 100 },
        salary_range:          { type: ['string', 'null'], maxLength: 100 },
        description:           { type: ['string', 'null'] },
        skills:                { type: ['array', 'null'] },
        referral_owner_id:     { type: 'integer' },
        referral_owner_role:   { type: 'string', enum: ['candidate', 'recruiter'] },
        referral_reward:       { type: ['string', 'null'], maxLength: 100 },
        average_response_time: { type: ['string', 'null'], maxLength: 50 },
        referral_strength:     { type: ['integer', 'null'] },
        is_active:             { type: 'boolean' },
        created_at:            { type: ['string', 'null'] },
        updated_at:            { type: ['string', 'null'] },
      },
    };
  }

  static get relationMappings() {
    return {
      requests: {
        relation: Model.HasManyRelation,
        modelClass: ReferralRequest,
        join: { from: 'referral_jobs.id', to: 'referral_requests.referral_job_id' },
      },
    };
  }
}

export default ReferralJob;
