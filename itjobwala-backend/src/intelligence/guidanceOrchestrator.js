/**
 * guidanceOrchestrator.js
 * Orchestrates all 8 guidance engines and returns a combined guidance object.
 * Called after ATS scoring is complete. Pure function — no DB or external calls.
 */

import { rankImprovementPriorities }   from './guidance/improvementPriority.js';
import { generateScoreExplanation }    from './guidance/scoreExplanation.js';
import { generateCareerRoadmap }       from './guidance/careerRoadmap.js';
import { computeRecruiterReadiness }   from './guidance/recruiterReadiness.js';
import { generateImprovementImpacts }  from './guidance/improvementImpact.js';
import { generateSpecializationGuidance } from './guidance/specializationGuidance.js';
import { generateRecruiterInsights }   from './guidance/recruiterInsights.js';
import { generateActionPlan }          from './guidance/actionPlanGenerator.js';
import { simulateFirstImpression }     from './recruiter/firstImpressionSimulator.js';

/**
 * @param {object} intelligence - Full output of intelligenceAdapter.analyzeQaResume
 * @param {string[]} missingSkills - From ATS scoring (missing_skills array)
 * @param {number} experienceYears - Parsed from resume
 * @returns {object} Combined guidance object with 8 named sections
 */
export function runGuidanceOrchestrator({ intelligence, missingSkills = [], experienceYears = 0 }) {
  const {
    qa_match_score        = 0,
    qa_score_breakdown    = {},
    qa_specialization     = 'manual_qa',
    qa_seniority          = 'junior',
    career_level          = 'junior',
    recruiter_confidence  = 'medium',
    strengths             = [],
    weaknesses            = [],
    // Evidence intelligence — coaching is now evidence-aware
    evidence_profile      = null,
    skill_evidence        = [],
    weak_evidence_skills  = [],
    // Phase 4
    risk_flags            = [],
    trajectory_profile    = null,
    authenticity_profile  = null,
    trust_breakdown       = null,
  } = intelligence;

  // 1. Improvement priorities — what to add next
  const improvement_priorities = rankImprovementPriorities({
    missingSkills,
    qa_specialization,
    qa_seniority,
    qa_score_breakdown,
  });

  // 2. Score explanation — WHY the score is what it is (now evidence-aware)
  const score_explanations = generateScoreExplanation({
    qa_score_breakdown,
    qa_match_score,
    strengths,
    weaknesses,
    weak_evidence_skills,
    evidence_profile,
  });

  // 3. Career roadmap — where to go next
  const career_roadmap = generateCareerRoadmap({
    qa_specialization,
    qa_seniority,
    qa_score_breakdown,
    missing_skills: missingSkills,
  });

  // 4. Recruiter readiness — backend-computed metric cards (now evidence-aware)
  const recruiter_readiness = computeRecruiterReadiness({
    recruiter_confidence,
    qa_specialization,
    qa_seniority,
    career_level,
    qa_match_score,
    qa_score_breakdown,
    experienceYears,
    evidence_profile,
  });

  // 5. Improvement impacts — score gain per skill
  const improvement_impacts = generateImprovementImpacts({
    improvement_priorities,
    qa_score_breakdown,
  });

  // 6. Specialization transition guidance
  const specialization_guidance = generateSpecializationGuidance({
    qa_specialization,
    qa_score_breakdown,
    qa_seniority,
  });

  // 7. Recruiter insights — recruiter-perspective coaching (now evidence-aware)
  const recruiter_insights = generateRecruiterInsights({
    qa_specialization,
    recruiter_confidence,
    qa_match_score,
    qa_seniority,
    career_level,
    qa_score_breakdown,
    experienceYears,
    weak_evidence_skills,
    evidence_profile,
  });

  // 8. Action plan — 30/60/90 day execution plan (now evidence-aware)
  const action_plan = generateActionPlan({
    qa_specialization,
    qa_seniority,
    improvement_priorities,
    weak_evidence_skills,
  });

  // Fix 8: Recommendation mode (confidence-aware)
  const recommendation_mode =
    recruiter_confidence === 'very_low' || (evidence_profile?.recruiter_trust_score ?? 100) < 40
      ? 'credibility_building'
      : qa_match_score < 40
      ? 'capability_building'
      : 'specialization_building';

  // Fix 9: First impression simulation
  const first_impression = simulateFirstImpression({
    qa_match_score,
    recruiter_trust_score: evidence_profile?.recruiter_trust_score ?? null,
    evidence_strength:     evidence_profile?.evidence_strength ?? null,
    recruiter_confidence,
    qa_seniority,
    evidence_profile,
    risk_flags,
  });

  return {
    improvement_priorities,
    score_explanations,
    career_roadmap,
    recruiter_readiness,
    improvement_impacts,
    specialization_guidance,
    recruiter_insights,
    action_plan,
    recommendation_mode,
    first_impression,
  };
}
