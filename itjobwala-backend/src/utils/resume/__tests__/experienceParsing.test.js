/**
 * Experience extraction unit tests.
 * Run: node --test src/utils/resume/__tests__/experienceParsing.test.js
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractExperienceEntries, estimateExperienceYears, splitIntoSections,
  extractEducationEntries, extractCertificationEntries,
  extractProjectEntries,
  extractGlobalMetrics, recoverOrphanBullets,
  extractBlocks, computeParseConfidence,
} from '../resumeSections.js';

// ── Helper ────────────────────────────────────────────────────────────────────

function makeResume(lines) {
  return ['Experience', ...lines].join('\n');
}

// ── Layout A: Role / Company / Date (three separate lines) ────────────────────

describe('Layout A — Role / Company / Date', () => {
  test('basic single job', () => {
    const entries = extractExperienceEntries(makeResume([
      'Software Engineer',
      'Neosoft Technologies',
      'Sep 2022 – Present',
    ]));
    assert.equal(entries.length, 1);
    assert.equal(entries[0].title,   'Software Engineer');
    assert.equal(entries[0].company, 'Neosoft Technologies');
    assert.ok(entries[0].duration.includes('2022'));
  });

  test('title must not be the company name', () => {
    const entries = extractExperienceEntries(makeResume([
      'QA Automation Engineer',
      'Infosys Limited',
      'Jan 2021 – Dec 2023',
    ]));
    assert.equal(entries[0].title,   'QA Automation Engineer');
    assert.equal(entries[0].company, 'Infosys Limited');
  });

  test('multiple jobs — both extracted', () => {
    const entries = extractExperienceEntries(makeResume([
      'Software Engineer',
      'Neosoft Technologies',
      'Sep 2022 – Present',
      '• Built REST APIs with Node.js',
      '',
      'Full Stack Developer',
      'Tech Corp',
      'Jan 2020 – Aug 2022',
      '• Worked on MERN stack',
    ]));
    assert.equal(entries.length, 2);
    assert.equal(entries[0].title,   'Software Engineer');
    assert.equal(entries[0].company, 'Neosoft Technologies');
    assert.equal(entries[1].title,   'Full Stack Developer');
    assert.equal(entries[1].company, 'Tech Corp');
  });

  test('multiple jobs — no blank line between them', () => {
    const entries = extractExperienceEntries(makeResume([
      'Software Engineer',
      'Neosoft Technologies',
      'Sep 2022 – Present',
      '• Built REST APIs',
      'Full Stack Developer',
      'Tech Corp',
      'Jan 2020 – Aug 2022',
      '• MERN stack development',
    ]));
    assert.equal(entries.length, 2);
    assert.equal(entries[0].title,   'Software Engineer');
    assert.equal(entries[1].title,   'Full Stack Developer');
  });
});

// ── Layout B: Role - Company / Date (inline dash) ─────────────────────────────

describe('Layout B — inline dash separator', () => {
  test('Role - Company on one line', () => {
    const entries = extractExperienceEntries(makeResume([
      'Software Engineer - Neosoft Technologies',
      'Sep 2022 – Present',
    ]));
    assert.equal(entries[0].title,   'Software Engineer');
    assert.equal(entries[0].company, 'Neosoft Technologies');
  });

  test('Role - Company - Date all on one line', () => {
    const entries = extractExperienceEntries(makeResume([
      'QA Engineer - Acme Corp  2020 - 2023',
    ]));
    assert.equal(entries[0].title,   'QA Engineer');
    assert.equal(entries[0].company, 'Acme Corp');
    assert.ok(entries[0].duration.includes('2020'));
  });
});

// ── Layout C: Role @ Company / Date ──────────────────────────────────────────

describe('Layout C — @ separator', () => {
  test('Role @ Company on one line', () => {
    const entries = extractExperienceEntries(makeResume([
      'Senior Developer @ Wipro',
      'Mar 2021 – Present',
    ]));
    assert.equal(entries[0].title,   'Senior Developer');
    assert.equal(entries[0].company, 'Wipro');
  });
});

// ── Layout D: Role at Company / Date ─────────────────────────────────────────

describe('Layout D — "at" separator', () => {
  test('Role at Company on one line', () => {
    const entries = extractExperienceEntries(makeResume([
      'Software Engineer at Cognizant',
      'Apr 2019 – Dec 2021',
    ]));
    assert.equal(entries[0].title,   'Software Engineer');
    assert.equal(entries[0].company, 'Cognizant');
  });
});

// ── Layout E: Role / Company / Location / Date ────────────────────────────────

describe('Layout E — Role / Company / Location / Date', () => {
  test('location line must not become the title', () => {
    const entries = extractExperienceEntries(makeResume([
      'Software Engineer',
      'Neosoft Technologies',
      'Mumbai, India',
      'Sep 2022 – Present',
    ]));
    assert.equal(entries[0].title,   'Software Engineer');
    assert.equal(entries[0].company, 'Neosoft Technologies');
  });

  test('Remote marker is filtered', () => {
    const entries = extractExperienceEntries(makeResume([
      'Full Stack Developer',
      'Tech Corp',
      'Remote',
      'Jan 2021 – Present',
    ]));
    assert.equal(entries[0].title,   'Full Stack Developer');
    assert.equal(entries[0].company, 'Tech Corp');
  });

  test('Hybrid marker is filtered', () => {
    const entries = extractExperienceEntries(makeResume([
      'QA Lead',
      'Infosys',
      'Hybrid',
      'Jun 2020 – Dec 2023',
    ]));
    assert.equal(entries[0].title,   'QA Lead');
    assert.equal(entries[0].company, 'Infosys');
  });
});

// ── Em-dash inline separator ──────────────────────────────────────────────────

describe('Em-dash inline separator', () => {
  test('Role – Company on one line', () => {
    const entries = extractExperienceEntries(makeResume([
      'Software Engineer – Neosoft Technologies',
      'Sep 2022 – Present',
    ]));
    assert.equal(entries[0].title,   'Software Engineer');
    assert.equal(entries[0].company, 'Neosoft Technologies');
  });

  test('Role – Company – Date all inline', () => {
    const entries = extractExperienceEntries(makeResume([
      'Senior QA Engineer – TCS  Apr 2020 – Mar 2023',
    ]));
    assert.equal(entries[0].title,   'Senior QA Engineer');
    assert.equal(entries[0].company, 'TCS');
    assert.ok(entries[0].duration.includes('2020'));
  });
});

// ── Pipe separator ────────────────────────────────────────────────────────────

describe('Pipe separator', () => {
  test('Role | Company on one line', () => {
    const entries = extractExperienceEntries(makeResume([
      'Software Engineer | Neosoft Technologies',
      'Sep 2022 – Present',
    ]));
    assert.equal(entries[0].title,   'Software Engineer');
    assert.equal(entries[0].company, 'Neosoft Technologies');
  });
});

// ── Date formats ─────────────────────────────────────────────────────────────

describe('Date format variants', () => {
  test('year-only range: 2022 – Present', () => {
    const entries = extractExperienceEntries(makeResume([
      'Developer',
      'Corp',
      '2022 – Present',
    ]));
    assert.equal(entries[0].title, 'Developer');
    assert.ok(entries[0].duration.includes('2022'));
  });

  test('year-only range: 2020 – 2022', () => {
    const entries = extractExperienceEntries(makeResume([
      'Engineer',
      'Firm',
      '2020 – 2022',
    ]));
    assert.ok(entries[0].duration.includes('2020'));
    assert.ok(entries[0].duration.includes('2022'));
  });

  test('month-year to present: Apr 2023 – Present', () => {
    const entries = extractExperienceEntries(makeResume([
      'Lead Developer',
      'MyCompany',
      'Apr 2023 – Present',
    ]));
    assert.equal(entries[0].title, 'Lead Developer');
    assert.ok(entries[0].duration.includes('2023'));
  });

  test('month-year to month-year: Jan 2020 – Dec 2022', () => {
    const entries = extractExperienceEntries(makeResume([
      'QA Engineer',
      'KPIT',
      'Jan 2020 – Dec 2022',
    ]));
    assert.equal(entries[0].title, 'QA Engineer');
    assert.ok(entries[0].duration.includes('2020'));
  });

  test('September (full month name)', () => {
    const entries = extractExperienceEntries(makeResume([
      'Engineer',
      'Corp',
      'September 2021 – Present',
    ]));
    assert.ok(entries[0].duration.includes('2021'));
  });
});

// ── Missing company ───────────────────────────────────────────────────────────

describe('Missing company', () => {
  test('role then date immediately — company stays empty', () => {
    const entries = extractExperienceEntries(makeResume([
      'Freelance Developer',
      '2021 – Present',
    ]));
    assert.equal(entries[0].title,   'Freelance Developer');
    assert.equal(entries[0].company, '');
  });
});

// ── Bullets attributed correctly ──────────────────────────────────────────────

describe('Bullet attribution', () => {
  test('bullets go to the right entry', () => {
    const entries = extractExperienceEntries(makeResume([
      'Engineer',
      'Corp A',
      '2022 – Present',
      '• Built microservices',
      '• Led code reviews',
      '',
      'Junior Developer',
      'Corp B',
      '2020 – 2022',
      '• Wrote unit tests',
    ]));
    assert.ok(entries[0].description.includes('microservices'));
    assert.ok(entries[0].description.includes('code reviews'));
    assert.ok(entries[1].description.includes('unit tests'));
    assert.ok(!entries[0].description.includes('unit tests'));
  });

  test('bullets stripped of leading marker', () => {
    const entries = extractExperienceEntries(makeResume([
      'Engineer',
      'Corp',
      '2022 – Present',
      '• Reduced API latency by 40%',
    ]));
    assert.ok(!entries[0].description.startsWith('•'));
  });
});

// ── Bug 1: bullet containing a date range must not terminate entry ────────────

describe('Bullet lines with inline date ranges', () => {
  test('bullet with date range stays in description, does not split entry', () => {
    const entries = extractExperienceEntries(makeResume([
      'Software Engineer',
      'Neosoft',
      '2020 – Present',
      '• Automated 1000 test cases in 2021 – 2022 using Selenium',
    ]));
    assert.equal(entries.length, 1, 'must not split into 2 entries');
    assert.ok(entries[0].description.includes('Automated'), 'bullet content must be in description');
    assert.equal(entries[0].title, 'Software Engineer');
  });

  test('bullet with "present" phrase is not a date line', () => {
    const entries = extractExperienceEntries(makeResume([
      'QA Lead',
      'Corp',
      '2021 – Present',
      '• Delivered features from 2022 to present on time',
    ]));
    assert.equal(entries.length, 1);
    assert.ok(entries[0].description.includes('Delivered'));
  });

  test('two entries — bullet date range does not corrupt second entry', () => {
    const entries = extractExperienceEntries(makeResume([
      'Senior Engineer',
      'Acme',
      '2022 – Present',
      '• Reduced build time by 2021 hours',  // numeric, no second year → no date range
      '',
      'Junior Developer',
      'Corp',
      '2019 – 2022',
    ]));
    assert.equal(entries.length, 2);
    assert.equal(entries[0].title, 'Senior Engineer');
    assert.equal(entries[1].title, 'Junior Developer');
  });
});

// ── Bug 2: date-first layout (date before role/company) ───────────────────────

describe('Date-first layout', () => {
  test('date line first, then role, then company', () => {
    const entries = extractExperienceEntries(makeResume([
      '2020 – Present',
      'Software Engineer',
      'Neosoft Technologies',
    ]));
    assert.equal(entries[0].title,   'Software Engineer');
    assert.equal(entries[0].company, 'Neosoft Technologies');
  });

  test('date line first, role only (no company)', () => {
    const entries = extractExperienceEntries(makeResume([
      '2021 – Present',
      'Freelance Consultant',
    ]));
    assert.equal(entries[0].title, 'Freelance Consultant');
  });
});

// ── Bug 3: isLikelyRoleTitle must not fire on description sentences ────────────

describe('isLikelyRoleTitle false positives', () => {
  test('non-bullet sentence with role keyword stays in description', () => {
    const entries = extractExperienceEntries(makeResume([
      'Software Engineer',
      'TechCorp',
      '2020 – Present',
      '• Built REST APIs',
      'Worked alongside lead developer to improve pipeline',
    ]));
    assert.equal(entries.length, 1, 'must not flush at description sentence');
    assert.ok(entries[0].description.includes('Worked'), 'sentence must be in description');
  });

  test('7-word sentence with "manager" does not trigger flush', () => {
    const entries = extractExperienceEntries(makeResume([
      'QA Engineer',
      'Corp',
      '2020 – Present',
      '• Tested APIs',
      'Reported defects directly to the product manager weekly',
    ]));
    assert.equal(entries.length, 1);
    assert.ok(entries[0].description.includes('Reported'));
  });

  test('verb-start line with role keyword does not flush', () => {
    const entries = extractExperienceEntries(makeResume([
      'Developer',
      'Corp',
      '2020 – Present',
      '• Wrote tests',
      'Mentored junior developer through onboarding',
    ]));
    assert.equal(entries.length, 1);
    assert.ok(entries[0].description.includes('Mentored'));
  });
});

// ── Bug 4 & 5: isLocationLine false positives for corp suffixes ───────────────

describe('isLocationLine — company suffix false positives', () => {
  test('"Corp" suffix must not be filtered as location', () => {
    const entries = extractExperienceEntries(makeResume([
      'Software Engineer',
      '2020 – Present',
      'Stripe, Corp',
    ]));
    assert.equal(entries[0].company, 'Stripe, Corp');
  });

  test('"LLC" suffix must not be filtered as location', () => {
    const entries = extractExperienceEntries(makeResume([
      'Data Engineer',
      '2020 – Present',
      'Global Analytics, LLC',
    ]));
    assert.equal(entries[0].company, 'Global Analytics, LLC');
  });

  test('"Inc." suffix must not be filtered as location', () => {
    const entries = extractExperienceEntries(makeResume([
      'Engineer',
      '2020 – Present',
      'Acme, Inc.',
    ]));
    assert.equal(entries[0].company, 'Acme, Inc.');
  });

  test('"Group" suffix must not be filtered as location', () => {
    const entries = extractExperienceEntries(makeResume([
      'Analyst',
      '2020 – Present',
      'Tata Consultancy, Group',
    ]));
    assert.equal(entries[0].company, 'Tata Consultancy, Group');
  });
});

// ── Bug 5b: isLocationLine false negative for lowercase city names ─────────────

describe('isLocationLine — lowercase city names', () => {
  test('lowercase "mumbai, india" must not become company when real company is present', () => {
    const entries = extractExperienceEntries(makeResume([
      'Software Engineer',
      'Neosoft Technologies',
      'mumbai, india',
      '2020 – Present',
    ]));
    assert.equal(entries[0].title,   'Software Engineer');
    assert.equal(entries[0].company, 'Neosoft Technologies');
  });

  test('lowercase "new york, ny" must not become company when title is present', () => {
    const entries = extractExperienceEntries(makeResume([
      'Frontend Developer',
      'Stripe',
      'new york, ny',
      '2021 – Present',
    ]));
    assert.equal(entries[0].title,   'Frontend Developer');
    assert.equal(entries[0].company, 'Stripe');
  });
});

// ── Bug 6: EXP_ROLE_TITLE_RE missing Product Owner, Scrum Master ──────────────

describe('EXP_ROLE_TITLE_RE coverage gaps', () => {
  test('"Product Owner" triggers job transition without blank line', () => {
    const entries = extractExperienceEntries(makeResume([
      'Software Engineer',
      'Corp A',
      '2022 – Present',
      '• Built APIs',
      'Product Owner',
      'Corp B',
      '2019 – 2022',
      '• Managed backlog',
    ]));
    assert.equal(entries.length, 2);
    assert.equal(entries[1].title, 'Product Owner');
  });

  test('"Scrum Master" triggers job transition without blank line', () => {
    const entries = extractExperienceEntries(makeResume([
      'Developer',
      'Corp A',
      '2022 – Present',
      '• Feature work',
      'Scrum Master',
      'Corp B',
      '2019 – 2022',
    ]));
    assert.equal(entries.length, 2);
    assert.equal(entries[1].title, 'Scrum Master');
  });

  test('"Technical Writer" triggers job transition without blank line', () => {
    const entries = extractExperienceEntries(makeResume([
      'QA Engineer',
      'Corp A',
      '2022 – Present',
      '• Automated tests',
      'Technical Writer',
      'Corp B',
      '2019 – 2022',
    ]));
    assert.equal(entries.length, 2);
    assert.equal(entries[1].title, 'Technical Writer');
  });
});

// ── R3: splitIntoSections "Project Manager" misrouting ────────────────────────

describe('splitIntoSections routing guard — role titles with "Project"', () => {
  test('Project Manager transition → 2 entries, not 1', () => {
    const entries = extractExperienceEntries(makeResume([
      'Engineer',
      'Corp A',
      '2022 – Present',
      '• Built features',
      'Project Manager',
      'Corp B',
      '2019 – 2022',
      '• Managed roadmap',
    ]));
    assert.equal(entries.length, 2, 'Corp B must not be misrouted to projects section');
    assert.equal(entries[1].title, 'Project Manager');
    assert.equal(entries[1].company, 'Corp B');
  });

  test('Project Lead transition → 2 entries', () => {
    const entries = extractExperienceEntries(makeResume([
      'Developer',
      'Corp A',
      '2022 – Present',
      'Project Lead',
      'Corp B',
      '2020 – 2022',
    ]));
    assert.equal(entries.length, 2);
    assert.equal(entries[1].title, 'Project Lead');
  });
});

// ── L1–L4: isLocationLine company+country-code false positives ────────────────

describe('isLocationLine — company + country/state code false positives', () => {
  test('Google, USA must not be filtered as location', () => {
    const entries = extractExperienceEntries(makeResume([
      'Software Engineer',
      '2020 – Present',
      'Google, USA',
    ]));
    assert.equal(entries[0].company, 'Google, USA');
  });

  test('Netflix, NA must not be filtered as location', () => {
    const entries = extractExperienceEntries(makeResume([
      'Engineer',
      '2020 – Present',
      'Netflix, NA',
    ]));
    assert.equal(entries[0].company, 'Netflix, NA');
  });

  test('Citi, NY must not be filtered as location', () => {
    const entries = extractExperienceEntries(makeResume([
      'Analyst',
      '2020 – Present',
      'Citi, NY',
    ]));
    assert.equal(entries[0].company, 'Citi, NY');
  });

  test('HDFC, Pune — all-caps company acronym must not be filtered as location', () => {
    const entries = extractExperienceEntries(makeResume([
      'Software Engineer',
      '2019 – 2022',
      'HDFC, Pune',
    ]));
    assert.equal(entries[0].company, 'HDFC, Pune');
  });

  test('Mumbai, India still treated as location', () => {
    const entries = extractExperienceEntries(makeResume([
      'Developer',
      'TCS',
      'Mumbai, India',
      '2020 – Present',
    ]));
    assert.equal(entries[0].company, 'TCS');
  });
});

// ── S1–S3: slash-format dates ─────────────────────────────────────────────────

describe('Slash-format date variants', () => {
  test('MM/YYYY - MM/YYYY detected', () => {
    const entries = extractExperienceEntries(makeResume([
      'QA Engineer',
      'Corp',
      '09/2022 - 03/2024',
    ]));
    assert.equal(entries.length, 1);
    assert.equal(entries[0].title, 'QA Engineer');
    assert.ok(entries[0].duration.includes('2022'));
  });

  test('YYYY/MM – YYYY/MM detected', () => {
    const entries = extractExperienceEntries(makeResume([
      'Developer',
      'Corp',
      '2022/09 – 2024/03',
    ]));
    assert.equal(entries.length, 1);
    assert.ok(entries[0].duration.includes('2022'));
  });

  test('"to" separator: 09-2022 to 03-2024 detected', () => {
    const entries = extractExperienceEntries(makeResume([
      'Engineer',
      'Corp',
      '09-2022 to 03-2024',
    ]));
    assert.equal(entries.length, 1);
    assert.ok(entries[0].duration.includes('2022'));
  });

  test('"to" separator: January 2020 to March 2023 detected', () => {
    const entries = extractExperienceEntries(makeResume([
      'Lead Developer',
      'Corp',
      'January 2020 to March 2023',
    ]));
    assert.equal(entries.length, 1);
    assert.ok(entries[0].duration.includes('2020'));
  });
});

// ── P2: "Sr." abbreviation period must not block isLikelyRoleTitle ────────────

describe('isLikelyRoleTitle — abbreviation period allowed', () => {
  test('Sr. Engineer triggers job transition without blank line', () => {
    const entries = extractExperienceEntries(makeResume([
      'Junior Developer',
      'Corp A',
      '2022 – Present',
      '• Wrote tests',
      'Sr. Engineer',
      'Corp B',
      '2019 – 2022',
    ]));
    assert.equal(entries.length, 2);
    assert.equal(entries[1].title, 'Sr. Engineer');
  });

  test('Jr. Developer triggers job transition without blank line', () => {
    const entries = extractExperienceEntries(makeResume([
      'Lead Engineer',
      'Corp A',
      '2022 – Present',
      'Jr. Developer',
      'Corp B',
      '2020 – 2022',
    ]));
    assert.equal(entries.length, 2);
    assert.equal(entries[1].title, 'Jr. Developer');
  });

  test('sentence ending with period is still blocked', () => {
    const entries = extractExperienceEntries(makeResume([
      'Engineer',
      'Corp',
      '2020 – Present',
      'Managed the development team.',
    ]));
    assert.equal(entries.length, 1);
    assert.ok(entries[0].description.includes('Managed'));
  });
});

// ── IN1: INLINE_SEP_RE "at" false split ───────────────────────────────────────

describe('INLINE_SEP_RE — "at" in compound title', () => {
  test('"Platform at Scale Engineer" not split on "at"', () => {
    const entries = extractExperienceEntries(makeResume([
      'Platform at Scale Engineer',
      'Google',
      '2021 – Present',
    ]));
    assert.equal(entries[0].title,   'Platform at Scale Engineer');
    assert.equal(entries[0].company, 'Google');
  });

  test('"Software Engineer at Google" still splits correctly', () => {
    const entries = extractExperienceEntries(makeResume([
      'Software Engineer at Google',
      '2021 – Present',
    ]));
    assert.equal(entries[0].title,   'Software Engineer');
    assert.equal(entries[0].company, 'Google');
  });
});

// ── R1–R2: VP / Sales Representative / Nurse Practitioner roles ───────────────

describe('EXP_ROLE_TITLE_RE — expanded roles', () => {
  test('Sales Representative triggers transition', () => {
    const entries = extractExperienceEntries(makeResume([
      'Account Manager',
      'Corp A',
      '2022 – Present',
      '• Closed deals',
      'Sales Representative',
      'Corp B',
      '2019 – 2022',
    ]));
    assert.equal(entries.length, 2);
    assert.equal(entries[1].title, 'Sales Representative');
  });

  test('VP of Engineering triggers transition', () => {
    const entries = extractExperienceEntries(makeResume([
      'Engineering Manager',
      'Corp A',
      '2022 – Present',
      'VP of Engineering',
      'Corp B',
      '2018 – 2022',
    ]));
    assert.equal(entries.length, 2);
    assert.equal(entries[1].title, 'VP of Engineering');
  });

  test('Nurse Practitioner triggers transition', () => {
    const entries = extractExperienceEntries(makeResume([
      'Registered Nurse',
      'Hospital A',
      '2022 – Present',
      'Nurse Practitioner',
      'Hospital B',
      '2019 – 2022',
    ]));
    assert.equal(entries.length, 2);
    assert.equal(entries[1].title, 'Nurse Practitioner');
  });
});

// ── estimateExperienceYears ───────────────────────────────────────────────────

describe('estimateExperienceYears', () => {
  const currentYear = new Date().getFullYear();

  test('year range sums correctly', () => {
    const years = estimateExperienceYears('Jan 2019 – Dec 2022');
    assert.equal(years, 3);
  });

  test('present → uses current year', () => {
    const years = estimateExperienceYears(`Jan ${currentYear - 2} – Present`);
    assert.ok(years >= 2);
  });

  test('multiple non-overlapping ranges summed', () => {
    const text = '2019 – 2021\n2022 – Present';
    const years = estimateExperienceYears(text);
    assert.ok(years >= 3);
  });

  test('zero for no dates', () => {
    assert.equal(estimateExperienceYears('No dates here at all'), 0);
  });
});

// ── D01: Layout B — Company → Role → Date ────────────────────────────────────

describe('Layout B — company-first (role on second line)', () => {
  test('Google → Software Engineer → date — title/company correct', () => {
    const entries = extractExperienceEntries('Experience\nGoogle\nSoftware Engineer\n2020 – 2023');
    assert.equal(entries[0].title,   'Software Engineer');
    assert.equal(entries[0].company, 'Google');
  });

  test('Amazon Web Services → Solutions Architect → date', () => {
    const entries = extractExperienceEntries('Experience\nAmazon Web Services\nSolutions Architect\n2020 – 2024');
    assert.equal(entries[0].title,   'Solutions Architect');
    assert.equal(entries[0].company, 'Amazon Web Services');
  });

  test('normal Role → Company order still correct after swap heuristic', () => {
    const entries = extractExperienceEntries('Experience\nSoftware Engineer\nMicrosoft\n2020 – 2024');
    assert.equal(entries[0].title,   'Software Engineer');
    assert.equal(entries[0].company, 'Microsoft');
  });
});

// ── D02: Layout F — Company → Date → Role ────────────────────────────────────

describe('Layout F — company then date then role', () => {
  test('Google → date → Software Engineer — swaps correctly', () => {
    const entries = extractExperienceEntries('Experience\nGoogle\n2020 – 2023\nSoftware Engineer');
    assert.equal(entries[0].title,   'Software Engineer');
    assert.equal(entries[0].company, 'Google');
  });

  test('Date → Company → Role — swaps correctly', () => {
    const entries = extractExperienceEntries('Experience\n2020 – 2023\nNeosoft Technologies\nSoftware Engineer');
    assert.equal(entries[0].title,   'Software Engineer');
    assert.equal(entries[0].company, 'Neosoft Technologies');
  });
});

// ── D03: Layout G — Company header with multiple promotions ──────────────────

describe('Layout G — promotion blocks (one company, multiple roles)', () => {
  test('both promotions extracted with correct company', () => {
    const entries = extractExperienceEntries([
      'Experience',
      'Google', '',
      'Senior Engineer', '2023 – Present', '• Led infra', '',
      'Software Engineer', '2020 – 2023', '• Built APIs',
    ].join('\n'));
    assert.equal(entries.length, 2);
    assert.equal(entries[0].title,   'Senior Engineer');
    assert.equal(entries[0].company, 'Google');
    assert.equal(entries[1].title,   'Software Engineer');
    assert.equal(entries[1].company, 'Google', 'company carries over to promoted role');
  });

  test('inline date promotion block — Amazon', () => {
    const entries = extractExperienceEntries([
      'Experience',
      'Amazon',
      'Senior Software Engineer  Jan 2022 – Present',
      'Software Engineer  Mar 2019 – Dec 2021',
    ].join('\n'));
    assert.equal(entries.length, 2);
    assert.equal(entries[0].title,   'Senior Software Engineer');
    assert.equal(entries[0].company, 'Amazon');
    assert.equal(entries[1].company, 'Amazon', 'second promotion inherits Amazon');
  });
});

// ── D05/D06: Company names that match section header keywords ─────────────────

describe('Company names matching section header keywords', () => {
  test('"Experience Labs" not consumed as section header', () => {
    const s = splitIntoSections('Experience\nUX Designer\nExperience Labs\n2020 – Present');
    assert.ok(s.experience.some(l => l.includes('Experience Labs')));
  });

  test('"Education First" not consumed as section header', () => {
    const s = splitIntoSections('Experience\nSoftware Engineer\nEducation First\n2020 – Present');
    assert.ok(s.experience.some(l => l.includes('Education First')));
  });

  test('"Academic Research Labs" not consumed as education header', () => {
    const s = splitIntoSections('Experience\nResearch Scientist\nAcademic Research Labs\n2020 – Present');
    assert.ok(s.experience.some(l => l.includes('Academic Research Labs')));
  });
});

// ── D07/D21: Cert name containing "Certification" not consumed ────────────────

describe('Certification entries — cert name with "Certification" preserved', () => {
  test('"PMP Certification" not swallowed as section header', () => {
    const certs = extractCertificationEntries(
      'Certifications\nAWS Solutions Architect\nPMP Certification\nGoogle Cloud Professional'
    );
    assert.ok(certs.some(c => c.includes('PMP')));
    assert.equal(certs.length, 3);
  });

  test('"ISTQB Certification" preserved', () => {
    const certs = extractCertificationEntries(
      'Certifications\nISTQB Certification – Advanced Level\nSelenium WebDriver Specialist'
    );
    assert.ok(certs.some(c => c.includes('ISTQB')));
  });
});

// ── D08: Non-bullet description containing year range → no spurious entry ─────

describe('Non-bullet description with year range', () => {
  test('sentence starting with "Managed" containing year range stays in description', () => {
    const entries = extractExperienceEntries([
      'Experience', 'Senior Engineer', 'Acme', '2022 – Present',
      'Managed codebase migration from 2019 to 2020 for legacy rewrite',
    ].join('\n'));
    assert.equal(entries.length, 1);
    assert.ok(entries[0].description.includes('migration'));
  });

  test('sentence starting with "Led" with dash range stays in description', () => {
    const entries = extractExperienceEntries([
      'Experience', 'Engineer', 'Corp', '2022 – Present',
      'Led platform 2020 – 2021 rewrite resulting in 3× speed improvement',
    ].join('\n'));
    assert.equal(entries.length, 1);
  });
});

// ── D09: Layout D pipe format "Company | Role | Date" ────────────────────────

describe('Layout D — pipe-separated Company | Role | Date', () => {
  test('"Infosys | QA Engineer | Jan 2019 – Dec 2022" → correct title and company', () => {
    const entries = extractExperienceEntries('Experience\nInfosys | QA Engineer | Jan 2019 – Dec 2022');
    assert.equal(entries[0].title,   'QA Engineer');
    assert.equal(entries[0].company, 'Infosys');
  });

  test('"TCS | Software Developer | 2020 – 2023" extracts correctly', () => {
    const entries = extractExperienceEntries('Experience\nTCS | Software Developer | 2020 – 2023');
    assert.equal(entries[0].title,   'Software Developer');
    assert.equal(entries[0].company, 'TCS');
  });

  test('"Software Engineer at Google" still splits correctly after pipe fix', () => {
    const entries = extractExperienceEntries('Experience\nSoftware Engineer at Google\n2021 – Present');
    assert.equal(entries[0].title,   'Software Engineer');
    assert.equal(entries[0].company, 'Google');
  });
});

// ── D10/D12: Degree keyword coverage ─────────────────────────────────────────

describe('Education — degree keyword coverage', () => {
  test('BS Computer Science detected', () => {
    const e = extractEducationEntries('Education\nBS Computer Science\nStanford University\n2016 – 2020');
    assert.equal(e.length, 1);
    assert.ok(e[0].institution?.includes('Stanford'));
  });

  test('MS in Data Science detected', () => {
    const e = extractEducationEntries('Education\nMS in Data Science\nCarnegie Mellon University\n2020 – 2022');
    assert.equal(e.length, 1);
  });

  test('Associate Degree in Business detected', () => {
    const e = extractEducationEntries('Education\nAssociate Degree in Business\nCommunity College\n2018 – 2020');
    assert.equal(e.length, 1);
  });

  test('BA in Economics detected', () => {
    const e = extractEducationEntries('Education\nBA in Economics\nOxford University\n2015 – 2019');
    assert.equal(e.length, 1);
  });
});

// ── D11: GPA line not captured as institution ─────────────────────────────────

describe('Education — GPA line not captured as institution', () => {
  test('GPA: 8.5/10 skipped, IIT Delhi captured as institution', () => {
    const e = extractEducationEntries('Education\nB.Tech Computer Science\nGPA: 8.5/10\nIIT Delhi\n2018 – 2022');
    assert.notEqual(e[0].institution, 'GPA: 8.5/10');
    assert.ok(e[0].institution?.includes('IIT'));
  });

  test('CGPA: 9.2 skipped, institution line captured', () => {
    const e = extractEducationEntries('Education\nB.E. Computer Science\nCGPA: 9.2\nVIT University\n2019 – 2023');
    assert.ok(!e[0].institution?.toLowerCase().includes('cgpa'));
    assert.ok(e[0].institution?.includes('VIT'));
  });
});

// ── D13: Cert bullet markers stripped ────────────────────────────────────────

describe('Certifications — bullet markers stripped', () => {
  test('• prefix removed from all cert lines', () => {
    const certs = extractCertificationEntries(
      'Certifications\n• AWS Solutions Architect\n• Google Cloud Professional\n• PMP'
    );
    assert.ok(!certs.some(c => c.startsWith('•')));
    assert.ok(certs.some(c => c.includes('AWS')));
    assert.ok(certs.some(c => c.includes('Google Cloud')));
  });
});

// ── D14: Role keywords — non-engineering roles trigger transition ──────────────

describe('EXP_ROLE_TITLE_RE — non-engineering role transitions', () => {
  test('"Research Fellow" triggers transition without blank line', () => {
    const entries = extractExperienceEntries([
      'Experience', 'Software Engineer', 'Corp A', '2022 – Present', '• Built APIs',
      'Research Fellow', 'MIT', '2019 – 2022',
    ].join('\n'));
    assert.equal(entries.length, 2);
    assert.equal(entries[1].title, 'Research Fellow');
  });

  test('"Brand Strategist" triggers transition without blank line', () => {
    const entries = extractExperienceEntries([
      'Experience', 'Marketing Manager', 'Corp A', '2022 – Present', '• Campaigns',
      'Brand Strategist', 'Corp B', '2020 – 2022',
    ].join('\n'));
    assert.equal(entries.length, 2);
  });

  test('"Visiting Lecturer" triggers transition', () => {
    const entries = extractExperienceEntries([
      'Experience', 'Professor', 'Univ A', '2022 – Present',
      'Visiting Lecturer', 'Univ B', '2020 – 2022',
    ].join('\n'));
    assert.equal(entries.length, 2);
    assert.equal(entries[1].title, 'Visiting Lecturer');
  });

  test('"Content Creator" triggers transition', () => {
    const entries = extractExperienceEntries([
      'Experience', 'Engineer', 'Corp A', '2022 – Present',
      'Content Creator', 'Corp B', '2020 – 2022',
    ].join('\n'));
    assert.equal(entries.length, 2);
  });
});

// ── D16: Skills section header variants ──────────────────────────────────────

describe('splitIntoSections — skills section header variants', () => {
  test('"Areas of Expertise" routes to skills', () => {
    const s = splitIntoSections('Areas of Expertise\nPython, TensorFlow, SQL');
    assert.ok(s.skills.some(l => l.includes('Python')));
  });

  test('"Key Skills" routes to skills', () => {
    const s = splitIntoSections('Key Skills\nReact, Node.js, MongoDB');
    assert.ok(s.skills.some(l => l.includes('React')));
  });

  test('"Technical Expertise" routes to skills', () => {
    const s = splitIntoSections('Technical Expertise\nDocker, Kubernetes, AWS');
    assert.ok(s.skills.some(l => l.includes('Docker')));
  });
});

// ── Phase 1: extractGlobalMetrics ────────────────────────────────────────────

describe('extractGlobalMetrics (Phase 1)', () => {
  test('extracts percentage metric from education section', () => {
    const text = 'Education\nBachelor of Engineering\n• Reduced API latency by 40%';
    const metrics = extractGlobalMetrics(text);
    assert.ok(metrics.some(m => /40%/.test(m)), 'percentage metric captured globally');
  });

  test('extracts K/M/B count metric (1M+ transactions)', () => {
    const text = 'Projects\nProcessed 1M+ transactions daily with async queuing';
    const metrics = extractGlobalMetrics(text);
    assert.ok(metrics.some(m => /1M/.test(m)), '1M+ count metric captured');
  });

  test('extracts dollar savings metric', () => {
    const text = 'Projects\nSaved $5M in annual infrastructure costs through rightsizing';
    const metrics = extractGlobalMetrics(text);
    assert.ok(metrics.some(m => /\$5M/.test(m)), '$5M savings captured globally');
  });

  test('deduplicates identical metrics', () => {
    const text = 'Reduced latency by 40%\nReduced latency by 40%\nImproved coverage by 30%';
    const metrics = extractGlobalMetrics(text);
    const count40 = metrics.filter(m => /40%/.test(m)).length;
    assert.equal(count40, 1, 'identical metrics deduplicated');
  });

  test('returns empty array when no metrics present', () => {
    const metrics = extractGlobalMetrics('Skills\nPython, Java, React');
    assert.deepEqual(metrics, []);
  });
});

// ── Phase 3: recoverOrphanBullets ─────────────────────────────────────────────

describe('recoverOrphanBullets (Phase 3)', () => {
  test('action-verb bullets in education section → attached to last experience entry', () => {
    const text = [
      'Experience',
      'Software Engineer',
      'Neosoft Technologies',
      'Sept 2022 – Present',
      '',
      'Education',
      'Bachelor of Engineering',
      '',
      '• Built fraud prevention engine',
      '• Reduced API latency by 40%',
      '• Managed AWS infrastructure',
    ].join('\n');

    const entries  = extractExperienceEntries(text);
    const recovered = recoverOrphanBullets(text, entries);
    assert.equal(recovered.length, 1);
    assert.ok(recovered[0].description.includes('fraud prevention'), 'first orphan bullet attached');
    assert.ok(recovered[0].description.includes('latency'), 'second orphan bullet attached');
  });

  test('non-action-verb bullets (awards, participation) in education are NOT recovered', () => {
    const text = [
      'Experience',
      'Developer',
      'Corp',
      '2022 – Present',
      '',
      'Education',
      'B.Tech Computer Science',
      '• Awarded Best Student 2022',
      '• Participated in annual hackathon',
    ].join('\n');

    const entries   = extractExperienceEntries(text);
    const recovered = recoverOrphanBullets(text, entries);
    assert.ok(!recovered[0].description.includes('Awarded'),     'non-work bullet not recovered');
    assert.ok(!recovered[0].description.includes('Participated'), 'non-work bullet not recovered');
  });

  test('empty experienceEntries → returns empty array unchanged', () => {
    const text = 'Education\n• Built something\nB.Tech';
    const recovered = recoverOrphanBullets(text, []);
    assert.deepEqual(recovered, []);
  });

  test('existing description preserved when orphan bullets are appended', () => {
    const text = [
      'Experience',
      'QA Engineer',
      'Corp A',
      '2022 – Present',
      '• Built Selenium framework',
      '',
      'Education',
      'B.Tech',
      '• Implemented API tests in REST Assured',
    ].join('\n');

    const entries   = extractExperienceEntries(text);
    const recovered = recoverOrphanBullets(text, entries);
    assert.ok(recovered[0].description.includes('Selenium'),    'existing description kept');
    assert.ok(recovered[0].description.includes('REST Assured'), 'orphan bullet appended');
  });
});

// ── Phase 2+3: success criteria resume ───────────────────────────────────────

describe('success criteria — mixed-order resume (Phases 2 + 3)', () => {
  const RESUME = [
    'Experience',
    '',
    'Software Engineer',
    'Neosoft Technologies',
    'Sept 2022 – Present',
    '',
    'Projects',
    '',
    'eBullion – Digital Metals Investment Platform',
    'React | TypeScript | Node.js | PostgreSQL',
    '',
    'Education',
    '',
    'Bachelor of Engineering',
    '',
    '• Built fraud prevention engine',
    '• Reduced API latency by 40%',
    '• Managed AWS infrastructure',
  ].join('\n');

  test('experience entry extracted correctly', () => {
    const entries = extractExperienceEntries(RESUME);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].title,   'Software Engineer');
    assert.equal(entries[0].company, 'Neosoft Technologies');
  });

  test('project extracted with tools from pipe-separated line', () => {
    const entries = extractProjectEntries(RESUME);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].name, 'eBullion – Digital Metals Investment Platform');
    assert.ok(entries[0].tools.length > 0, 'tools must be populated from pipe-separated line');
  });

  test('orphan bullets recovered into experience description', () => {
    const entries   = extractExperienceEntries(RESUME);
    const recovered = recoverOrphanBullets(RESUME, entries);
    assert.ok(recovered[0].description.includes('fraud prevention'), 'orphan bullet recovered');
    assert.ok(recovered[0].description.includes('40%'),              'metric bullet recovered');
  });

  test('global metrics captured even from education section', () => {
    const metrics = extractGlobalMetrics(RESUME);
    assert.ok(metrics.some(m => /40%/.test(m)), '40% reduction captured globally');
  });
});

// ── extractBlocks ─────────────────────────────────────────────────────────────

describe('extractBlocks — paragraph splitting', () => {
  test('empty string → empty array', () => {
    assert.deepEqual(extractBlocks(''), []);
    assert.deepEqual(extractBlocks(null), []);
  });

  test('single paragraph → one block', () => {
    const blocks = extractBlocks('Software Engineer\nNeosoft Technologies\nJan 2022 - Present');
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0].heading, 'Software Engineer');
    assert.ok(blocks[0].content.includes('Neosoft'));
  });

  test('blank line splits into two blocks', () => {
    const text = 'Block One\nline two\n\nBlock Two\nline four';
    const blocks = extractBlocks(text);
    assert.equal(blocks.length, 2);
    assert.equal(blocks[0].heading, 'Block One');
    assert.equal(blocks[1].heading, 'Block Two');
  });

  test('multiple blank lines between paragraphs treated as one separator', () => {
    const text = 'Block One\nline\n\n\n\nBlock Two\nline';
    const blocks = extractBlocks(text);
    assert.equal(blocks.length, 2);
  });

  test('heading is first line of each paragraph', () => {
    const text = 'First Heading\nsome content here\n\nSecond Heading\nmore content';
    const blocks = extractBlocks(text);
    assert.equal(blocks[0].heading, 'First Heading');
    assert.equal(blocks[1].heading, 'Second Heading');
  });

  test('content is rest of paragraph joined', () => {
    const text = 'Heading\nLine A\nLine B\nLine C';
    const blocks = extractBlocks(text);
    assert.ok(blocks[0].content.includes('Line A'));
    assert.ok(blocks[0].content.includes('Line B'));
    assert.ok(blocks[0].content.includes('Line C'));
  });

  test('single-line paragraph → heading is the text, content is empty string', () => {
    const text = 'Just a heading\n\nAnother heading';
    const blocks = extractBlocks(text);
    assert.equal(blocks[0].heading, 'Just a heading');
    assert.equal(blocks[0].content, '');
  });

  test('real resume with 3 sections → 3+ blocks', () => {
    const text = [
      'John Doe',
      'john@example.com | +91 9999999999',
      '',
      'Software Engineer',
      'Neosoft Technologies',
      'Jan 2022 - Present',
      'Built REST APIs using Node.js',
      '',
      'Education',
      'B.Tech Computer Science',
      'Mumbai University 2018-2022',
    ].join('\n');
    const blocks = extractBlocks(text);
    assert.ok(blocks.length >= 3, `Expected >= 3 blocks, got ${blocks.length}`);
  });
});

// ── computeParseConfidence ────────────────────────────────────────────────────

describe('computeParseConfidence — scoring', () => {
  test('empty parsed object → 0', () => {
    assert.equal(computeParseConfidence({}), 0);
  });

  test('null → 0', () => {
    assert.equal(computeParseConfidence(null), 0);
  });

  test('fully populated parsed → high score (>= 80)', () => {
    const parsed = {
      experienceEntries:    [{ title: 'SWE', description: 'built stuff' }, { title: 'SDE', description: 'more' }],
      extractedSkills:      ['react', 'typescript', 'node.js', 'postgresql', 'docker', 'redis', 'aws', 'git', 'graphql', 'jest', 'prisma'],
      projectEntries:       [{ name: 'App', tools: ['react', 'typescript'], metrics: ['50% faster'] }],
      educationEntries:     ['B.Tech Computer Science 2020'],
      globalMetrics:        ['Reduced load time by 50%'],
      contactInfo:          { email: 'test@test.com', phone: '+91 9999999999' },
      summaryText:          'Experienced software engineer with 5 years building scalable systems.',
    };
    const score = computeParseConfidence(parsed);
    assert.ok(score >= 80, `Expected >= 80, got ${score}`);
  });

  test('single experience entry → 15 pts (not 30)', () => {
    const score = computeParseConfidence({
      experienceEntries: [{ title: 'SWE' }],
    });
    assert.equal(score, 15);
  });

  test('two+ experience entries → 30 pts', () => {
    const score = computeParseConfidence({
      experienceEntries: [{ title: 'SWE' }, { title: 'SDE' }],
    });
    assert.equal(score, 30);
  });

  test('5-9 skills → 10 pts for skills dimension', () => {
    const score = computeParseConfidence({
      extractedSkills: ['react', 'typescript', 'node.js', 'css', 'html'],
    });
    assert.equal(score, 10);
  });

  test('10+ skills → 20 pts for skills dimension', () => {
    const score = computeParseConfidence({
      extractedSkills: ['react', 'typescript', 'node.js', 'css', 'html', 'docker', 'git', 'postgresql', 'redis', 'graphql'],
    });
    assert.equal(score, 20);
  });

  test('project with no tools → 10 pts', () => {
    const score = computeParseConfidence({
      projectEntries: [{ name: 'App', tools: [] }],
    });
    assert.equal(score, 10);
  });

  test('project with tools → 20 pts', () => {
    const score = computeParseConfidence({
      projectEntries: [{ name: 'App', tools: ['react', 'typescript'] }],
    });
    assert.equal(score, 20);
  });

  test('education entry adds 10 pts', () => {
    const score = computeParseConfidence({
      educationEntries: ['B.Tech CS 2022'],
    });
    assert.equal(score, 10);
  });

  test('globalMetrics adds 10 pts', () => {
    const score = computeParseConfidence({
      globalMetrics: ['Reduced latency by 40%'],
    });
    assert.equal(score, 10);
  });

  test('project metrics also satisfy metrics check', () => {
    const score = computeParseConfidence({
      projectEntries: [{ name: 'App', tools: ['react'], metrics: ['50% faster'] }],
    });
    // 10 (project exists) + 10 (tools) = 20 for projects, and metrics check uses project metrics
    assert.ok(score >= 20);
  });

  test('contact info with email + phone → 5 pts', () => {
    const score = computeParseConfidence({
      contactInfo: { email: 'x@x.com', phone: '1234567890' },
    });
    assert.equal(score, 5);
  });

  test('summary text → 5 pts', () => {
    const score = computeParseConfidence({
      summaryText: 'Experienced software engineer with 5 years in backend systems.',
    });
    assert.equal(score, 5);
  });

  test('sparse parse (no experience, few skills) → score < 70', () => {
    const score = computeParseConfidence({
      extractedSkills: ['python'],
      contactInfo:     { email: 'x@x.com' },
    });
    assert.ok(score < 70, `Expected < 70 for sparse parse, got ${score}`);
  });

  test('score never exceeds 100', () => {
    const maxParsed = {
      experienceEntries: new Array(5).fill({ title: 'SWE', description: 'lots' }),
      extractedSkills:   new Array(20).fill('skill').map((s, i) => `${s}${i}`),
      projectEntries:    new Array(5).fill({ name: 'App', tools: ['react'], metrics: ['50x'] }),
      educationEntries:  ['B.Tech CS', 'MBA'],
      globalMetrics:     ['1M+ transactions', '40% reduction'],
      contactInfo:       { email: 'x@x.com', phone: '123' },
      summaryText:       'A very long and detailed professional summary that exceeds 20 chars.',
    };
    assert.equal(computeParseConfidence(maxParsed), 100);
  });
});
