import knex from '../../config/db.js';

function parseRangeDays(range) {
  const m = /^(\d+)d$/.exec(range ?? '30d');
  return m ? Math.min(Math.max(1, parseInt(m[1], 10)), 365) : 30;
}

function startOfRange(days) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - (days - 1));
  return d;
}

/**
 * Zero-fill a daily time series between startDate and (startDate + days - 1).
 * `rows` is the raw DB result; each row must have a `day` field (YYYY-MM-DD string).
 * `fields` is an array of { name, extract, def } descriptors:
 *   name    — output key
 *   extract — (row) => number
 *   def     — default when no row exists (default 0)
 *
 * Exported so unit tests can exercise the gap-fill logic in isolation.
 */
export function fillGaps(startDate, days, rows, fields) {
  const rowMap = new Map(rows.map(r => [r.day, r]));
  const series = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    const row = rowMap.get(key) ?? null;
    const point = { date: key };
    for (const { name, extract, def = 0 } of fields) {
      point[name] = row !== null ? Number(extract(row)) : def;
    }
    series.push(point);
  }
  return series;
}

const DATE_TRUNC_DAY = `date_trunc('day', created_at AT TIME ZONE 'UTC')::date::text`;

// ── GET /admin/analytics/signups?range=30d ────────────────────────────────────
export const getSignupAnalytics = async (request, reply) => {
  try {
    const days  = parseRangeDays(request.query.range);
    const start = startOfRange(days);
    const iso   = start.toISOString();

    const [candRows, recRows] = await Promise.all([
      knex('users')
        .where('created_at', '>=', iso)
        .select(knex.raw(`${DATE_TRUNC_DAY} as day`))
        .count('id as count')
        .groupByRaw(DATE_TRUNC_DAY)
        .orderBy('day'),
      knex('recruiters')
        .where('created_at', '>=', iso)
        .select(knex.raw(`${DATE_TRUNC_DAY} as day`))
        .count('id as count')
        .groupByRaw(DATE_TRUNC_DAY)
        .orderBy('day'),
    ]);

    const cMap = new Map(candRows.map(r => [r.day, Number(r.count)]));
    const rMap = new Map(recRows.map(r => [r.day, Number(r.count)]));

    const series = fillGaps(start, days, [], []).map(({ date }) => ({
      date,
      candidates: cMap.get(date) ?? 0,
      recruiters: rMap.get(date) ?? 0,
    }));

    return reply.status(200).send({
      success: true,
      message: 'OK',
      data: { range: request.query.range ?? '30d', days, series },
    });
  } catch (err) {
    request.server.log.error(err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// ── GET /admin/analytics/jobs?range=30d ───────────────────────────────────────
export const getJobAnalytics = async (request, reply) => {
  try {
    const days  = parseRangeDays(request.query.range);
    const start = startOfRange(days);
    const iso   = start.toISOString();

    const [dailyRows, byStatusRows] = await Promise.all([
      knex('jobs')
        .where('created_at', '>=', iso)
        .select(knex.raw(`${DATE_TRUNC_DAY} as day`))
        .count('id as count')
        .groupByRaw(DATE_TRUNC_DAY)
        .orderBy('day'),
      knex('jobs')
        .select('status')
        .count('id as count')
        .groupBy('status'),
    ]);

    const series = fillGaps(start, days, dailyRows, [{ name: 'new_jobs', extract: r => r.count }]);

    const by_status = {};
    for (const r of byStatusRows) {
      by_status[r.status] = Number(r.count);
    }

    return reply.status(200).send({
      success: true,
      message: 'OK',
      data: { range: request.query.range ?? '30d', days, series, by_status },
    });
  } catch (err) {
    request.server.log.error(err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// ── GET /admin/analytics/applications?range=30d ───────────────────────────────
export const getApplicationAnalytics = async (request, reply) => {
  try {
    const days  = parseRangeDays(request.query.range);
    const start = startOfRange(days);
    const iso   = start.toISOString();

    const [dailyRows, funnelRows] = await Promise.all([
      knex('applications')
        .where('created_at', '>=', iso)
        .select(knex.raw(`${DATE_TRUNC_DAY} as day`))
        .count('id as count')
        .groupByRaw(DATE_TRUNC_DAY)
        .orderBy('day'),
      knex('applications')
        .where('created_at', '>=', iso)
        .select('status')
        .count('id as count')
        .groupBy('status'),
    ]);

    const series = fillGaps(start, days, dailyRows, [{ name: 'applications', extract: r => r.count }]);

    const funnel = {};
    for (const r of funnelRows) {
      funnel[r.status] = Number(r.count);
    }

    return reply.status(200).send({
      success: true,
      message: 'OK',
      data: { range: request.query.range ?? '30d', days, series, funnel },
    });
  } catch (err) {
    request.server.log.error(err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
