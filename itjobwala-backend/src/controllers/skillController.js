import Skill from '../models/Skill.js';
import knex from '../config/db.js';

/**
 * GET /api/skills?q=react&limit=8&category=Frontend
 * Public — no auth required.
 */
export async function getSkills(request, reply) {
  const { q = '', limit = 8, category } = request.query;

  let query = Skill.query()
    .select('id', 'name', 'category')
    .orderBy('usage_count', 'desc')
    .orderBy('name', 'asc')
    .limit(Math.min(Number(limit), 20));

  if (q.trim()) {
    query = query.where('name_lower', 'like', `${q.trim().toLowerCase()}%`)
      .union(
        Skill.query()
          .select('id', 'name', 'category')
          .where('name_lower', 'like', `%${q.trim().toLowerCase()}%`)
          .whereNot('name_lower', 'like', `${q.trim().toLowerCase()}%`)
          .orderBy('usage_count', 'desc')
          .orderBy('name', 'asc')
          .limit(Math.min(Number(limit), 20)),
        true,
      );
  }

  if (category) {
    query = query.where('category', category);
  }

  const skills = await query;

  // De-duplicate (union may produce dupes at boundary) and cap at limit
  const seen = new Set();
  const unique = [];
  for (const s of skills) {
    if (!seen.has(s.id)) { seen.add(s.id); unique.push(s); }
    if (unique.length >= Number(limit)) break;
  }

  return reply.send({ success: true, data: unique });
}

/**
 * POST /api/skills/validate
 * Body: { skills: string[] }
 * Returns the subset of skills that are NOT in the database.
 */
export async function validateSkills(request, reply) {
  const { skills } = request.body;

  if (!Array.isArray(skills) || skills.length === 0) {
    return reply.status(400).send({ success: false, message: 'skills array is required' });
  }

  const nameLowers = skills.map(s => s.toLowerCase());

  const found = await Skill.query()
    .select('name_lower')
    .whereIn('name_lower', nameLowers);

  const foundSet = new Set(found.map(s => s.name_lower));
  const invalid  = skills.filter(s => !foundSet.has(s.toLowerCase()));

  return reply.send({ success: true, data: { valid: invalid.length === 0, invalid } });
}

/**
 * Internal helper — call after a job or profile is saved to bump usage counts.
 */
export async function incrementSkillUsage(skillNames) {
  if (!skillNames || skillNames.length === 0) return;
  const nameLowers = skillNames.map(s => s.toLowerCase());
  await Skill.query()
    .patch({ usage_count: knex.raw('usage_count + 1') })
    .whereIn('name_lower', nameLowers);
}
