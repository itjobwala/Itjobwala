/**
 * careerRoadmap.js
 * Generates a recruiter-realistic career progression roadmap.
 * Specific to the candidate's current specialization + seniority level.
 */

const SENIORITY_NEXT = {
  fresher:   'junior',
  junior:    'mid_level',
  mid_level: 'senior',
  senior:    'lead',
  lead:      'lead',
};

const SENIORITY_LABEL = {
  fresher:   'Fresher QA',
  junior:    'Junior QA Engineer',
  mid_level: 'QA Engineer',
  senior:    'Senior QA Engineer',
  lead:      'QA Lead / Architect',
};

// Specialization transition paths
const SPEC_PATHS = {
  manual_qa: {
    next_spec:       'automation_qa',
    next_role:       'Automation QA Engineer',
    growth_impact:   'Automation QA engineers earn 35-50% more than manual QA — one of the highest-ROI career moves in tech',
    steps: [
      'Learn Selenium WebDriver basics with a real web app project',
      'Build a Postman collection with API assertions for a REST API',
      'Set up a TestNG/JUnit test runner with Maven',
      'Add JIRA integration for defect lifecycle tracking',
    ],
    recommended_projects: [
      'E-commerce checkout automation suite (login, cart, payment flow)',
      'REST API testing project with Postman + schema validation',
    ],
    recommended_certifications: ['ISTQB Foundation Level', 'Selenium WebDriver certification'],
    timeline: '2-3 months',
  },
  automation_qa: {
    next_spec:       'sdet',
    next_role:       'SDET (Software Development Engineer in Test)',
    growth_impact:   'SDET roles offer 40-60% compensation premium and are the fastest-growing QA category in enterprise tech',
    steps: [
      'Build a reusable Page Object Model framework from scratch',
      'Set up a Jenkins/GitHub Actions CI pipeline for your test suite',
      'Add Docker containerized test execution with Selenium Grid',
      'Integrate REST Assured or Playwright API automation layer',
      'Add Allure/Extent reporting with retry analysis',
    ],
    recommended_projects: [
      'Enterprise hybrid framework: UI + API automation with CI/CD pipeline',
      'Docker Selenium Grid with parallel cross-browser execution',
      'API contract testing suite with schema validation',
    ],
    recommended_certifications: ['ISTQB Advanced — Technical Test Analyst', 'Jenkins CI/CD certification'],
    timeline: '3-6 months',
  },
  api_testing: {
    next_spec:       'hybrid_qa',
    next_role:       'Hybrid QA Engineer (API + UI)',
    growth_impact:   'Hybrid QA engineers with both API and UI automation are in top 20% of QA hiring demand',
    steps: [
      'Add Playwright or Selenium for UI test automation',
      'Integrate your API tests into a CI/CD pipeline (GitHub Actions)',
      'Build a combined API + UI test framework with shared utilities',
      'Add BDD (Cucumber) layer for product team collaboration',
    ],
    recommended_projects: [
      'Full-stack QA project: API automation + UI automation + CI pipeline',
      'Contract testing suite with consumer-driven contract validation',
    ],
    recommended_certifications: ['ISTQB Foundation Level', 'Postman API testing certification'],
    timeline: '2-4 months',
  },
  hybrid_qa: {
    next_spec:       'sdet',
    next_role:       'SDET / Senior QA Automation Engineer',
    growth_impact:   'SDET with hybrid skills is among the top 10% highest-compensated QA profiles',
    steps: [
      'Build enterprise-grade reusable test framework architecture',
      'Add Docker + Jenkins pipeline for full automation deployment',
      'Add performance testing layer (K6 or JMeter)',
      'Document framework architecture for team adoption',
    ],
    recommended_projects: [
      'Enterprise hybrid framework with Docker + Jenkins + reporting',
      'Performance + functional combined test suite',
    ],
    recommended_certifications: ['ISTQB Advanced Technical Test Analyst', 'Docker certification'],
    timeline: '2-4 months',
  },
  sdet: {
    next_spec:       'sdet',
    next_role:       'Lead SDET / QA Architect',
    growth_impact:   'QA Architect / Lead SDET roles are in the top 5% compensation tier for QA professionals',
    steps: [
      'Design scalable test architecture for team-wide adoption',
      'Implement distributed test execution with Kubernetes',
      'Establish QA strategy and standards documentation',
      'Mentor junior and mid-level QA engineers',
      'Present QA metrics and quality gates to engineering leadership',
    ],
    recommended_projects: [
      'Kubernetes-based distributed test grid for parallel execution',
      'QA strategy and framework documentation for org-wide adoption',
    ],
    recommended_certifications: ['ISTQB Expert Level', 'Kubernetes / Cloud certifications'],
    timeline: '6-12 months',
  },
  performance_testing: {
    next_spec:       'sdet',
    next_role:       'Performance SDET / SRE-aligned QA',
    growth_impact:   'Performance QA with SDET skills is highly valued in fintech, e-commerce, and enterprise SaaS',
    steps: [
      'Add Grafana/InfluxDB integration for performance dashboards',
      'Learn Selenium or Playwright for combined functional + performance suites',
      'Set up Jenkins nightly performance regression pipelines',
      'Add chaos engineering basics (latency injection)',
    ],
    recommended_projects: [
      'End-to-end performance test suite with CI pipeline and dashboards',
      'Combined functional + performance regression framework',
    ],
    recommended_certifications: ['ISTQB Advanced Performance Testing', 'Grafana certification'],
    timeline: '3-5 months',
  },
  mobile_testing: {
    next_spec:       'sdet',
    next_role:       'Mobile SDET / Mobile Automation Lead',
    growth_impact:   'Mobile SDET is a premium niche — fintech and consumer apps pay 25-35% more for mobile automation experts',
    steps: [
      'Build reusable Appium framework with Page Object Model',
      'Add Jenkins/GitHub Actions for mobile test CI pipeline',
      'Add real device testing via BrowserStack or AWS Device Farm',
      'Integrate API automation alongside mobile UI tests',
    ],
    recommended_projects: [
      'Cross-platform mobile automation framework (Android + iOS)',
      'Real device cloud integration with parallel test execution',
    ],
    recommended_certifications: ['Appium certification', 'ISTQB Advanced Mobile Testing'],
    timeline: '3-5 months',
  },
};

