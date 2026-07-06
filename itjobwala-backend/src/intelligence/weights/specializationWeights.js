/**
 * specializationWeights.js
 * Phase 7: Specialization-specific ATS weight maps.
 *
 * Base weights (from scoreCalculator.js's core dimensions, sum = 100):
 *   automation_testing: 25 | api_testing: 20 | framework_expertise: 12
 *   test_design_methodology: 10 | qa_experience: 15 | performance_testing: 10
 *   certifications: 5 | bug_tracking: 5 | ci_cd_readiness: 5
 *
 * (mobile_testing / domain_expertise / resume_quality are optional bonus/
 * informational dimensions layered on top of these 9 core ones in the static
 * score — they're deliberately excluded here too, same as resume_quality,
 * since they're not part of the redistributable 100-point core rubric.)
 *
 * Each map redistributes these 100 points to reflect what recruiters
 * actually prioritize for that specialization. Raw values don't need to sum
 * to exactly 100 themselves — buildEffectiveWeights() re-normalizes after
 * market/seniority adjustments regardless.
 */

export const BASE_WEIGHTS = {
  automation_testing:      25,
  api_testing:             20,
  framework_expertise:     12,
  test_design_methodology: 10,
  qa_experience:           15,
  performance_testing:     10,
  certifications:           5,
  bug_tracking:             5,
  ci_cd_readiness:          5,
};

export const SPEC_WEIGHTS = {
  sdet: {
    automation_testing:      30,
    framework_expertise:     20,
    ci_cd_readiness:         20,
    api_testing:             15,
    qa_experience:            8,
    test_design_methodology:  4,
    performance_testing:      4,
    certifications:           2,
    bug_tracking:             1,
  },
  automation_qa: {
    automation_testing:      35,
    framework_expertise:     25,
    api_testing:             15,
    ci_cd_readiness:         10,
    qa_experience:           10,
    test_design_methodology:  3,
    performance_testing:      3,
    certifications:           1,
    bug_tracking:             1,
  },
  api_testing: {
    api_testing:             40,
    automation_testing:      20,
    framework_expertise:     15,
    qa_experience:           12,
    ci_cd_readiness:          5,
    test_design_methodology:  4,
    performance_testing:      4,
    certifications:           2,
    bug_tracking:             2,
  },
  performance_testing: {
    performance_testing:     40,
    automation_testing:      20,
    framework_expertise:     15,
    api_testing:             12,
    qa_experience:            8,
    ci_cd_readiness:          3,
    test_design_methodology:  1,
    certifications:           1,
    bug_tracking:             1,
  },
  mobile_testing: {
    automation_testing:      30,
    framework_expertise:     22,
    api_testing:             18,
    qa_experience:           15,
    performance_testing:      8,
    ci_cd_readiness:          4,
    test_design_methodology:  2,
    certifications:           2,
    bug_tracking:             1,
  },
  hybrid_qa: {
    automation_testing:      25,
    api_testing:             22,
    framework_expertise:     18,
    qa_experience:           14,
    ci_cd_readiness:         10,
    performance_testing:      7,
    test_design_methodology:  2,
    certifications:           2,
    bug_tracking:             2,
  },
  manual_qa: {
    qa_experience:           25,
    bug_tracking:            20,
    api_testing:             18,
    automation_testing:      15,
    framework_expertise:     10,
    certifications:           8,
    test_design_methodology:  4,
    performance_testing:      2,
    ci_cd_readiness:          2,
  },
};

// Dimension labels for display
export const DIMENSION_LABELS = {
  automation_testing:      'Automation Testing',
  api_testing:             'API Testing',
  framework_expertise:     'Framework Expertise',
  test_design_methodology: 'Test Design & Methodology',
  qa_experience:           'QA Experience',
  performance_testing:     'Performance Testing',
  certifications:          'Certifications',
  bug_tracking:            'Bug Tracking',
  ci_cd_readiness:         'CI/CD Readiness',
};

// Rationale for weight shifts per specialization
export const WEIGHT_RATIONALE = {
  sdet: {
    ci_cd_readiness:     'SDET roles require CI/CD pipeline ownership — 4× higher than baseline',
    automation_testing:  'Core SDET competency — automation engineering at framework level',
    framework_expertise: 'Framework design is the defining SDET differentiator',
    qa_experience:       'SDET roles value technical depth over years alone',
  },
  automation_qa: {
    automation_testing:  'Automation is the entire job — 40% higher weight than baseline',
    framework_expertise: 'Page Object Model, BDD, and custom frameworks are non-negotiable',
    qa_experience:       'Experience matters but technical tools outweigh years',
  },
  api_testing: {
    api_testing:         'API competence is the primary screening criterion — 2× higher weight',
    automation_testing:  'Automation skills complement but do not define this specialization',
    qa_experience:       'Domain knowledge in API testing matters significantly',
  },
  performance_testing: {
    performance_testing: 'Performance is the entire focus — 4× higher weight than baseline',
    automation_testing:  'Script automation for performance is essential',
    api_testing:         'API load testing is core to performance QA work',
  },
  mobile_testing: {
    automation_testing:  'Appium/XCUITest expertise is the primary mobile QA signal',
    framework_expertise: 'Mobile test framework depth is the key differentiator',
    api_testing:         'Mobile APIs and integration testing are heavily tested',
  },
  hybrid_qa: {
    ci_cd_readiness:     'Hybrid QA bridges dev and QA pipelines — CI/CD is critical',
    api_testing:         'API testing rounds out the hybrid profile',
    framework_expertise: 'Multi-framework depth is the hybrid QA differentiator',
  },
  manual_qa: {
    qa_experience:       'Manual QA is experience-led — domain knowledge carries more weight',
    bug_tracking:        'Bug lifecycle management is the core manual QA skill',
    certifications:      'ISTQB and QA certs matter significantly for manual profiles',
    automation_testing:  'Some automation awareness expected but not the primary signal',
  },
};
