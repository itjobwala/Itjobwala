/**
 * learningPathGenerator.js
 * Phase 3: Generates an ordered, personalized learning path.
 *
 * Takes the candidate's improvement_priorities (already computed by guidance layer)
 * and enriches each skill with full learning content from skillLearningMap.
 * Orders by: difficulty (beginner first) + specialization relevance.
 */

import { getLearningData } from './skillLearningMap.js';

const DIFFICULTY_ORDER = { 'Beginner-Friendly': 0, 'Intermediate': 1, 'Advanced': 2 };

/**
 * @param {object} improvement_priorities - From guidanceOrchestrator ({ high_priority[], medium_priority[], low_priority[] })
 * @param {string} qa_specialization
 * @returns {LearningPathItem[]}
 */
export function generateLearningPath({ improvement_priorities = {}, qa_specialization = 'manual_qa' }) {
  const allSkills = [
    ...(improvement_priorities.high_priority   || []).map(s => ({ ...s, urgency: 'high'   })),
    ...(improvement_priorities.medium_priority || []).map(s => ({ ...s, urgency: 'medium' })),
    ...(improvement_priorities.low_priority    || []).map(s => ({ ...s, urgency: 'low'    })),
  ].slice(0, 10); // cap at 10 learning items

  const enriched = allSkills
    .map((item, index) => {
      const learning = getLearningData(item.skill);
      if (!learning) return null;

      return {
        order:             index + 1,
        skill:             item.skill,
        urgency:           item.urgency,
        dimension:         item.dimension,
        why_important:     learning.why_important,
        project_idea:      learning.project_idea,
        project_outcome:   learning.project_outcome,
        free_resource:     learning.free_resource,
        practice_site:     learning.practice_site,
        difficulty:        learning.difficulty,
        estimated_hours:   learning.estimated_hours,
        certification:     learning.certification,
        recruiter_impact:  learning.recruiter_impact,
        stack_tag:         learning.stack_tag,
        reason:            item.reason, // from improvementPriority
      };
    })
    .filter(Boolean);

  // Sort: high-urgency beginner skills first → then intermediate → then advanced
  enriched.sort((a, b) => {
    if (a.urgency !== b.urgency) {
      const URGENCY = { high: 0, medium: 1, low: 2 };
      return (URGENCY[a.urgency] ?? 1) - (URGENCY[b.urgency] ?? 1);
    }
    return (DIFFICULTY_ORDER[a.difficulty] ?? 1) - (DIFFICULTY_ORDER[b.difficulty] ?? 1);
  });

  // Re-number after sort
  return enriched.map((item, i) => ({ ...item, order: i + 1 }));
}

/**
 * Compute total learning investment for the path.
 */
export function computeLearningInvestment(learningPath) {
  const totalHours   = learningPath.reduce((sum, item) => sum + (item.estimated_hours ?? 0), 0);
  const weeklyHours  = 10; // assumed study commitment
  const weeks        = Math.ceil(totalHours / weeklyHours);

  return {
    total_hours:    totalHours,
    estimated_weeks: weeks,
    weekly_commitment: `${weeklyHours} hours/week`,
    summary: `${totalHours} hours of focused learning across ${learningPath.length} skills — approximately ${weeks} weeks at ${weeklyHours} hrs/week`,
  };
}
