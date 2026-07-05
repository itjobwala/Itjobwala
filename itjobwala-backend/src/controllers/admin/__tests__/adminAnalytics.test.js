import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { fillGaps } from '../adminAnalyticsController.js';

function makeStart(daysAgo) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d;
}

describe('fillGaps', () => {
  test('produces exactly `days` points', () => {
    const start = makeStart(6);
    const result = fillGaps(start, 7, [], [{ name: 'count', extract: r => r.count }]);
    assert.equal(result.length, 7);
  });

  test('all dates form a consecutive sequence', () => {
    const start = makeStart(6);
    const result = fillGaps(start, 7, [], [{ name: 'count', extract: r => r.count }]);
    for (let i = 1; i < result.length; i++) {
      const prev = new Date(result[i - 1].date);
      const curr = new Date(result[i].date);
      assert.equal(curr - prev, 24 * 60 * 60 * 1000, `gap at index ${i}`);
    }
  });

  test('zero-fills dates missing from rows', () => {
    const start = makeStart(2);
    const result = fillGaps(start, 3, [], [{ name: 'count', extract: r => r.count }]);
    for (const point of result) {
      assert.equal(point.count, 0);
    }
  });

  test('matches row data by date key', () => {
    const start = makeStart(2);
    const dateStr = start.toISOString().slice(0, 10);
    const rows = [{ day: dateStr, count: '42' }];
    const result = fillGaps(start, 3, rows, [{ name: 'count', extract: r => r.count }]);
    assert.equal(result[0].date, dateStr);
    assert.equal(result[0].count, 42);
    assert.equal(result[1].count, 0);
    assert.equal(result[2].count, 0);
  });

  test('supports multiple fields per point', () => {
    const start = makeStart(0);
    const dateStr = start.toISOString().slice(0, 10);
    const rows = [{ day: dateStr, candidates: '5', recruiters: '2' }];
    const result = fillGaps(start, 1, rows, [
      { name: 'candidates', extract: r => r.candidates },
      { name: 'recruiters', extract: r => r.recruiters },
    ]);
    assert.equal(result[0].candidates, 5);
    assert.equal(result[0].recruiters, 2);
  });

  test('respects custom default value', () => {
    const start = makeStart(0);
    const result = fillGaps(start, 1, [], [{ name: 'val', extract: r => r.val, def: -1 }]);
    assert.equal(result[0].val, -1);
  });

  test('first date equals startDate', () => {
    const start = makeStart(6);
    const expected = start.toISOString().slice(0, 10);
    const result = fillGaps(start, 7, [], []);
    assert.equal(result[0].date, expected);
  });

  test('last date is today', () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);
    const start = makeStart(6);
    const result = fillGaps(start, 7, [], []);
    assert.equal(result[result.length - 1].date, todayStr);
  });
});