function getSeniorityAwareSteps(path, seniority) {
  const steps = [...path.steps];
  if (seniority === 'fresher' || seniority === 'junior') {
    return steps.slice(0, 3);
  }
  return steps;
}

/**
 * Generate a career roadmap based on current specialization and seniority.
 */
export function generateCareerRoadmap({ qa_specialization = 'manual_qa', qa_seniority = 'junior', qa_score_breakdown = {}, missing_skills = [] }) {
  const path = SPEC_PATHS[qa_specialization] ?? SPEC_PATHS['manual_qa'];
  const nextSeniority = SENIORITY_NEXT[qa_seniority] ?? 'mid_level';
  const currentLabel  = SENIORITY_LABEL[qa_seniority] ?? 'QA Professional';
  const nextLabel     = SENIORITY_LABEL[nextSeniority] ?? 'Senior QA';

  const steps = getSeniorityAwareSteps(path, qa_seniority);

  // Determine which roadmap steps are still needed based on missing skills
  const missingLower = missing_skills.map(s => s.toLowerCase());
  const relevantSteps = steps.filter((step, i) => {
    // Always include first step; subsequent steps filtered by missing signal
    if (i === 0) return true;
    const stepLower = step.toLowerCase();
    return missingLower.some(s => stepLower.includes(s)) || i <= 2;
  });

  return {
    current_role:               currentLabel,
    next_role_target:           `${nextSeniority !== qa_seniority ? nextLabel + ' / ' : ''}${path.next_role}`,
    specialization_target:      path.next_spec,
    roadmap_steps:              relevantSteps,
    estimated_growth_impact:    path.growth_impact,
    estimated_timeline:         path.timeline,
    recommended_projects:       path.recommended_projects.slice(0, 2),
    recommended_certifications: path.recommended_certifications.slice(0, 2),
  };
}
