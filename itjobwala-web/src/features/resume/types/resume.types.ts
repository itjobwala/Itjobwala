export type ScoreBand = 'Excellent' | 'Great' | 'Good' | 'Fair' | 'Needs Work';
export type BandColor = 'emerald' | 'green' | 'blue' | 'amber' | 'red';

export interface ScoreSection {
  score: number;
  max:   number;
}

export interface ScoreBreakdown {
  contact_info:    ScoreSection;
  skills:          ScoreSection;
  experience:      ScoreSection;
  education:       ScoreSection;
  projects:        ScoreSection;
  certifications:  ScoreSection;
  summary:         ScoreSection;
  readability:     ScoreSection;
  keyword_density: ScoreSection;
}

export interface ContactInfo {
  name:     string | null;
  email:    string | null;
  phone:    string | null;
  linkedin: string | null;
  github:   string | null;
}

export interface ExperienceEntry {
  title:       string;
  company:     string;
  duration:    string;
  description: string;
}

export interface EducationEntry {
  degree:      string;
  institution: string;
  year:        number | null;
}

export interface ProjectEntry {
  name:        string;
  description: string;
}

export interface ResumeInsights {
  id:                       number;
  ats_score:                number;
  profile_completion_score: number;
  band_label:               ScoreBand;
  band_color:               BandColor;
  score_breakdown:          ScoreBreakdown;
  extracted_skills:         string[];
  missing_skills:           string[];
  suggested_keywords:       string[];
  strengths:                string[];
  weaknesses:               string[];
  suggestions:              string[];
  contact_info:             ContactInfo;
  experience_entries:       ExperienceEntry[];
  education_entries:        EducationEntry[];
  project_entries:          ProjectEntry[];
  certification_entries:    string[];
  experience_years:         number;
  total_skills_found:       number;
  word_count:               number;
  last_parsed_at:           string;
  resume_url:               string | null;
}

export interface JobMatchResult {
  job_id:           number;
  job_title:        string;
  company:          string | null;
  parsed:           boolean;
  overall_score:    number | null;
  skill_score:      number;
  title_score:      number;
  experience_score: number;
  matched_skills:   string[];
  missing_skills:   string[];
  total_job_skills: number;
  recommendation:   string;
}

export interface ParseResumePayload {
  resume_url?: string;
}
