/**
 * certificationAdvisor.js
 * Phase 3: Recommends a certification path based on specialization + seniority.
 * Always includes a free option — not everyone can afford paid exams.
 */

const CERT_PATHS = {
  manual_qa: {
    primary:     { name: 'ISTQB Foundation Level', cost: 'Paid (~₹8,000–₹12,000)', timeline: '4-6 weeks', why: 'The most recognized QA certification globally — a clear recruiter filter signal' },
    secondary:   { name: 'Postman API Fundamentals Student Expert', cost: 'Free', timeline: '1 week', why: 'Free, shareable badge that proves API testing awareness' },
    free_option: { name: 'ISTQB Self-Study (syllabus + mock exams)', cost: 'Free (exam fee only)', timeline: '4 weeks', why: 'Download the free ISTQB syllabus and practice mock exams before scheduling the paid exam' },
    skip_if:     null,
  },
  automation_qa: {
    primary:     { name: 'ISTQB Foundation Level', cost: 'Paid (~₹8,000–₹12,000)', timeline: '4-6 weeks', why: 'Required foundation before pursuing Advanced Technical Test Analyst' },
    secondary:   { name: 'Selenium WebDriver with Java/Python certification (Udemy)', cost: 'Paid (~₹499 on sale)', timeline: '3-4 weeks', why: 'Practical automation skill verification — widely accepted in Indian IT market' },
    free_option: { name: 'Test Automation University — Full Path', cost: 'Free', timeline: '6-8 weeks', why: 'Applitools TAU offers multiple free courses covering Selenium, Cypress, Playwright, API testing' },
    skip_if:     null,
  },
  sdet: {
    primary:     { name: 'ISTQB Advanced — Technical Test Analyst', cost: 'Paid', timeline: '8-12 weeks', why: 'The SDET-level ISTQB certification — demonstrates framework design and technical depth' },
    secondary:   { name: 'Jenkins CI/CD Certification (CloudBees)', cost: 'Paid', timeline: '2-3 weeks', why: 'Validates CI/CD pipeline expertise expected in senior SDET roles' },
    free_option: { name: 'Docker + Kubernetes for Developers (KodeKloud free tier)', cost: 'Free', timeline: '4 weeks', why: 'Directly relevant to SDET infrastructure skills — free hands-on labs' },
    skip_if:     null,
  },
  api_testing: {
    primary:     { name: 'Postman API Fundamentals Student Expert', cost: 'Free', timeline: '1 week', why: 'The most visible API testing certification — shareable Postman badge' },
    secondary:   { name: 'ISTQB Foundation Level', cost: 'Paid', timeline: '4-6 weeks', why: 'Foundational QA credential that supports any specialization' },
    free_option: { name: 'API Testing Masterclass on Test Automation University', cost: 'Free', timeline: '3 weeks', why: 'Comprehensive free API testing course covering REST, GraphQL, and contract testing' },
    skip_if:     null,
  },
  hybrid_qa: {
    primary:     { name: 'ISTQB Advanced — Technical Test Analyst', cost: 'Paid', timeline: '8-12 weeks', why: 'Validates the technical depth expected in a hybrid QA role' },
    secondary:   { name: 'Docker Certified Associate (DCA)', cost: 'Paid', timeline: '4-6 weeks', why: 'Infrastructure certification that elevates hybrid profiles toward SDET territory' },
    free_option: { name: 'Test Automation University — Full Path (Selenium + API + BDD tracks)', cost: 'Free', timeline: '8 weeks', why: 'Covers the breadth of skills needed for hybrid QA — free with certificates' },
    skip_if:     null,
  },
  performance_testing: {
    primary:     { name: 'ISTQB Advanced — Performance Testing', cost: 'Paid', timeline: '6-8 weeks', why: 'The only ISTQB cert specific to performance testing — a strong differentiator' },
    secondary:   { name: 'BlazeMeter University (JMeter + Performance)', cost: 'Free', timeline: '3 weeks', why: 'Free performance testing courses from the JMeter/BlazeMeter ecosystem' },
    free_option: { name: 'K6 Performance Testing with GitHub Actions (k6.io blog tutorials)', cost: 'Free', timeline: '1-2 weeks', why: 'Hands-on tutorials that result in a working portfolio project' },
    skip_if:     null,
  },
  mobile_testing: {
    primary:     { name: 'ISTQB Advanced — Mobile Application Testing', cost: 'Paid', timeline: '6-8 weeks', why: 'Mobile-specific ISTQB certification — extremely rare, strong differentiator' },
    secondary:   { name: 'Appium Certification (LambdaTest / BrowserStack Academy)', cost: 'Free to low-cost', timeline: '3 weeks', why: 'Validates mobile automation expertise in the framework most recruiters test' },
    free_option: { name: 'BrowserStack Academy — Mobile Testing Fundamentals', cost: 'Free', timeline: '1-2 weeks', why: 'Free courses from BrowserStack covering mobile testing concepts and Appium basics' },
    skip_if:     null,
  },
};

export function getCertificationAdvice(qa_specialization, qa_seniority) {
  const path = CERT_PATHS[qa_specialization] ?? CERT_PATHS.manual_qa;

  // For freshers/juniors, lead with the free option
  const recommended_first = (qa_seniority === 'fresher' || qa_seniority === 'junior')
    ? path.free_option
    : path.primary;

  const recommended_next = (qa_seniority === 'fresher' || qa_seniority === 'junior')
    ? path.primary
    : path.secondary;

  const advice = qa_seniority === 'fresher'
    ? 'Start with the free option to build confidence before investing in paid exams.'
    : qa_seniority === 'junior'
    ? 'The primary certification will unlock mid-level screening filters at enterprise employers.'
    : 'Your seniority level makes the Advanced-level certification the best ROI — foundational certs are redundant now.';

  return {
    recommended_first,
    recommended_next,
    free_option:    path.free_option,
    advice,
  };
}
