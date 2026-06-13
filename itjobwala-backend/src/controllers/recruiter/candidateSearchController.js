import User from '../../models/candidate/User.js';
import ProfileView from '../../models/recruiter/ProfileView.js';

// Safe list fields — NO email, NO mobile
function formatCandidateCard(row) {
  const skills = typeof row.skills === 'string' ? JSON.parse(row.skills) : (row.skills ?? []);
  return {
    id:               `candidate_${row.id}`,
    name:             row.full_name,
    title:            row.title ?? null,
    location:         row.location ?? null,
    experience_years: row.experience_years ?? 0,
    skills,
    open_to_work:     row.open_to_work ?? false,
    profile_photo_url: row.profile_photo_url ?? null,
    qa_specialization: row.qa_specialization ?? null,
    qa_seniority:      row.qa_seniority ?? null,
    qa_match_score:    row.qa_match_score != null ? Number(row.qa_match_score) : null,
  };
}

// Safe detail fields — NO email, NO mobile
function formatCandidateDetail(row) {
  const base = formatCandidateCard(row);
  return {
    ...base,
    about:              row.about ?? null,
    work_status:        row.work_status ?? null,
    availability_to_join: row.availability_to_join ?? null,
    linked_in:          row.linked_in ?? null,
    github:             row.github ?? null,
    profile_completion: row.profile_completion ?? 0,
    // Resume insight extras (safe — no PII)
    career_level:       row.career_level ?? null,
    ats_score:          row.ats_score != null ? Number(row.ats_score) : null,
    capability_score:   row.capability_score != null ? Number(row.capability_score) : null,
    strengths:          row.strengths ?? null,
    weaknesses:         row.weaknesses ?? null,
    recruiter_insights: row.recruiter_insights ?? null,
    qa_score_breakdown: row.qa_score_breakdown ?? null,
  };
}

function buildBaseQuery(knex) {
  return knex('users as u')
    .join('candidate_recruiter_visibility as crv', 'crv.user_id', 'u.id')
    .leftJoin(
      // Latest resume insight per candidate (DISTINCT ON is PostgreSQL-native)
      knex.raw(`(
        SELECT DISTINCT ON (candidate_id)
          candidate_id,
          qa_specialization, qa_seniority, qa_match_score,
          career_level, ats_score, capability_score,
          strengths, weaknesses, recruiter_insights, qa_score_breakdown
        FROM resume_insights
        ORDER BY candidate_id, last_parsed_at DESC NULLS LAST, created_at DESC
      ) AS ri`),
      'ri.candidate_id', 'u.id'
    )
    // ── Privacy gate (enforced in SQL) ───────────────────────────────────────
    .where('crv.recruiter_visible', true)
    .where('u.is_active', true);
}

