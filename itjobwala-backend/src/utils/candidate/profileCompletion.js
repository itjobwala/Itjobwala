import User from '../../models/candidate/User.js';

const TOTAL_FIELDS = 6;

/**
 * The single definition of "profile completion" for a candidate's platform
 * profile (resume, experience, skills, photo, education, LinkedIn — each
 * weighted equally). Distinct from resume_insights.profile_completion_score,
 * which measures parsed-résumé-content completeness, not platform profile state.
 *
 * @param {object} user - must have experience/education relations loaded.
 */
export function computeProfileCompletion(user) {
  const skills = typeof user.skills === 'string' ? JSON.parse(user.skills) : (user.skills || []);

  const breakdown = {
    resume:     !!user.resume_url,
    experience: !!(user.experience && user.experience.length > 0),
    skills:     !!(skills && skills.length > 0),
    photo:      !!user.profile_photo_url,
    education:  !!(user.education && user.education.length > 0),
    linked_in:  !!(user.linked_in && user.linked_in !== ''),
  };

  const completed_count = Object.values(breakdown).filter(Boolean).length;
  const percentage = Math.round((completed_count / TOTAL_FIELDS) * 100);

  return { percentage, completed_count, total_count: TOTAL_FIELDS, breakdown };
}

/**
 * Recomputes and persists users.profile_completion so recruiter search
 * (ORDER BY u.profile_completion), the recruiter candidate drawer, and admin
 * views reflect real data instead of the column's default of 0.
 * Call this after any mutation to one of the 6 tracked fields.
 */
export async function syncProfileCompletion(userId) {
  const user = await User.query().findById(userId).withGraphFetched('[experience, education]');
  if (!user) return null;

  const result = computeProfileCompletion(user);
  await User.query().findById(userId).patch({ profile_completion: result.percentage });
  return result;
}
