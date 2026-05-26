import { Model } from 'objection';
import User      from './User.js';

class ResumeInsight extends Model {
  static get tableName() {
    return 'resume_insights';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['candidate_id'],
      properties: {
        id:                       { type: 'integer' },
        candidate_id:             { type: 'integer' },
        resume_url:               { type: ['string', 'null'], maxLength: 500 },
        parsed_text:              { type: ['string', 'null'] },
        ats_score:                { type: 'integer', minimum: 0, maximum: 100 },
        profile_completion_score: { type: 'integer', minimum: 0, maximum: 100 },
        score_breakdown:          { type: ['object', 'null'] },
        extracted_skills:         { type: ['array', 'null'] },
        missing_skills:           { type: ['array', 'null'] },
        suggested_keywords:       { type: ['array', 'null'] },
        strengths:                { type: ['array', 'null'] },
        weaknesses:               { type: ['array', 'null'] },
        suggestions:              { type: ['array', 'null'] },
        contact_info:             { type: ['object', 'null'] },
        experience_entries:       { type: ['array', 'null'] },
        education_entries:        { type: ['array', 'null'] },
        project_entries:          { type: ['array', 'null'] },
        certification_entries:    { type: ['array', 'null'] },
        experience_years:         { type: ['integer', 'null'] },
        total_skills_found:       { type: ['integer', 'null'] },
        word_count:               { type: ['integer', 'null'] },
        parse_version:            { type: ['string', 'null'] },
        last_parsed_at:           { type: ['string', 'null'] },
        created_at:               { type: ['string', 'null'] },
        updated_at:               { type: ['string', 'null'] },
      },
    };
  }

  static get relationMappings() {
    return {
      candidate: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: { from: 'resume_insights.candidate_id', to: 'users.id' },
      },
    };
  }
}

export default ResumeInsight;
