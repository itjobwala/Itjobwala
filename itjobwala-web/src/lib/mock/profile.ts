export interface WorkExperience {
  id: string;
  company: string;
  companyLogo: string;
  companyColorClass: string;
  role: string;
  type: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
  grade: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issuerColorClass: string;
  issuerLogo: string;
  issueDate: string;
  expiryDate: string | null;
  credentialId: string;
}

export interface AppliedJob {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  companyColorClass: string;
  appliedDate: string;
  status: 'applied' | 'interview' | 'rejected' | 'selected';
}

export interface SavedJob {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  companyColorClass: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  savedDate: string;
}

export interface UserProfile {
  name: string;
  initials: string;
  avatarGradientClass: string;
  role: string;
  experienceYears: number;
  location: string;
  email: string;
  phone: string;
  linkedIn: string;
  github: string;
  openToWork: boolean;
  about: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  resumeFileName: string;
  resumeUploadDate: string;
  profileCompletion: number;
}

export const MOCK_PROFILE: UserProfile = {
  name: 'Arjun Mehta',
  initials: 'AM',
  avatarGradientClass: 'from-primary to-blue-400',
  role: 'Senior QA Engineer',
  experienceYears: 5,
  location: 'Bengaluru, Karnataka',
  email: 'arjun.mehta@email.com',
  phone: '+91 98765 43210',
  linkedIn: 'linkedin.com/in/arjunmehta',
  github: 'github.com/arjunmehta',
  openToWork: true,
  about:
    "I'm a passionate QA Engineer with 5+ years of experience building robust test automation frameworks for high-scale fintech and product companies. I specialise in Selenium, Playwright, and Java-based test suites, with a strong focus on CI/CD integration and shift-left testing practices. I thrive in collaborative Agile environments and take pride in delivering zero-defect releases. Currently exploring roles at product-first startups where quality is a first-class citizen.",
  skills: [
    'Selenium', 'Java', 'Playwright', 'TypeScript', 'Python',
    'REST Assured', 'CI/CD', 'Jenkins', 'Docker', 'JIRA',
    'TestNG', 'BDD / Cucumber', 'Appium', 'API Testing', 'Agile',
  ],
  experience: [
    {
      id: 'e1',
      company: 'Razorpay',
      companyLogo: 'R',
      companyColorClass: 'bg-blue-600',
      role: 'Senior SDET',
      type: 'Full-time',
      startDate: 'Jan 2022',
      endDate: '',
      current: true,
      location: 'Bengaluru · Hybrid',
      description:
        'Led automation strategy for Razorpay\'s payment gateway APIs. Built a Playwright-based E2E framework reducing regression time by 60%. Mentored a team of 4 junior SDETs and drove adoption of shift-left testing across 3 product squads.',
    },
    {
      id: 'e2',
      company: 'Freshworks',
      companyLogo: 'F',
      companyColorClass: 'bg-green-600',
      role: 'QA Engineer II',
      type: 'Full-time',
      startDate: 'Jun 2020',
      endDate: 'Dec 2021',
      current: false,
      location: 'Chennai · On-site',
      description:
        'Owned test automation for Freshdesk CRM modules. Developed a Selenium-Java framework integrated with Jenkins CI. Improved sprint defect escape rate from 12% to 3% through rigorous risk-based testing.',
    },
    {
      id: 'e3',
      company: 'Infosys',
      companyLogo: 'I',
      companyColorClass: 'bg-indigo-600',
      role: 'Test Engineer',
      type: 'Full-time',
      startDate: 'Jul 2019',
      endDate: 'May 2020',
      current: false,
      location: 'Pune · On-site',
      description:
        'Executed functional and regression testing for a banking client\'s web application. Wrote 300+ test cases in TestRail and participated in UAT cycles.',
    },
  ],
  education: [
    {
      id: 'ed1',
      institution: 'R.V. College of Engineering',
      degree: 'B.E.',
      field: 'Computer Science & Engineering',
      startYear: 2015,
      endYear: 2019,
      grade: '8.4 CGPA',
    },
    {
      id: 'ed2',
      institution: 'DPS Bengaluru',
      degree: 'Class XII (CBSE)',
      field: 'Science (PCM)',
      startYear: 2013,
      endYear: 2015,
      grade: '94.2%',
    },
  ],
  certifications: [
    {
      id: 'c1',
      name: 'ISTQB Certified Tester – Advanced Level (Test Automation Engineer)',
      issuer: 'ISTQB',
      issuerColorClass: 'bg-primary',
      issuerLogo: 'I',
      issueDate: 'Mar 2023',
      expiryDate: null,
      credentialId: 'ISTQB-ATA-23041',
    },
    {
      id: 'c2',
      name: 'AWS Certified Developer – Associate',
      issuer: 'Amazon Web Services',
      issuerColorClass: 'bg-orange-500',
      issuerLogo: 'A',
      issueDate: 'Sep 2022',
      expiryDate: 'Sep 2025',
      credentialId: 'AWS-DEV-A-2209',
    },
    {
      id: 'c3',
      name: 'Playwright Automation – Expert Certification',
      issuer: 'Udemy',
      issuerColorClass: 'bg-purple-600',
      issuerLogo: 'U',
      issueDate: 'Jan 2023',
      expiryDate: null,
      credentialId: 'UC-PW-EXPERT-2301',
    },
  ],
  resumeFileName: 'Arjun_Mehta_Resume_2024.pdf',
  resumeUploadDate: 'Updated 3 days ago',
  profileCompletion: 75,
};

