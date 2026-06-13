import Report from '../../models/common/Report.js';
import knex from '../../config/db.js';
import { sanitizeText } from '../../utils/sanitize.js';

// Rate-limit window: max 5 reports per reporter per hour
const RATE_LIMIT_WINDOW_MS  = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REPORTS = 5;

// ── POST /api/reports ─────────────────────────────────────────────────────────
export const submitReport = async (request, reply) => {
  const reporterId = request.user.id;
  const { target_type, target_id, reason, details } = request.body;

  try {
    // Rate-limit: count reports from this user in the last hour
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const [{ recent }] = await knex('reports')
      .where('reporter_id', reporterId)
      .where('created_at', '>=', windowStart)
      .count('id as recent');

    if (Number(recent) >= RATE_LIMIT_MAX_REPORTS) {
      return reply.status(429).send({
        success: false,
        message: 'You have submitted too many reports recently. Please try again later.',
      });
    }

    // De-duplicate: one open report per (reporter, target_type, target_id)
    const existing = await knex('reports')
      .where({ reporter_id: reporterId, target_type, target_id, status: 'open' })
      .first();

    if (existing) {
      return reply.status(409).send({
        success: false,
        message: 'You have already filed an open report for this item.',
      });
    }

    const report = await Report.query().insertAndFetch({
      reporter_id: reporterId,
      target_type,
      target_id,
      reason: sanitizeText(reason),
      details: details ? sanitizeText(details) : null,
    });

    return reply.status(201).send({
      success: true,
      message: 'Report submitted. Our team will review it shortly.',
      data: { id: report.id },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
