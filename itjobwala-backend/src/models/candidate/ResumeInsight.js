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
        qa_match_score:           { type: ['integer', 'null'], minimum: 0, maximum: 100 },
        capability_score:         { type: ['integer', 'null'], minimum: 0, maximum: 100 },
        qa_seniority:              { type: ['string', 'null'], maxLength: 20 },
        qa_hiring_label:           { type: ['string', 'null'], maxLength: 50 },
        qa_specialization:         { type: ['string', 'null'], maxLength: 30 },
        specialization_confidence: { type: ['integer', 'null'], minimum: 0, maximum: 100 },
        recruiter_confidence:      { type: ['string', 'null'], maxLength: 10 },
        career_level:              { type: ['string', 'null'], maxLength: 20 },
        profile_completion_score: { type: 'integer', minimum: 0, maximum: 100 },
        score_breakdown:          { type: ['object', 'null'] },
        qa_score_breakdown:       { type: ['object', 'null'] },
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
        eligible:                 { type: ['boolean', 'null'] },
        reason:                   { type: ['string', 'null'], maxLength: 30 },
        detected_domain:          { type: ['string', 'null'], maxLength: 30 },
        domain_confidence:        { type: ['integer', 'null'] },
        domain_label:             { type: ['string', 'null'], maxLength: 100 },
        candidate_location:       { type: ['string', 'null'], maxLength: 200 },
        skill_metadata:           { type: ['array',  'null'] },
        achievement_entries:      { type: ['array',  'null'] },
        // ── Guidance intelligence ─────────────────────────────────────────────
        improvement_priorities:   { type: ['object', 'null'] },
        score_explanations:       { type: ['object', 'null'] },
        career_roadmap:           { type: ['object', 'null'] },
        recruiter_readiness:      { type: ['object', 'null'] },
        improvement_impacts:      { type: ['array',  'null'] },
        specialization_guidance:  { type: ['object', 'null'] },
        recruiter_insights:       { type: ['object', 'null'] },
        action_plan:              { type: ['object', 'null'] },
        // ── Evidence intelligence ─────────────────────────────────────────────
        evidence_profile:         { type: ['object', 'null'] },
        skill_evidence:           { type: ['array',  'null'] },
        skill_timeline:           { type: ['object', 'null'] },
        weak_evidence_skills:     { type: ['array',  'null'] },
        recruiter_trust_score:    { type: ['integer', 'null'] },
        implementation_maturity:  { type: ['string',  'null'] },
        evidence_strength:        { type: ['string',  'null'] },
        experience_depth_level:   { type: ['string',  'null'] },
        keyword_stuffing_risk:    { type: ['string',  'null'] },
        evidence_multiplier:      { type: ['number',  'null'] },
        // ── Phase 4 + 5 intelligence ──────────────────────────────────────────
        trust_breakdown:          { type: ['object', 'null'] },
        skill_recency:            { type: ['object', 'null'] },
        recency_summary:          { type: ['object', 'null'] },
        authenticity_profile:     { type: ['object', 'null'] },
        risk_flags:               { type: ['array',  'null'] },
        overall_risk_score:       { type: ['integer','null'] },
        overall_risk_level:       { type: ['string', 'null'], maxLength: 10 },
        trajectory_profile:       { type: ['object', 'null'] },
        recommendation_mode:      { type: ['string', 'null'], maxLength: 30 },
        first_impression:         { type: ['object', 'null'] },
      },
    };
  }

  static get jsonAttributes() {
    return [
      'score_breakdown',
      'qa_score_breakdown',
      'extracted_skills',
      'missing_skills',
      'suggested_keywords',
      'strengths',
      'weaknesses',
      'suggestions',
      'contact_info',
      'experience_entries',
      'education_entries',
      'project_entries',
      'certification_entries',
      // Guidance intelligence
      'improvement_priorities',
      'score_explanations',
      'career_roadmap',
      'recruiter_readiness',
      'improvement_impacts',
      'specialization_guidance',
      'recruiter_insights',
      'action_plan',
      // Evidence intelligence
      'evidence_profile',
      'skill_evidence',
      'skill_timeline',
      'weak_evidence_skills',
      'skill_metadata',
      'achievement_entries',
      // Phase 4 + 5 intelligence
      'trust_breakdown',
      'skill_recency',
      'recency_summary',
      'authenticity_profile',
      'risk_flags',
      'trajectory_profile',
      'first_impression',
    ];
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
