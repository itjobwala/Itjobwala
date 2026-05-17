'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SmartNavbar from '@/src/components/SmartNavbar';
import ProtectedRoute from '@/src/components/auth/ProtectedRoute';
import EditProfileHeader, { type EditableProfile } from './EditProfileHeader';
import EditAboutSection from './EditAboutSection';
import EditSkillsSection from './EditSkillsSection';
import EditExperienceSection, { type EditableExperience } from './EditExperienceSection';
import EditEducationSection, { type EditableEducation } from './EditEducationSection';
import EditCertificationSection, { type EditableCertification } from './EditCertificationSection';
import ProfileEditSidebar from './ProfileEditSidebar';

const INITIAL_PROFILE: EditableProfile = {
  fullName: 'Priya Sharma',
  title: 'Senior QA Automation Engineer',
  experienceYears: '6',
  expectedSalary: '',
  currentSalary: '',
  workStatus: '',
  availabilityToJoin: '',
  email: 'priya.sharma@example.com',
  phone: '+91 98765 43210',
  location: 'Bengaluru, India',
  github: '',
  linkedIn: '',
  openToWork: false,
};

const INITIAL_ABOUT =
  'Senior QA Automation Engineer with 6 years of experience building reliable automation frameworks for web and mobile products. Strong background in Playwright, Cypress, API testing, CI pipelines, and release quality ownership.';

const INITIAL_SKILLS = ['Playwright', 'Cypress', 'TypeScript', 'API Testing', 'CI/CD', 'Postman', 'Selenium'];

const INITIAL_EXPERIENCE: EditableExperience[] = [
  {
    id: 'exp-1',
    company: 'TechNova Solutions',
    role: 'Senior QA Automation Engineer',
    employment_type: 'Full-time',
    location: '',
    start_date: '2021-04',
    end_date: '',
    is_current: true,
    description: 'Owned automation strategy for core SaaS workflows, improved regression reliability, and partnered with engineering teams on release readiness.',
    skills: ['Playwright', 'TypeScript', 'API Testing'],
  },
  {
    id: 'exp-2',
    company: 'BlueStack Labs',
    role: 'QA Engineer',
    employment_type: 'Full-time',
    location: '',
    start_date: '2018-06',
    end_date: '2021-03',
    is_current: false,
    description: 'Built smoke and regression suites, documented quality risks, and supported mobile and web releases.',
    skills: ['Selenium', 'Postman', 'Jira'],
  },
];

const INITIAL_EDUCATION: EditableEducation[] = [
  {
    id: 'edu-1',
    institution: 'PES University',
    degree: 'B.Tech Computer Science',
    field_of_study: 'Computer Science',
    location: '',
    start_date: '2014',
    end_date: '2018',
    grade: '',
    is_current: false,
  },
];

const INITIAL_CERTIFICATIONS: EditableCertification[] = [
  {
    id: 'cert-1',
    name: 'ISTQB Certified Tester',
    issuer: 'ISTQB',
    issue_date: '2020-08',
  },
  {
    id: 'cert-2',
    name: 'Playwright Automation Professional',
    issuer: 'Test Automation University',
    issue_date: '2023-02',
  },
];

export default function ProfileEditPageClient() {
  const router = useRouter();
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [about, setAbout] = useState(INITIAL_ABOUT);
  const [skills, setSkills] = useState(INITIAL_SKILLS);
  const [experiences, setExperiences] = useState(INITIAL_EXPERIENCE);
  const [education, setEducation] = useState(INITIAL_EDUCATION);
  const [certifications, setCertifications] = useState(INITIAL_CERTIFICATIONS);
  const [saving, setSaving] = useState(false);

  function handleSave() {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      router.push('/profile');
    }, 900);
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f9fafb]">
        <SmartNavbar />

        <div className="pt-[68px]">
          <div className="bg-white border-b border-gray-100">
            <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-[18px] font-extrabold text-[#0f172a] tracking-[-0.3px]">
                    Edit Profile
                  </h1>
                  <p className="text-[13px] text-gray-400 mt-0.5">
                    Update your profile and keep recruiter-facing details fresh
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[12px] text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-semibold">Draft changes</span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
              <div className="flex flex-col gap-5 min-w-0">
                <EditProfileHeader profile={profile} onChange={setProfile} />
                <EditAboutSection value={about} onChange={setAbout} />
                <EditSkillsSection skills={skills} onChange={setSkills} />
                <EditExperienceSection experiences={experiences} onChange={setExperiences} />
                <EditEducationSection education={education} onChange={setEducation} />
                <EditCertificationSection certifications={certifications} onChange={setCertifications} />
              </div>

              <div className="flex flex-col gap-5 lg:sticky lg:top-24">
                <ProfileEditSidebar
                  completion={82}
                  saving={saving}
                  lastUpdated="Today at 10:42 AM"
                  onSave={handleSave}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
