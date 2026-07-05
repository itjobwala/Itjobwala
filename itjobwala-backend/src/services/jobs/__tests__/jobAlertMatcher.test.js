import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { matchesAlertCriteria } from '../jobQueryHelper.js';

const base = {
  title:          'Senior React Developer',
  location:       'Bangalore',
  work_mode:      'remote',
  job_type:       'full-time',
  salary_min:     800000,
  salary_max:     1500000,
  experience_min: 2,
  experience_max: 5,
};

describe('matchesAlertCriteria', () => {
  test('empty criteria matches any job', () => {
    assert.equal(matchesAlertCriteria(base, {}), true);
  });

  test('keyword match is case-insensitive substring', () => {
    assert.equal(matchesAlertCriteria(base, { keywords: 'react' }), true);
    assert.equal(matchesAlertCriteria(base, { keywords: 'REACT' }), true);
    assert.equal(matchesAlertCriteria(base, { keywords: 'Angular' }), false);
  });

  test('location match is case-insensitive substring', () => {
    assert.equal(matchesAlertCriteria(base, { location: 'banga' }), true);
    assert.equal(matchesAlertCriteria(base, { location: 'Mumbai' }), false);
  });

  test('work_mode must be an exact match in the list', () => {
    assert.equal(matchesAlertCriteria(base, { work_mode: ['remote'] }), true);
    assert.equal(matchesAlertCriteria(base, { work_mode: ['hybrid'] }), false);
    assert.equal(matchesAlertCriteria(base, { work_mode: ['hybrid', 'remote'] }), true);
  });

  test('job_type must be an exact match in the list', () => {
    assert.equal(matchesAlertCriteria(base, { job_type: ['full-time'] }), true);
    assert.equal(matchesAlertCriteria(base, { job_type: ['contract'] }), false);
  });

  test('salary_min filters jobs with salary below threshold', () => {
    assert.equal(matchesAlertCriteria(base, { salary_min: 700000 }), true);
    assert.equal(matchesAlertCriteria(base, { salary_min: 900000 }), false);
  });

  test('salary_min null skips salary filter', () => {
    assert.equal(matchesAlertCriteria(base, { salary_min: null }), true);
  });

  test('experience filters jobs where value is outside the band', () => {
    assert.equal(matchesAlertCriteria(base, { experience: 3 }), true);
    assert.equal(matchesAlertCriteria(base, { experience: 1 }), false);
    assert.equal(matchesAlertCriteria(base, { experience: 6 }), false);
  });

  test('experience null skips experience filter', () => {
    assert.equal(matchesAlertCriteria(base, { experience: null }), true);
  });

  test('combined criteria must all pass', () => {
    assert.equal(
      matchesAlertCriteria(base, { keywords: 'react', location: 'bangalore', work_mode: ['remote'] }),
      true,
    );
    assert.equal(
      matchesAlertCriteria(base, { keywords: 'react', location: 'mumbai' }),
      false,
    );
  });

  test('empty work_mode array skips work_mode filter', () => {
    assert.equal(matchesAlertCriteria(base, { work_mode: [] }), true);
  });

  test('empty job_type array skips job_type filter', () => {
    assert.equal(matchesAlertCriteria(base, { job_type: [] }), true);
  });
});
