export interface ResumeContact {
  full_name: string;
  title:     string;
  email:     string;
  phone:     string;
  location:  string;
  linkedin:  string;
  github:    string;
  website:   string;
}

export interface ResumeExperience {
  id:         string;
  company:    string;
  role:       string;
  location:   string;
  start_date: string;
  end_date:   string;
  is_current: boolean;
  bullets:    string[];
}

export interface ResumeEducation {
  id:          string;
  institution: string;
  degree:      string;
  field:       string;
  start_year:  string;
  end_year:    string;
  grade:       string;
}

export interface ResumeProject {
  id:          string;
  name:        string;
  description: string;
  link:        string;
  bullets:     string[];
}

export interface ResumeCertification {
  id:             string;
  name:           string;
  issuer:         string;
  issue_date:     string;
  credential_url: string;
}

export interface ResumeContent {
  contact:        ResumeContact;
  summary:        string;
  experiences:    ResumeExperience[];
  education:      ResumeEducation[];
  skills:         string[];
  projects:       ResumeProject[];
  certifications: ResumeCertification[];
  section_order:  string[];
}

export interface ResumeDocument {
  id:         number;
  title:      string;
  template:   string;
  content:    ResumeContent;
  created_at: string;
  updated_at: string;
}

export interface ResumeSummary {
  id:         number;
  title:      string;
  template:   string;
  created_at: string;
  updated_at: string;
}

export const BLANK_CONTENT: ResumeContent = {
  contact: { full_name: '', title: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '' },
  summary: '',
  experiences:    [],
  education:      [],
  skills:         [],
  projects:       [],
  certifications: [],
  section_order:  ['summary', 'experiences', 'education', 'skills', 'projects', 'certifications'],
};
