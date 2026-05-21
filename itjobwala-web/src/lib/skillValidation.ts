/**
 * Client-side format validation only.
 * Content validity (is "React" a real skill?) is enforced by the backend
 * via POST /api/skills/validate and by the suggestion UI — users should
 * pick from suggestions rather than type arbitrary strings.
 *
 * Returns an error message string if invalid, or null if the format is fine.
 */
export function validateSkill(raw: string): string | null {
  const skill = raw.trim();

  if (skill.length < 2) return 'Skill must be at least 2 characters';
  if (skill.length > 50) return 'Skill must be 50 characters or fewer';

  if (!/[a-zA-Z]/.test(skill)) return 'Skill must contain at least one letter';

  // Allow: letters, digits, spaces, and common tech punctuation . # + - / _
  if (!/^[a-zA-Z0-9.#+\-/_ ]+$/.test(skill)) {
    return 'Only letters, numbers, spaces, and . # + - / _ are allowed';
  }

  return null;
}
