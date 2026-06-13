import { Model } from 'objection';

export default class ResumeVersionHistory extends Model {
  static get tableName() { return 'resume_version_history'; }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['candidate_id'],
      properties: {
        id:                       { type: 'integer' },
        candidate_id:             { type: 'integer' },
        version_number:           { type: 'integer' },
        qa_match_score:           { type: ['integer', 'null'] },
        profile_completion_score: { type: ['integer', 'null'] },
        qa_specialization:        { type: ['string', 'null'] },
        qa_seniority:             { type: ['string', 'null'] },
        recruiter_confidence:     { type: ['string', 'null'] },
        skills_count:             { type: ['integer', 'null'] },
        missing_count:            { type: ['integer', 'null'] },
        parsed_at:                { type: ['string', 'null'] },
      },
    };
  }
}
