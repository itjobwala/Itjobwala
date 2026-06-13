import { Model } from 'objection';

export default class RecruiterFeedbackSignal extends Model {
  static get tableName() { return 'recruiter_feedback_signals'; }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['candidate_id', 'job_id', 'recruiter_id', 'application_id', 'outcome'],
      properties: {
        id:               { type: 'integer' },
        candidate_id:     { type: 'integer' },
        job_id:           { type: 'integer' },
        recruiter_id:     { type: 'integer' },
        application_id:   { type: 'integer' },
        outcome:          { type: 'string', enum: ['shortlisted', 'interview', 'hired', 'rejected'] },
        qa_score_at_time: { type: ['integer', 'null'] },
        qa_specialization: { type: ['string', 'null'] },
        qa_seniority:     { type: ['string', 'null'] },
        feedback_note:    { type: ['string', 'null'] },
        created_at:       { type: ['string', 'null'] },
      },
    };
  }
}
