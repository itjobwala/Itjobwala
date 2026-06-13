import { Model } from 'objection';

class ProfileView extends Model {
  static get tableName() {
    return 'profile_views';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['candidate_user_id', 'recruiter_id', 'viewed_date'],
      properties: {
        id:                { type: 'integer' },
        candidate_user_id: { type: 'integer' },
        recruiter_id:      { type: 'integer' },
        viewed_date:       { type: 'string' },
        created_at:        { type: ['string', 'null'] },
      }
    };
  }
}

export default ProfileView;
