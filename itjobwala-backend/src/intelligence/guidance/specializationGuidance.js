/**
 * specializationGuidance.js
 * Guides candidates through QA specialization transitions.
 * Tells them exactly what to add to evolve their QA career path.
 */

const TRANSITIONS = {
  manual_qa: {
    label:             'Manual QA',
    target:            'automation_qa',
    target_label:      'Automation QA Engineer',
    difficulty:        'Beginner-Friendly',
    timeline:          '2-3 months with focused practice',
    gap_skills:        ['Selenium or Playwright', 'Postman for API testing', 'TestNG or JUnit', 'JIRA'],
    gap_description:   'You have solid QA fundamentals. The next step is adding automation tooling — recruiters are actively filtering for automation skills in any mid+ role.',
    transition_steps: [
      'Pick one automation tool: Playwright (modern) or Selenium (enterprise standard)',
      'Automate 3-5 test cases on a public demo site (e.g. SauceDemo, Swag Labs)',
      'Add Postman API tests for any REST API you have access to',
      'Publish your work on GitHub — visible portfolio matters',
    ],
    encouragement: 'Your manual testing foundation gives you strong domain knowledge that makes automation much easier to learn.',
  },
  automation_qa: {
    label:             'Automation QA',
    target:            'sdet',
    target_label:      'SDET',
    difficulty:        'Intermediate',
    timeline:          '3-6 months with real project work',
    gap_skills:        ['Jenkins or GitHub Actions CI/CD', 'Docker for test execution', 'API automation layer', 'Reusable framework design'],
    gap_description:   'You have strong automation skills. SDET is the next tier — it requires showing you can build infrastructure, not just write tests.',
    transition_steps: [
      'Build a Page Object Model framework from scratch and host it on GitHub',
      'Set up a GitHub Actions pipeline that runs your tests on every commit',
      'Add REST Assured or Playwright API tests to your automation suite',
      'Add Docker execution and Allure reporting to your framework',
    ],
    encouragement: 'SDETs are among the highest-paid QA professionals — your automation foundation puts you 60% of the way there.',
  },
  api_testing: {
    label:             'API QA',
    target:            'hybrid_qa',
    target_label:      'Hybrid QA Engineer',
    difficulty:        'Moderate',
    timeline:          '2-4 months',
    gap_skills:        ['Selenium or Playwright for UI automation', 'CI/CD pipeline integration', 'Cucumber BDD'],
    gap_description:   'Your API testing expertise is a strong differentiator. Adding UI automation makes you a versatile hybrid QA — significantly expanding your job match range.',
    transition_steps: [
      'Add Playwright or Selenium UI tests to complement your existing API tests',
      'Create a CI/CD pipeline that runs both API and UI tests together',
      'Add Cucumber BDD for product team collaboration',
    ],
    encouragement: 'API testing skills are rare — combined with UI automation, you become a highly sought full-spectrum QA engineer.',
  },
  hybrid_qa: {
    label:             'Hybrid QA',
    target:            'sdet',
    target_label:      'SDET',
    difficulty:        'Moderate',
    timeline:          '2-4 months',
    gap_skills:        ['Docker containerized execution', 'Framework architecture documentation', 'Advanced CI/CD pipeline design'],
    gap_description:   'Your full-spectrum coverage is excellent. SDET promotion requires demonstrating infrastructure ownership and enterprise-grade framework design.',
    transition_steps: [
      'Add Docker and containerized test execution to your framework',
      'Document your test architecture for team adoption',
      'Implement distributed parallel execution',
    ],
    encouragement: 'You are one of the most versatile QA profiles — SDET is a natural elevation of your existing breadth.',
  },
  sdet: {
    label:             'SDET',
    target:            'sdet',
    target_label:      'QA Architect / Lead SDET',
    difficulty:        'Advanced',
    timeline:          '6-12 months',
    gap_skills:        ['Team leadership and mentoring', 'QA strategy and standards definition', 'Kubernetes / distributed execution', 'Engineering leadership communication'],
    gap_description:   'You have reached the technical ceiling. The next evolution is leadership — owning QA strategy at an organizational level.',
    transition_steps: [
      'Define QA standards and documentation for your engineering team',
      'Mentor junior QA engineers in framework design',
      'Present quality metrics and risk analysis to leadership',
      'Explore Kubernetes for distributed test infrastructure',
    ],
    encouragement: 'QA Architects are in the top 5% of QA compensation. Your SDET foundation is the right starting point.',
  },
  performance_testing: {
    label:             'Performance QA',
    target:            'sdet',
    target_label:      'Performance SDET',
    difficulty:        'Moderate',
    timeline:          '3-5 months',
    gap_skills:        ['Selenium/Playwright for functional + performance combined suites', 'Grafana/InfluxDB dashboards', 'Jenkins nightly performance regression'],
    gap_description:   'Performance QA is a high-value niche. Adding automation and CI/CD positioning makes you a full-spectrum Performance SDET — rare in the market.',
    transition_steps: [
      'Add Grafana dashboards to your existing performance test reports',
      'Set up Jenkins nightly performance regression pipelines',
      'Add a basic Selenium/Playwright functional test layer',
    ],
    encouragement: 'Performance SDET is one of the rarest and highest-paid QA specializations in the market.',
  },
  mobile_testing: {
    label:             'Mobile QA',
    target:            'sdet',
    target_label:      'Mobile SDET',
    difficulty:        'Moderate',
    timeline:          '3-5 months',
    gap_skills:        ['Appium framework architecture (not just scripts)', 'Jenkins mobile CI pipeline', 'Real device cloud integration (BrowserStack / AWS Device Farm)'],
    gap_description:   'Mobile QA skills are in high demand in fintech and consumer apps. Building a framework and CI pipeline positions you as a Mobile SDET — a premium specialization.',
    transition_steps: [
      'Build a reusable Appium POM framework for Android + iOS',
      'Add Jenkins pipeline for automated mobile regression',
      'Integrate BrowserStack or AWS Device Farm for real device testing',
    ],
    encouragement: 'Mobile SDET is among the most sought-after specializations in fintech and consumer-facing product companies.',
  },
};

/**
 * Generate specialization-aware transition guidance.
 */
export function generateSpecializationGuidance({ qa_specialization = 'manual_qa', qa_score_breakdown = {}, qa_seniority = 'junior' }) {
  const path = TRANSITIONS[qa_specialization] ?? TRANSITIONS['manual_qa'];

  // At lead seniority, cap transition steps to strategic ones
  const steps = qa_seniority === 'lead'
    ? path.transition_steps.slice(0, 2)
    : path.transition_steps;

  return {
    current_specialization:      qa_specialization,
    current_label:               path.label,
    transition_target:           path.target,
    transition_target_label:     path.target_label,
    difficulty:                  path.difficulty,
    estimated_timeline:          path.timeline,
    gap_skills:                  path.gap_skills,
    gap_description:             path.gap_description,
    transition_steps:            steps,
    encouragement:               path.encouragement,
  };
}
