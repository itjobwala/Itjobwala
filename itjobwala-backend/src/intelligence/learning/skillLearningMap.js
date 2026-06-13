/**
 * skillLearningMap.js
 * Phase 3: Rich learning content per QA skill.
 * Each entry is a complete learning guide — project, resource, difficulty, certification.
 */

export const SKILL_LEARNING_MAP = {

  playwright: {
    difficulty:        'Beginner-Friendly',
    estimated_hours:   20,
    why_important:     'Playwright is the fastest-growing automation tool — now in 78% of automation QA job postings. Recruiters in 2025 actively filter for it over Selenium for greenfield projects.',
    project_idea:      'Build a Playwright test suite for SauceDemo (saucedemo.com): automate login, add-to-cart, checkout, and logout flows. Add Allure reporting and push to GitHub.',
    project_outcome:   'A live GitHub portfolio project that passes in CI — interviewers ask to see this.',
    free_resource:     'Official Playwright docs: playwright.dev/docs/intro — takes ~4 hours to cover the basics',
    practice_site:     'saucedemo.com (free demo e-commerce app)',
    certification:     null,
    recruiter_impact:  'Very High',
    stack_tag:         'JavaScript / TypeScript',
  },

  cypress: {
    difficulty:        'Beginner-Friendly',
    estimated_hours:   18,
    why_important:     'Cypress dominates frontend QA interviews — built-in time-travel debugging makes it fast to demo to interviewers.',
    project_idea:      'Automate a React Todo app or the Cypress real-world app (github.com/cypress-io/cypress-realworld-app) — cover CRUD flows with custom commands.',
    project_outcome:   'A Cypress project with fixtures, custom commands, and CI on GitHub Actions.',
    free_resource:     'Cypress official docs (docs.cypress.io) + free course on Test Automation University (testautomationu.applitools.com)',
    practice_site:     'cypress-realworld-app (official demo)',
    certification:     null,
    recruiter_impact:  'High',
    stack_tag:         'JavaScript',
  },

  selenium: {
    difficulty:        'Beginner-Friendly',
    estimated_hours:   25,
    why_important:     'Selenium is the most-tested skill across enterprise QA — it appears in 82% of job descriptions. Even teams moving to Playwright require Selenium knowledge for legacy maintenance.',
    project_idea:      'Build a Java Selenium + TestNG + Maven project: automate 5 test cases on the OrangeHRM demo site (orangehrm.com). Add Page Object Model structure.',
    project_outcome:   'A POM-structured Java project with a CI-ready pom.xml — the standard enterprise portfolio piece.',
    free_resource:     'Selenium official docs (selenium.dev) + Ashot Singh YouTube channel for Java Selenium tutorials',
    practice_site:     'orangehrm.com or automationexercise.com',
    certification:     null,
    recruiter_impact:  'High',
    stack_tag:         'Java / Python',
  },

  jenkins: {
    difficulty:        'Intermediate',
    estimated_hours:   15,
    why_important:     'Jenkins CI/CD is explicitly required in 80%+ of senior QA and SDET roles. Without it, automation portfolios look incomplete.',
    project_idea:      'Add a Jenkins pipeline to your existing Selenium or Playwright project. Create a Jenkinsfile that installs dependencies, runs tests, and archives HTML reports.',
    project_outcome:   'A working Jenkinsfile in your GitHub repo with a screenshot of a successful pipeline run.',
    free_resource:     'Jenkins official docs (jenkins.io/doc/tutorials) — focus on "Pipeline" and "Blue Ocean" sections',
    practice_site:     'Install Jenkins locally via Docker: docker run -p 8080:8080 jenkins/jenkins:lts',
    certification:     null,
    recruiter_impact:  'High',
    stack_tag:         'DevOps / CI-CD',
  },

  'github actions': {
    difficulty:        'Beginner-Friendly',
    estimated_hours:   8,
    why_important:     'GitHub Actions is the fastest-growing CI/CD signal in QA pipelines — interviewers consider it a modern SDET indicator.',
    project_idea:      'Add a .github/workflows/tests.yml to your Playwright or Selenium project. Configure it to run on every push to main. Show the green badge in your README.',
    project_outcome:   'A green CI badge on your GitHub repo README — visible proof of pipeline integration.',
    free_resource:     'GitHub Actions official docs (docs.github.com/en/actions) — "Quickstart" section is sufficient',
    practice_site:     'Any existing GitHub repo',
    certification:     null,
    recruiter_impact:  'Very High',
    stack_tag:         'DevOps / CI-CD',
  },

  docker: {
    difficulty:        'Intermediate',
    estimated_hours:   12,
    why_important:     'Dockerized test execution in SDET roles shows infrastructure ownership — a key signal that separates SDETs from automation engineers.',
    project_idea:      'Dockerize your existing test suite. Create a Dockerfile that installs Chrome headless + your test runner. Push to Docker Hub and reference it in your GitHub Actions pipeline.',
    project_outcome:   'A Docker image that runs your tests in isolation — demonstrable in interviews.',
    free_resource:     'Docker official "Get Started" (docs.docker.com/get-started) — chapters 1-3 are enough',
    practice_site:     'Play with Docker (labs.play-with-docker.com — free browser-based Docker environment)',
    certification:     'Docker Certified Associate (optional, enterprise signal)',
    recruiter_impact:  'High',
    stack_tag:         'Infrastructure',
  },

  'rest assured': {
    difficulty:        'Intermediate',
    estimated_hours:   20,
    why_important:     'REST Assured is the top Java API testing library — it addresses a critical gap for Java-stack QA engineers and appears in 62% of enterprise Java QA JDs.',
    project_idea:      'Write REST Assured API tests against a free public API (e.g., reqres.in or jsonplaceholder.typicode.com): cover GET, POST, PUT, DELETE with response schema validation using Hamcrest.',
    project_outcome:   'A Maven project with REST Assured tests, schema validation, and a CI pipeline.',
    free_resource:     'rest-assured.io/usage — official documentation, plus Rahul Shetty Academy YouTube videos',
    practice_site:     'reqres.in (free REST API mock for testing)',
    certification:     null,
    recruiter_impact:  'High',
    stack_tag:         'Java / API',
  },

  postman: {
    difficulty:        'Beginner-Friendly',
    estimated_hours:   8,
    why_important:     'Postman is the entry-level API testing signal — it appears in 67% of QA JDs and is the first tool recruiters check for API testing evidence.',
    project_idea:      'Build a Postman collection for a public REST API (e.g., Petstore or ReqRes). Add pre-request scripts, test assertions, environment variables, and export the collection to GitHub.',
    project_outcome:   'A published Postman collection on your GitHub with a README explaining your API coverage.',
    free_resource:     'Postman Learning Center (learning.postman.com) — "API Testing" module is free',
    practice_site:     'petstore.swagger.io (official OpenAPI demo)',
    certification:     'Postman API Fundamentals Student Expert (free, shareable badge)',
    recruiter_impact:  'High',
    stack_tag:         'API',
  },

  appium: {
    difficulty:        'Intermediate',
    estimated_hours:   30,
    why_important:     'Appium is the #1 mobile automation requirement in fintech and consumer apps — mobile SDET is the rarest and highest-paid QA niche.',
    project_idea:      'Automate a sample Android app (use the ApiDemos APK from Appium samples): cover login, list navigation, and a form submission. Add a Page Object Model structure.',
    project_outcome:   'A working Appium POM project on GitHub targeting Android. Add a screen recording of the test run.',
    free_resource:     'appium.io/docs + Automation Step by Step YouTube channel for Appium beginners',
    practice_site:     'ApiDemos.apk (bundled with Appium) or Sauce Labs device emulators',
    certification:     'ISTQB Advanced Mobile Testing (available)',
    recruiter_impact:  'High',
    stack_tag:         'Mobile / Java',
  },

  cucumber: {
    difficulty:        'Beginner-Friendly',
    estimated_hours:   12,
    why_important:     'BDD/Cucumber signals Agile QA collaboration — expected in product-led companies and required in 52% of QA JDs.',
    project_idea:      'Add a Cucumber BDD layer to your existing Selenium or Playwright project. Write 5 feature files with step definitions for core user flows (login, search, checkout).',
    project_outcome:   'A BDD-structured project where test scenarios read like English — highly demo-able to product stakeholders.',
    free_resource:     'cucumber.io/docs — official documentation, plus the "BDD with Cucumber" course on Test Automation University (free)',
    practice_site:     'Any existing automation project',
    certification:     null,
    recruiter_impact:  'Moderate',
    stack_tag:         'BDD / Agile',
  },

  testng: {
    difficulty:        'Beginner-Friendly',
    estimated_hours:   8,
    why_important:     'TestNG is the Java test runner expected in 60% of enterprise QA stacks — without it your Java automation projects look incomplete.',
    project_idea:      'Add TestNG to your Selenium project: configure testng.xml for parallel execution, add @DataProvider for data-driven tests, and generate an HTML report.',
    project_outcome:   'A test suite demonstrating parallel execution and data-driven testing — two common interview questions.',
    free_resource:     'testng.org/doc — official docs. Naveen AutomationLabs YouTube for practical examples.',
    practice_site:     'Any existing Java Selenium project',
    certification:     null,
    recruiter_impact:  'Moderate',
    stack_tag:         'Java',
  },

  jmeter: {
    difficulty:        'Intermediate',
    estimated_hours:   15,
    why_important:     'JMeter is the standard performance testing tool in enterprises — opens performance QA roles which have lower competition than automation.',
    project_idea:      'Load test a free public API (e.g., reqres.in): simulate 50 concurrent users, add assertions for response time < 2s, and generate an HTML report with graphs.',
    project_outcome:   'A JMeter .jmx file on GitHub with a sample HTML report — interviewers want to see your threshold configuration.',
    free_resource:     'jmeter.apache.org/usermanual — official manual. BlazeMeter YouTube channel for tutorials.',
    practice_site:     'reqres.in or blazedemo.com (free JMeter demo target)',
    certification:     'ISTQB Advanced Performance Testing',
    recruiter_impact:  'Moderate',
    stack_tag:         'Performance',
  },

  k6: {
    difficulty:        'Beginner-Friendly',
    estimated_hours:   10,
    why_important:     'K6 is replacing JMeter in modern stacks — JavaScript-based, CI-friendly, and growing fast in 2025 QA job postings.',
    project_idea:      'Write a K6 script to load test a public API: define stages (ramp-up → peak → ramp-down), add thresholds, and output results to a terminal dashboard. Add to GitHub Actions.',
    project_outcome:   'A K6 script that runs in CI with configurable thresholds — the modern performance testing portfolio piece.',
    free_resource:     'k6.io/docs — official docs + k6.io/blog for real-world examples',
    practice_site:     'test.k6.io (official K6 test target)',
    certification:     null,
    recruiter_impact:  'High',
    stack_tag:         'Performance / JavaScript',
  },

  jira: {
    difficulty:        'Beginner-Friendly',
    estimated_hours:   4,
    why_important:     'JIRA is listed in nearly every QA job description — absence is a visible gap to recruiters. It signals professional defect lifecycle experience.',
    project_idea:      'Create a free Jira Software project (atlassian.com/jira/free): define a sprint, log 10 bugs with severity/priority/steps to reproduce, move them through the defect lifecycle. Screenshot your workflow.',
    project_outcome:   'Screenshots of a real Jira board in your portfolio or resume — shows professional QA workflow.',
    free_resource:     'Atlassian University (university.atlassian.com) — Jira Fundamentals is free',
    practice_site:     'Jira Cloud free tier (up to 10 users)',
    certification:     'Atlassian Certified Professional (optional)',
    recruiter_impact:  'Moderate',
    stack_tag:         'Tools / Agile',
  },

  testrail: {
    difficulty:        'Beginner-Friendly',
    estimated_hours:   4,
    why_important:     'TestRail demonstrates structured test management experience — a soft filter at enterprise QA teams.',
    project_idea:      'Sign up for a free TestRail trial: create a test plan with 20 test cases for a sample web app, run them, and export a summary report.',
    project_outcome:   'Familiarity with test case management — mentionable in interviews as professional QA methodology experience.',
    free_resource:     'TestRail official docs (support.testrail.com) — Getting Started guide',
    practice_site:     'TestRail free trial (testrail.com/free)',
    certification:     null,
    recruiter_impact:  'Moderate',
    stack_tag:         'Tools',
  },

  gatling: {
    difficulty:        'Intermediate',
    estimated_hours:   15,
    why_important:     'Gatling is gaining enterprise adoption in banking and high-traffic QA teams — a strong differentiator for performance QA roles.',
    project_idea:      'Write a Gatling simulation in Scala targeting a public API: define virtual users, ramp-up scenarios, and assertions. Generate and review the HTML report.',
    project_outcome:   'A Gatling simulation on GitHub with an exported HTML report — niche skill that stands out.',
    free_resource:     'gatling.io/docs — official documentation + Gatling Academy (free introductory course)',
    practice_site:     'computer-database.gatling.io (official Gatling demo site)',
    certification:     null,
    recruiter_impact:  'Moderate',
    stack_tag:         'Performance / Scala',
  },

  'page object model': {
    difficulty:        'Beginner-Friendly',
    estimated_hours:   6,
    why_important:     'POM is the fundamental automation architecture pattern — interviewers test POM understanding in every senior QA interview.',
    project_idea:      'Refactor any existing Selenium or Playwright project to follow strict POM: BasePage class, one page class per page, all locators as private variables. Add a README explaining the architecture.',
    project_outcome:   'A well-structured project that demonstrates framework design skills — the #1 thing interviewers check.',
    free_resource:     'Selenium WebDriver with Java - Basics to Advanced + Frameworks (Udemy free coupon) or YouTube: Ashot Singh POM tutorials',
    practice_site:     'Any existing automation project',
    certification:     null,
    recruiter_impact:  'Moderate',
    stack_tag:         'Architecture',
  },

  'contract testing': {
    difficulty:        'Advanced',
    estimated_hours:   20,
    why_important:     'Contract testing is a rare differentiator — signals advanced API QA thinking valued in microservices-heavy teams.',
    project_idea:      'Set up Pact (pact.io) between two services: write consumer and provider contracts, verify them in CI, and publish to a Pact Broker. Document the flow in your README.',
    project_outcome:   'A working Pact contract test setup — an extremely rare portfolio piece that gets interview callbacks.',
    free_resource:     'pact.io/getting_started — official docs + Pact YouTube channel',
    practice_site:     'Pact workshop on GitHub (search: pact-foundation/pact-workshop)',
    certification:     null,
    recruiter_impact:  'High',
    stack_tag:         'API / Microservices',
  },

  kubernetes: {
    difficulty:        'Advanced',
    estimated_hours:   30,
    why_important:     'Kubernetes knowledge signals senior SDET / DevOps QA alignment — expected for QA Architect and Lead SDET roles.',
    project_idea:      'Deploy a Selenium Grid on Kubernetes using Helm: configure hub + node pods, run 3 parallel browser tests, and capture pod logs. Document the setup in a README.',
    project_outcome:   'A Kubernetes-based distributed test grid — a clear SDET/Architect-level portfolio differentiator.',
    free_resource:     'kubernetes.io/docs/tutorials (free) + KodeKloud free Kubernetes for beginners course',
    practice_site:     'Play with Kubernetes (labs.play-with-k8s.com — free)',
    certification:     'Certified Kubernetes Application Developer (CKAD)',
    recruiter_impact:  'Moderate',
    stack_tag:         'Infrastructure',
  },

  istqb: {
    difficulty:        'Beginner-Friendly',
    estimated_hours:   40,
    why_important:     'ISTQB certification is a recruiter trust signal and soft filter at enterprise employers — it standardizes QA vocabulary and shows professional commitment.',
    project_idea:      'Study the ISTQB Foundation Level syllabus (free PDF at istqb.org), practice 3 mock exams on Guru99 or AmbySoft, then schedule the exam via an accredited provider.',
    project_outcome:   'ISTQB Foundation Level certificate — a permanent, globally recognized credential.',
    free_resource:     'ISTQB Syllabus PDF (istqb.org) + free mock exams at guru99.com/istqb.html',
    practice_site:     'ambystqb.com (free ISTQB mock exams)',
    certification:     'ISTQB Foundation Level (recommended starting point)',
    recruiter_impact:  'Moderate',
    stack_tag:         'Certification',
  },

  'graphql testing': {
    difficulty:        'Intermediate',
    estimated_hours:   12,
    why_important:     'GraphQL API testing is an emerging differentiator in modern API-first stacks — few candidates can test GraphQL and it stands out immediately.',
    project_idea:      'Write Postman or Playwright tests against a public GraphQL API (e.g., countries.trevorblades.com): cover queries, mutations, schema introspection, and error handling.',
    project_outcome:   'A GraphQL test collection on GitHub — proves API depth beyond REST.',
    free_resource:     'graphql.org/learn (official) + Postman GraphQL testing docs',
    practice_site:     'countries.trevorblades.com or spacex-production.up.railway.app (free public GraphQL APIs)',
    certification:     null,
    recruiter_impact:  'Moderate',
    stack_tag:         'API / GraphQL',
  },
};

/**
 * Look up learning data for a skill (case-insensitive, partial match).
 * @param {string} skill
 * @returns {object|null}
 */
export function getLearningData(skill) {
  const key = skill.toLowerCase().trim();
  if (SKILL_LEARNING_MAP[key]) return SKILL_LEARNING_MAP[key];

  // Partial match fallback
  for (const [mapKey, val] of Object.entries(SKILL_LEARNING_MAP)) {
    if (key.includes(mapKey) || mapKey.includes(key)) return val;
  }
  return null;
}
