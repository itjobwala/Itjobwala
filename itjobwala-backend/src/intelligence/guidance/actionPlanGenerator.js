/**
 * actionPlanGenerator.js
 * Generates a 30/60/90 day action plan tailored to specialization + seniority + top gaps.
 * Gives candidates a concrete, sequenced execution plan — not just a list of skills.
 */

const BASE_PLANS = {
  manual_qa: {
    thirty: [
      'Pick Playwright (modern) or Selenium (enterprise) — commit to one and install it locally',
      'Complete 2 beginner tutorials: automate login + search on a public demo site (SauceDemo)',
      'Set up a JIRA free account and practice creating defect reports with steps + severity',
    ],
    sixty: [
      'Build a 5-test Playwright/Selenium suite covering a full user flow (login → checkout)',
      'Learn Postman basics: create a collection with 3 API assertions for a free REST API',
      'Push your automation project to GitHub with a clear README',
    ],
    ninety: [
      'Add a TestNG/JUnit runner to your automation project and generate an HTML test report',
      'Apply for 5 automation-adjacent roles with your GitHub project in your resume',
      'Start ISTQB Foundation Level preparation — 30 min/day reading',
    ],
  },
  automation_qa: {
    thirty: [
      'Build a Page Object Model framework from scratch for your current test suite',
      'Set up a GitHub repository with proper folder structure and Maven/Gradle build file',
      'Add REST Assured (Java) or Playwright API module for your first API test layer',
    ],
    sixty: [
      'Create a GitHub Actions workflow that runs your tests on every push',
      'Add Allure or Extent HTML reporting with retry logic',
      'Write 3 API tests that validate response schema + status codes',
    ],
    ninety: [
      'Add Docker containerization to your test execution environment',
      'Document your framework architecture in the README with diagrams',
      'Apply for SDET and Senior QA Automation roles — your framework is now a portfolio differentiator',
    ],
  },
  api_testing: {
    thirty: [
      'Add a Playwright or Selenium UI test layer to your existing API project',
      'Build a shared utility module that works across both API and UI tests',
      'Create a GitHub Actions pipeline that runs API + UI tests together',
    ],
    sixty: [
      'Add Cucumber BDD scenarios that cover 3-5 critical user flows',
      'Set up a Postman Newman run in your CI pipeline',
      'Add contract testing basics using Pact or JSON Schema validation',
    ],
    ninety: [
      'Build a combined API + UI regression suite that runs in under 10 minutes',
      'Write a short blog post or README explaining your API testing approach (portfolio signal)',
      'Target Hybrid QA Engineer and Full-Stack QA roles with your combined framework',
    ],
  },
  hybrid_qa: {
    thirty: [
      'Add Docker support for running your test suite in a containerized environment',
      'Set up Selenium Grid or Playwright parallel execution in your framework',
      'Document your test architecture — a one-page diagram + folder structure explanation',
    ],
    sixty: [
      'Add performance test basics using K6 or JMeter for your main user flows',
      'Implement a reporting dashboard (Allure + GitHub Pages or similar)',
      'Contribute to or create an open source QA tool or test helper library',
    ],
    ninety: [
      'Apply for SDET and Senior QA Automation Engineer roles — your breadth is a differentiator',
      'Present a QA metrics summary to your current team or include it in your resume',
      'Start ISTQB Advanced Technical Test Analyst preparation',
    ],
  },
  sdet: {
    thirty: [
      'Define QA quality gates and standards documentation for your current engineering team',
      'Set up distributed parallel execution using Kubernetes or Selenium Grid at scale',
      'Mentor 1-2 junior QA engineers — document your mentoring approach',
    ],
    sixty: [
      'Build a quality metrics dashboard and present it to your engineering leadership',
      'Design a scalable test architecture spec for onboarding new team members',
      'Explore chaos engineering basics: latency injection and failure scenario testing',
    ],
    ninety: [
      'Publish a technical article or talk about your QA architecture approach',
      'Apply for QA Lead, QA Architect, or Staff SDET roles',
      'Pursue ISTQB Expert Level or cloud/Kubernetes certifications',
    ],
  },
  performance_testing: {
    thirty: [
      'Add Grafana + InfluxDB dashboards to your existing JMeter/K6 test output',
      'Set up a Jenkins nightly performance regression pipeline for your main APIs',
      'Learn Playwright basics: automate 3 functional tests to complement your performance tests',
    ],
    sixty: [
      'Build a combined performance + functional test suite with shared CI/CD pipeline',
      'Add threshold-based CI failure gates (e.g. fail build if p95 > 2000ms)',
      'Write a performance baseline report for your key endpoints',
    ],
    ninety: [
      'Add chaos engineering basics: simulate network latency + server failures',
      'Target Performance SDET and SRE-aligned QA roles in fintech/e-commerce',
      'Pursue ISTQB Advanced Performance Testing certification',
    ],
  },
  mobile_testing: {
    thirty: [
      'Build a reusable Appium Page Object Model framework for Android (add iOS later)',
      'Set up a Jenkins/GitHub Actions pipeline for automated mobile regression',
      'Configure BrowserStack or AWS Device Farm for real device test execution',
    ],
    sixty: [
      'Add API automation tests alongside your mobile UI tests in the same CI pipeline',
      'Implement parallel test execution across Android + iOS in the CI pipeline',
      'Add Allure reporting for mobile test runs with device/OS metadata',
    ],
    ninety: [
      'Target Mobile SDET and Mobile Automation Lead roles in fintech/consumer apps',
      'Document your mobile test architecture for portfolio and interview preparation',
      'Pursue Appium certification or ISTQB Advanced Mobile Testing',
    ],
  },
};

function injectTopPrioritySkill(plan, improvement_priorities) {
  const topSkill = improvement_priorities?.high_priority?.[0];
  if (!topSkill) return plan;

  const skillName = topSkill.skill;
  const injected = `Add "${skillName}" to your profile: complete one tutorial + add it to a project this month`;

  return {
    ...plan,
    thirty_day_plan: [injected, ...plan.thirty_day_plan.slice(0, 2)],
  };
}

/**
 * Generate a 30/60/90 day action plan.
 */
export function generateActionPlan({
  qa_specialization    = 'manual_qa',
  qa_seniority         = 'junior',
  improvement_priorities = {},
  weak_evidence_skills = [],
}) {
  const base = BASE_PLANS[qa_specialization] ?? BASE_PLANS.manual_qa;

  // For senior/lead, trim beginner-level steps and keep strategic ones
  let plan = {
    thirty_day_plan:  [...base.thirty],
    sixty_day_plan:   [...base.sixty],
    ninety_day_plan:  [...base.ninety],
  };

  if (qa_seniority === 'fresher') {
    plan.sixty_day_plan  = base.sixty.slice(0, 2);
    plan.ninety_day_plan = base.ninety.slice(0, 2);
  }

  // Inject the top priority skill into the 30-day plan
  plan = injectTopPrioritySkill(plan, improvement_priorities);

  // Inject evidence-strengthening task when tracked skills have no proof
  if (weak_evidence_skills.length > 0) {
    const top = weak_evidence_skills.slice(0, 3).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ');
    const evidenceTask = `Strengthen resume evidence for: ${top}. For each tool, add: (1) what you built/automated, (2) a measurable outcome (e.g. "reduced regression time by 30%"), (3) how it connected to CI/CD or a project.`;
    plan.thirty_day_plan = [evidenceTask, ...plan.thirty_day_plan.slice(0, 2)];
  }

  return plan;
}
