/**
 * learningIntelligenceEngine.js
 * Phase 3: Main orchestrator — combines learning path + certification advice.
 * Pure function, no DB/network calls.
 */

import { generateLearningPath, computeLearningInvestment } from './learningPathGenerator.js';
import { getCertificationAdvice }                          from './certificationAdvisor.js';

/**
 * @param {object|null} resumeInsight - DB row with improvement_priorities, qa_specialization, qa_seniority
 * @returns {LearningRecommendations}
 */
export function getLearningIntelligence(resumeInsight) {
  const qa_specialization      = resumeInsight?.qa_specialization      ?? 'manual_qa';
  const qa_seniority           = resumeInsight?.qa_seniority           ?? 'junior';
  const improvement_priorities = resumeInsight?.improvement_priorities ?? null;

  const learningPath = improvement_priorities
    ? generateLearningPath({ improvement_priorities, qa_specialization })
    : [];

  const learningInvestment = learningPath.length > 0
    ? computeLearningInvestment(learningPath)
    : {
        total_hours:       0,
        estimated_weeks:   0,
        weekly_commitment: '10 hours/week',
        summary:           'Re-analyze your resume to generate a personalized learning path.',
      };

  const certificationAdvice = getCertificationAdvice(qa_specialization, qa_seniority);

  return {
    learning_path:        learningPath,
    learning_investment:  learningInvestment,
    certification_advice: certificationAdvice,
    top_skill:            learningPath[0]?.skill ?? null,
    has_learning_data:    learningPath.length > 0,
  };
}
