/**
 * sanitize.test.js
 *
 * Unit tests for deepSanitize() and the existing sanitizeText / sanitizeFields.
 *
 * Run: node --test src/utils/__tests__/sanitize.test.js
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { sanitizeText, sanitizeFields, deepSanitize } from '../sanitize.js';

// ── sanitizeText ─────────────────────────────────────────────────────────────

describe('sanitizeText', () => {
  test('strips script tags', () => {
    assert.equal(sanitizeText('<script>alert(1)</script>hello'), 'hello');
  });

  test('passes through plain text unchanged', () => {
    assert.equal(sanitizeText('hello world'), 'hello world');
  });

  test('passes non-string values through unchanged', () => {
    assert.equal(sanitizeText(42), 42);
    assert.equal(sanitizeText(null), null);
    assert.deepEqual(sanitizeText([1, 2]), [1, 2]);
  });
});

// ── sanitizeFields ────────────────────────────────────────────────────────────

describe('sanitizeFields', () => {
  test('sanitizes top-level string values', () => {
    const result = sanitizeFields({ name: '<b>Bob</b>', age: 30 });
    assert.equal(result.name, 'Bob');
    assert.equal(result.age, 30);
  });

  test('does NOT sanitize nested objects (one-level limit)', () => {
    const nested = { xss: '<script>x</script>' };
    const result = sanitizeFields({ info: nested });
    // sanitizeFields is intentionally shallow — nested object is returned as-is
    assert.deepEqual(result.info, nested);
  });
});

// ── deepSanitize ─────────────────────────────────────────────────────────────

describe('deepSanitize', () => {
  test('sanitizes a flat string', () => {
    assert.equal(deepSanitize('<img src=x onerror=alert(1)>clean'), 'clean');
  });

  test('preserves numbers, booleans, null', () => {
    assert.equal(deepSanitize(42), 42);
    assert.equal(deepSanitize(true), true);
    assert.equal(deepSanitize(null), null);
  });

  test('sanitizes nested object strings', () => {
    const input = {
      personal: { name: '<script>evil</script>Alice', age: 30 },
      bio: 'clean text',
    };
    const result = deepSanitize(input);
    assert.equal(result.personal.name, 'Alice');
    assert.equal(result.personal.age, 30);
    assert.equal(result.bio, 'clean text');
  });

  test('sanitizes array of strings', () => {
    const result = deepSanitize(['<b>bold</b>', 'plain', 42]);
    assert.equal(result[0], 'bold');
    assert.equal(result[1], 'plain');
    assert.equal(result[2], 42);
  });

  test('sanitizes array of objects — answers[] pattern', () => {
    const answers = [
      { question: 'Why?', answer: '<script>xss</script>Because' },
      { question: 'How?', answer: 'Carefully' },
    ];
    const result = deepSanitize(answers);
    assert.equal(result[0].answer, 'Because');
    assert.equal(result[1].answer, 'Carefully');
    assert.equal(result[0].question, 'Why?');
  });

  test('sanitizes deeply nested resume content with bullets', () => {
    const content = {
      experiences: [
        {
          company: 'Acme',
          bullets: ['Good work', '<img src=x onerror=alert(1)>bad bullet'],
        },
      ],
    };
    const result = deepSanitize(content);
    assert.equal(result.experiences[0].company, 'Acme');
    assert.equal(result.experiences[0].bullets[0], 'Good work');
    assert.equal(result.experiences[0].bullets[1], 'bad bullet');
  });

  test('caps recursion at depth 6 — does not throw on very deep nesting', () => {
    // Build a 10-level deep object
    let obj = { val: '<script>deep</script>' };
    for (let i = 0; i < 10; i++) obj = { child: obj };
    assert.doesNotThrow(() => deepSanitize(obj));
  });

  test('handles cyclic references without infinite loop', () => {
    const a = { name: '<b>A</b>' };
    const b = { ref: a };
    a.self = b; // cycle: a → b → a
    assert.doesNotThrow(() => deepSanitize(a));
  });

  test('does not mutate the original object', () => {
    const original = { tag: '<script>x</script>' };
    deepSanitize(original);
    assert.equal(original.tag, '<script>x</script>');
  });

  test('preserves non-plain-object instances (e.g. Date)', () => {
    const d = new Date('2024-01-01');
    const result = deepSanitize({ date: d });
    assert.equal(result.date, d);
  });
});
