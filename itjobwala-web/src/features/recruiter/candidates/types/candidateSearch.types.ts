export interface CandidateSearchFilters {
  q?:                 string;
  skills?:            string;
  location?:          string;
  experience_min?:    number;
  experience_max?:    number;
  qa_specialization?: string;
  qa_seniority?:      string;
  min_qa_score?:      number;
  open_to_work?:      boolean;
  sort?:              'relevance' | 'experience' | 'recent';
  page?:              number;
  limit?:             number;
}

export interface CandidateCard {
  id:                string;    // 'candidate_<n>'
  name:              string;
  title:             string | null;
  location:          string | null;
  experience_years:  number;
  skills:            string[];
  open_to_work:      boolean;
  profile_photo_url: string | null;
  qa_specialization: string | null;
  qa_seniority:      string | null;
  qa_match_score:    number | null;
}

export interface SkillEvidenceEntry {
  skill:          string;
  evidence_level: string;
  evidence_score: number;
  proof_sources:  string[];
}

export interface SkillMetadataEntry {
  skill:          string;
  occurrences:    number;
  sources:        string[];
  evidence_level: string;
  confidence:     number;
}

export interface CandidateDetail extends CandidateCard {
  about:                string | null;
  work_status:          string | null;
  availability_to_join: string | null;
  linked_in:            string | null;
  github:               string | null;
  profile_completion:   number;
  career_level:         string | null;
  ats_score:            number | null;
  capability_score:     number | null;
  strengths:            string[] | null;
  weaknesses:           string[] | null;
  recruiter_insights:   Record<string, unknown> | null;
  qa_score_breakdown:   Record<string, unknown> | null;
  skill_evidence:       SkillEvidenceEntry[] | null;
  skill_metadata:       SkillMetadataEntry[] | null;
  weak_evidence_skills: string[] | null;
}

export interface CandidateSearchPagination {
  page:        number;
  limit:       number;
  total:       number;
  pages:       number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CandidateSearchResult {
  candidates:  CandidateCard[];
  pagination:  CandidateSearchPagination;
}

export type SavedCandidateEntry = {
  save_id:   number;
  list_name: string;
  note:      string | null;
  saved_at:  string;
  candidate: (CandidateCard & { available: true }) | { id: string; available: false };
};

export interface TalentPoolResult {
  candidates:  SavedCandidateEntry[];
  list_names:  string[];
  pagination:  CandidateSearchPagination;
}