export const MOCK_APPLIED_JOBS: AppliedJob[] = [
  {
    id: '1',
    title: 'SDET (Automation Engineer)',
    company: 'Razorpay',
    companyLogo: 'R',
    companyColorClass: 'bg-blue-600',
    appliedDate: '2 days ago',
    status: 'interview',
  },
  {
    id: '3',
    title: 'Automation Test Engineer',
    company: 'Swiggy',
    companyLogo: 'S',
    companyColorClass: 'bg-orange-500',
    appliedDate: '5 days ago',
    status: 'applied',
  },
  {
    id: '5',
    title: 'SDET II',
    company: 'Flipkart',
    companyLogo: 'F',
    companyColorClass: 'bg-yellow-600',
    appliedDate: '1 week ago',
    status: 'rejected',
  },
  {
    id: '9',
    title: 'QA Engineer – API & Backend',
    company: 'Postman',
    companyLogo: 'P',
    companyColorClass: 'bg-orange-600',
    appliedDate: '2 weeks ago',
    status: 'selected',
  },
];

export const MOCK_SAVED_JOBS: SavedJob[] = [
  {
    id: '2',
    title: 'Senior QA Engineer',
    company: 'CRED',
    companyLogo: 'C',
    companyColorClass: 'bg-gray-900',
    location: 'Mumbai',
    salaryMin: 20,
    salaryMax: 35,
    savedDate: '1 day ago',
  },
  {
    id: '7',
    title: 'Performance Test Engineer',
    company: 'Freshworks',
    companyLogo: 'F',
    companyColorClass: 'bg-green-600',
    location: 'Remote',
    salaryMin: 16,
    salaryMax: 26,
    savedDate: '3 days ago',
  },
  {
    id: '12',
    title: 'Principal Test Architect',
    company: 'Paytm',
    companyLogo: 'P',
    companyColorClass: 'bg-sky-500',
    location: 'Noida',
    salaryMin: 40,
    salaryMax: 65,
    savedDate: '5 days ago',
  },
];

export const TRENDING_SKILLS = [
  'Playwright', 'k6', 'Cypress', 'GraphQL Testing',
  'AI Testing', 'Contract Testing', 'Chaos Engineering',
];