export const searchCandidates = async (request, reply) => {
  const {
    q,
    skills: skillsParam,
    location,
    experience_min,
    experience_max,
    qa_specialization,
    qa_seniority,
    min_qa_score,
    open_to_work,
    sort   = 'relevance',
    page   = '1',
    limit  = '10',
  } = request.query;

  const pageIndex = Math.max(0, parseInt(page, 10) - 1);
  const pageSize  = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const knex      = User.knex();

  try {
    let query = buildBaseQuery(knex)
      .select(
        'u.id', 'u.full_name', 'u.title', 'u.location',
        'u.experience_years', 'u.skills', 'u.open_to_work', 'u.profile_photo_url',
        'ri.qa_specialization', 'ri.qa_seniority', 'ri.qa_match_score'
      );

    // ── Filters ──────────────────────────────────────────────────────────────
    if (q) {
      const like = `%${q}%`;
      query = query.whereRaw('(u.title ILIKE ? OR u.about ILIKE ?)', [like, like]);
    }

    if (skillsParam) {
      const skillList = skillsParam.split(',').map(s => s.trim()).filter(Boolean);
      for (const skill of skillList) {
        // AND semantics: candidate must have every listed skill (case-insensitive)
        query = query.whereRaw(
          `EXISTS (SELECT 1 FROM jsonb_array_elements_text(u.skills) AS s WHERE s ILIKE ?)`,
          [skill]
        );
      }
    }

    if (location) {
      query = query.whereRaw('u.location ILIKE ?', [`%${location}%`]);
    }

    if (experience_min !== undefined && experience_min !== '') {
      query = query.where('u.experience_years', '>=', parseInt(experience_min, 10));
    }
    if (experience_max !== undefined && experience_max !== '') {
      query = query.where('u.experience_years', '<=', parseInt(experience_max, 10));
    }

    if (qa_specialization) {
      query = query.whereRaw('ri.qa_specialization ILIKE ?', [`%${qa_specialization}%`]);
    }
    if (qa_seniority) {
      query = query.whereRaw('ri.qa_seniority ILIKE ?', [qa_seniority]);
    }
    if (min_qa_score !== undefined && min_qa_score !== '') {
      query = query.where('ri.qa_match_score', '>=', parseInt(min_qa_score, 10));
    }

    if (open_to_work === 'true' || open_to_work === true) {
      query = query.where('u.open_to_work', true);
    }

    // ── Sort ─────────────────────────────────────────────────────────────────
    if (sort === 'experience') {
      query = query.orderBy('u.experience_years', 'desc').orderBy('u.id', 'desc');
    } else if (sort === 'recent') {
      query = query.orderBy('u.updated_at', 'desc').orderBy('u.id', 'desc');
    } else {
      // relevance: more complete profiles + actively looking first
      query = query.orderByRaw('u.profile_completion DESC, u.open_to_work DESC, u.id DESC');
    }

    // ── Count (same filters, no select/order) ─────────────────────────────
    const countRow = await query.clone()
      .clearSelect()
      .clearOrder()
      .count('u.id as count')
      .first();
    const total = parseInt(countRow?.count ?? '0', 10);

    // ── Page ─────────────────────────────────────────────────────────────────
    const rows = await query.limit(pageSize).offset(pageIndex * pageSize);

    return reply.status(200).send({
      success: true,
      message: 'Candidates fetched.',
      data: {
        candidates: rows.map(formatCandidateCard),
        pagination: {
          page:        pageIndex + 1,
          limit:       pageSize,
          total,
          pages:       Math.ceil(total / pageSize),
          hasNextPage: (pageIndex + 1) * pageSize < total,
          hasPrevPage: pageIndex > 0,
        },
      },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const getCandidateProfile = async (request, reply) => {
  const { candidate_id } = request.params;
  const recruiterId = request.user.id;

  const numericId = parseInt(candidate_id.replace('candidate_', ''), 10);
  if (!numericId || isNaN(numericId)) {
    return reply.status(400).send({ success: false, message: 'Invalid candidate ID' });
  }

  const knex = User.knex();

  try {
    const row = await buildBaseQuery(knex)
      .select(
        'u.id', 'u.full_name', 'u.title', 'u.location',
        'u.experience_years', 'u.skills', 'u.open_to_work', 'u.profile_photo_url',
        'u.about', 'u.work_status', 'u.availability_to_join',
        'u.linked_in', 'u.github', 'u.profile_completion',
        'ri.qa_specialization', 'ri.qa_seniority', 'ri.qa_match_score',
        'ri.career_level', 'ri.ats_score', 'ri.capability_score',
        'ri.strengths', 'ri.weaknesses', 'ri.recruiter_insights', 'ri.qa_score_breakdown'
      )
      .where('u.id', numericId)
      .first();

    if (!row) {
      return reply.status(404).send({ success: false, message: 'Candidate not found or not visible' });
    }

    // ── Record profile view — one per recruiter+candidate+day ────────────────
    const today = new Date().toISOString().split('T')[0];
    ProfileView.knex().raw(
      `INSERT INTO profile_views (candidate_user_id, recruiter_id, viewed_date)
       VALUES (?, ?, ?)
       ON CONFLICT (candidate_user_id, recruiter_id, viewed_date) DO NOTHING`,
      [numericId, recruiterId, today]
    ).catch(() => {}); // fire-and-forget; never block the response

    return reply.status(200).send({
      success: true,
      message: 'Candidate profile fetched.',
      data: formatCandidateDetail(row),
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
