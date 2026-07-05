import SavedCandidate from '../../models/recruiter/SavedCandidate.js';
import User from '../../models/candidate/User.js';
import { sanitizeText } from '../../utils/sanitize.js';
import { buildBaseQuery, formatCandidateCard } from './candidateSearchController.js';

const MAX_PER_LIST = 200;

// ── GET /recruiter/talent-pool ────────────────────────────────────────────────
export const getTalentPool = async (request, reply) => {
  const recruiterId = request.user.id;
  const { list_name, page = '1', limit = '20' } = request.query;

  const pageIndex = Math.max(0, parseInt(page, 10) - 1);
  const pageSize  = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const knex      = User.knex();

  try {
    // Fetch list names for this recruiter (for UI dropdown)
    const listNameRows = await knex('saved_candidates')
      .distinct('list_name')
      .where('recruiter_id', recruiterId)
      .orderBy('list_name');
    const listNames = listNameRows.map(r => r.list_name);

    // Build the saved candidates query with visibility gate via LEFT JOIN
    // We LEFT JOIN the visibility gate so we can still return "not available" entries.
    const baseQ = knex('saved_candidates as sc')
      .join('users as u', 'u.id', 'sc.candidate_user_id')
      .leftJoin('candidate_recruiter_visibility as crv', 'crv.user_id', 'u.id')
      .leftJoin(
        knex.raw(`(
          SELECT DISTINCT ON (candidate_id)
            candidate_id,
            qa_specialization, qa_seniority, qa_match_score
          FROM resume_insights
          ORDER BY candidate_id, last_parsed_at DESC NULLS LAST, created_at DESC
        ) AS ri`),
        'ri.candidate_id', 'u.id'
      )
      .where('sc.recruiter_id', recruiterId);

    if (list_name) {
      baseQ.where('sc.list_name', list_name);
    }

    const countRow = await baseQ.clone()
      .clearSelect()
      .clearOrder()
      .count('sc.id as count')
      .first();
    const total = parseInt(countRow?.count ?? '0', 10);

    const rows = await baseQ
      .select(
        'sc.id as save_id',
        'sc.list_name',
        'sc.note',
        'sc.created_at as saved_at',
        'u.id',
        'u.full_name',
        'u.title',
        'u.location',
        'u.experience_years',
        'u.skills',
        'u.open_to_work',
        'u.profile_photo_url',
        'u.is_active',
        'crv.recruiter_visible',
        'ri.qa_specialization',
        'ri.qa_seniority',
        'ri.qa_match_score'
      )
      .orderBy('sc.created_at', 'desc')
      .limit(pageSize)
      .offset(pageIndex * pageSize);

    const candidates = rows.map(row => {
      const available = row.recruiter_visible === true && row.is_active === true;
      const card = available
        ? formatCandidateCard(row)
        : { id: `candidate_${row.id}`, available: false };

      return {
        save_id:   row.save_id,
        list_name: row.list_name,
        note:      row.note ?? null,
        saved_at:  row.saved_at,
        candidate: available ? { ...card, available: true } : card,
      };
    });

    return reply.status(200).send({
      success: true,
      message: 'Talent pool fetched.',
      data: {
        candidates,
        list_names: listNames,
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
  } catch (err) {
    request.server.log.error(err);
    return reply.status(500).send({ success: false, message: 'Internal server error.' });
  }
};

// ── POST /recruiter/talent-pool ───────────────────────────────────────────────
export const saveCandidate = async (request, reply) => {
  const recruiterId = request.user.id;
  const { candidate_id, list_name = 'Shortlist', note } = request.body;

  const numericId = parseInt(String(candidate_id).replace('candidate_', ''), 10);
  if (!numericId || isNaN(numericId)) {
    return reply.status(400).send({ success: false, message: 'Invalid candidate_id.' });
  }

  const knex = User.knex();

  try {
    // Verify candidate is currently visible (privacy gate)
    const visible = await buildBaseQuery(knex)
      .select('u.id')
      .where('u.id', numericId)
      .first();

    if (!visible) {
      return reply.status(404).send({ success: false, message: 'Candidate not found or not available.' });
    }

    // Cap per list
    const count = await SavedCandidate.query()
      .where('recruiter_id', recruiterId)
      .where('list_name', list_name)
      .resultSize();

    if (count >= MAX_PER_LIST) {
      return reply.status(400).send({
        success: false,
        message: `List "${list_name}" is full (max ${MAX_PER_LIST} candidates).`,
      });
    }

    const sanitizedNote     = note ? sanitizeText(String(note).trim()) : null;
    const sanitizedListName = sanitizeText(String(list_name).trim()) || 'Shortlist';

    const saved = await SavedCandidate.query().insertAndFetch({
      recruiter_id:      recruiterId,
      candidate_user_id: numericId,
      list_name:         sanitizedListName,
      note:              sanitizedNote,
    });

    return reply.status(201).send({
      success: true,
      message: 'Candidate saved to talent pool.',
      data: {
        save_id:   saved.id,
        candidate_id: `candidate_${numericId}`,
        list_name: saved.list_name,
        note:      saved.note,
        saved_at:  saved.created_at,
      },
    });
  } catch (err) {
    if (err.name === 'UniqueViolationError' || err.code === '23505') {
      return reply.status(409).send({
        success: false,
        message: 'Candidate is already in this list.',
      });
    }
    request.server.log.error(err);
    return reply.status(500).send({ success: false, message: 'Internal server error.' });
  }
};

// ── DELETE /recruiter/talent-pool/:candidate_id ───────────────────────────────
export const removeCandidate = async (request, reply) => {
  const recruiterId = request.user.id;
  const { candidate_id } = request.params;
  const { list_name } = request.query;

  const numericId = parseInt(String(candidate_id).replace('candidate_', ''), 10);
  if (!numericId || isNaN(numericId)) {
    return reply.status(400).send({ success: false, message: 'Invalid candidate_id.' });
  }

  try {
    let query = SavedCandidate.query()
      .delete()
      .where('recruiter_id', recruiterId)
      .where('candidate_user_id', numericId);

    if (list_name) {
      query = query.where('list_name', list_name);
    }

    const deleted = await query;

    if (deleted === 0) {
      return reply.status(404).send({ success: false, message: 'Saved candidate not found.' });
    }

    return reply.status(200).send({
      success: true,
      message: 'Candidate removed from talent pool.',
      data: null,
    });
  } catch (err) {
    request.server.log.error(err);
    return reply.status(500).send({ success: false, message: 'Internal server error.' });
  }
};
