export type ScoreBand = 'Elite / Highly Competitive' | 'Advanced QA Engineer' | 'Strong QA Match' | 'Developing Automation QA' | 'Foundational QA' | 'Very Early Stage';
export type BandColor = 'emerald' | 'green' | 'blue' | 'amber' | 'orange' | 'red';

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

export interface QaScoreBreakdown {
  automation_testing:  ScoreSection;
  api_testing:         ScoreSection;
  framework_expertise: ScoreSection;
  performance_testing: ScoreSection;
  qa_experience:       ScoreSection;
  certifications:      ScoreSection;
  bug_tracking:        ScoreSection;
  ci_cd_readiness:     ScoreSection;
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
  name:           string;
  description:    string;
  entity_type?:   'parent_project' | 'subsystem';
  project_domain?: string;
}

export type QaSeniority     = 'junior' | 'mid-level' | 'senior' | 'lead';
export type QaSpecialization = 'sdet' | 'automation_qa' | 'api_testing' | 'mobile_testing' | 'performance_testing' | 'hybrid_qa' | 'manual_qa';
export type RecruiterConfidence = 'very_low' | 'low' | 'medium' | 'high';
export type CareerLevel     = 'fresher' | 'junior' | 'mid_level' | 'senior' | 'lead';

export interface SkillMetadata {
  skill:          string;
  occurrences:    number;
  sources:        string[];
  confidence:     number;
  evidence_level: EvidenceLevel;
}

export interface SkillStrengthSummary {
  very_strong: number;
  strong:      number;
  moderate:    number;
  weak:        number;
  inferred:    number;
}

export interface ResumeInsights {
  id:                       number;
  eligible:                 boolean;
  reason?:                  'non_qa_resume';

  // ── QA scores ───────────────────────────────────────────────────────────────
  qa_match_score:           number;
  capability_score:         number | null;
  qa_score_breakdown:       QaScoreBreakdown;

  // ── Hiring intelligence ──────────────────────────────────────────────────────
  qa_hiring_label:           string             | null;
  qa_specialization:         QaSpecialization   | null;
  specialization_confidence: number             | null;
  recruiter_confidence:      RecruiterConfidence | null;
  career_level:              CareerLevel        | null;

  // ── Profile & band ──────────────────────────────────────────────────────────
  profile_completion_score: number;
  band_label:               ScoreBand;
  band_color:               BandColor;

  // ── Parsed content ──────────────────────────────────────────────────────────
  extracted_skills:         string[];
  missing_skills:           string[];
  suggested_keywords:       string[];
  weaknesses:               string[];
  suggestions:              string[];
  experience_entries:       ExperienceEntry[];
  education_entries:        EducationEntry[];
  project_entries:          ProjectEntry[];
  experience_years:         number;
  total_skills_found:       number;
  last_parsed_at:           string;
  resume_url:               string | null;

  // ── Structured profile convenience fields ───────────────────────────────────
  name:                     string | null;
  email:                    string | null;
  current_title:            string | null;
  current_company:          string | null;
  skill_metadata:           SkillMetadata[];
  skill_strength_summary:   SkillStrengthSummary;
  certifications:           string[];
  certification_count:      number;
  achievements:             string[];

  // ── Domain intelligence ──────────────────────────────────────────────────────
  detected_domain:          string;
  domain_confidence:        number;
  domain_label?:            string; // only present for ineligible (non-QA / invalid) rows

  // ── Guidance intelligence ────────────────────────────────────────────────────
  improvement_priorities:   ImprovementPriorities  | null;
  score_explanations:       ScoreExplanations      | null;
  career_roadmap:           CareerRoadmap          | null;
  recruiter_readiness:      RecruiterReadiness     | null;
  improvement_impacts:      ImprovementImpact[]    | null;
  specialization_guidance:  SpecializationGuidance | null;
  recruiter_insights:       RecruiterInsights      | null;
  action_plan:              ActionPlan             | null;

  // ── Evidence intelligence ────────────────────────────────────────────────────
  evidence_profile:         EvidenceProfile        | null;
  skill_evidence:           SkillEvidenceItem[]    | null;
  skill_timeline:           Record<string, string[]> | null;
  weak_evidence_skills:     string[]               | null;

  // ── Phase 4 + 5 intelligence ─────────────────────────────────────────────────
  trust_breakdown:          TrustBreakdown         | null;
  skill_recency:            Record<string, SkillRecencyItem> | null;
  recency_summary:          RecencySummary         | null;
  authenticity_profile:     AuthenticityProfile    | null;
  risk_flags:               RiskFlag[]             | null;
  overall_risk_score:       number                 | null;
  overall_risk_level:       OverallRiskLevel       | null;
  trajectory_profile:       TrajectoryProfile      | null;
  first_impression:         FirstImpression        | null;
}

// ── Phase 4 intelligence types ────────────────────────────────────────────────

export type RecencyClassification  = 'recent' | 'aging' | 'stale' | 'unknown';
export type RecencyConfidence      = 'high' | 'medium' | 'low';
export type RecencySource          = 'experience' | 'project' | 'certification' | 'skills_only' | 'inferred';
export type SkillDepthLevel        = 'architected' | 'production' | 'applied' | 'exposed' | 'mentioned';
export type TrajectorySignal       = 'accelerating' | 'stable' | 'emerging' | 'exploratory' | 'declining' | 'unproven';
export type TrajectoryConfidence   = 'high' | 'medium' | 'low';
export type CoherenceLevel         = 'high' | 'moderate' | 'low';
export type RiskSeverity           = 'low' | 'medium' | 'high' | 'critical';
export type OverallRiskLevel       = 'low' | 'moderate' | 'high' | 'critical';
export type RecommendationMode     = 'credibility_building' | 'capability_building' | 'specialization_building';
export type InterviewDecision      = 'Strong Shortlist' | 'Shortlist with Verification' | 'Junior Pool' | 'Needs More Content' | 'Pass';

export interface SkillRecencyItem {
  classification:         RecencyClassification;
  recency_confidence:     RecencyConfidence;
  recency_source:         RecencySource;
  explicit_year_detected: boolean;
  last_used_year:         number | null;
  recency_sensitive:      boolean;
}

export interface RecencySummary {
  recent_skills:        number;
  aging_skills:         number;
  stale_skills:         number;
  unknown_skills:       number;
  high_confidence_count: number;
}

export interface RiskFlag {
  flag:             string;
  severity:         RiskSeverity;
  impact_score:     number;
  explanation:      string;
  recruiter_effect: string;
}

export interface ToolchainCoherence {
  score:                      number;
  coherence_level:            CoherenceLevel;
  suspicious_combinations:    string[];
  strongest_coherent_cluster: string[];
  explanation:                string;
}

export interface TrustSignal {
  signal:  string;
  impact:  'high' | 'medium' | 'low';
  note:    string;
}

export interface TrustBreakdown {
  positive:          TrustSignal[];
  negative:          TrustSignal[];
  fastest_trust_gain: string;
}

export interface AuthenticityProfile {
  score:                           number;
  toolchain_coherence:             ToolchainCoherence | null;
  strongest_authenticity_signal:   string | null;
  biggest_authenticity_risk:       string | null;
  explanation:                     string;
}

export interface TrajectoryProfile {
  signal:                    TrajectorySignal;
  trajectory_confidence:     TrajectoryConfidence;
  trajectory_evidence_score: number;
  explanation:               string;
  strongest_growth_signal:   string | null;
  biggest_stagnation_risk:   string | null;
}

export interface FirstImpression {
  recruiter_reaction:       string;
  likely_interview_decision: InterviewDecision;
  biggest_positive_signal:  string | null;
  biggest_red_flag:         string | null;
}

export interface EnterpriseProfileEntry {
  label:       string;
  score:       number;
  description: string;
}

export interface EnterpriseProfileScores {
  profiles:    Record<string, EnterpriseProfileEntry> | null;
  best_fit:    string | null;
  best_label:  string | null;
  best_score:  number | null;
}

// ── Evidence intelligence types ───────────────────────────────────────────────

export type EvidenceLevel    = 'strong' | 'moderate' | 'basic' | 'weak';
export type EvidenceStrength = 'strong' | 'moderate' | 'basic' | 'weak';
export type InflationRisk    = 'none'   | 'low'      | 'moderate' | 'high';
export type ImplMaturity     = 'expert' | 'advanced' | 'moderate' | 'basic' | 'minimal';
export type ExperienceDepth  = 'deep'   | 'solid'    | 'moderate' | 'shallow' | 'minimal';

export interface SkillEvidenceSignals {
  project_usage:          boolean;
  quantified_impact:      boolean;
  framework_depth:        boolean;
  ci_cd_usage:            boolean;
  architecture_mentions:  boolean;
}

export interface SkillEvidenceItem {
  skill:           string;
  evidence_score:  number;
  evidence_level:  EvidenceLevel;
  depth_level:     SkillDepthLevel;
  proof_sources:   string[];
  signals:         SkillEvidenceSignals;
}

export interface EvidenceProfile {
  recruiter_trust_score:   number;
  evidence_strength:       EvidenceStrength;
  implementation_maturity: ImplMaturity;
  experience_depth:        ExperienceDepth;
  keyword_stuffing_risk:   InflationRisk;
  evidence_density:        number;
  proven_skills_count:     number;
  weak_evidence_count:     number;
  has_quantified_impact:   boolean;
  has_architecture_depth:  boolean;
  has_cicd_integration:    boolean;
  calibration_delta:       number;
}

// ── Guidance types ─────────────────────────────────────────────────────────────

export interface PrioritySkill {
  skill:     string;
  score:     number;
  dimension: string;
  reason:    string;
}

export interface ImprovementPriorities {
  high_priority:   PrioritySkill[];
  medium_priority: PrioritySkill[];
  low_priority:    PrioritySkill[];
}

export interface ScoreExplanations {
  score_summary:        string;
  biggest_strengths:    string[];
  biggest_score_losses: string[];
  recruiter_concerns:   string[];
  evidence_warnings:    string[];  // evidence-aware: skills listed without proof
}

export interface CareerRoadmap {
  current_role:               string;
  next_role_target:           string;
  specialization_target:      string;
  roadmap_steps:              string[];
  estimated_growth_impact:    string;
  estimated_timeline:         string;
  recommended_projects:       string[];
  recommended_certifications: string[];
}

export interface RecruiterReadiness {
  shortlist_probability:    number;
  market_readiness:         string;
  recruiter_visibility:     string;
  hiring_risk:              string;
  enterprise_readiness:     string;
  automation_maturity:      string;
  career_growth_potential:  string;
}

export interface ImprovementImpact {
  skill:                string;
  estimated_score_gain: string;
  recruiter_impact:     string;
  reasoning:            string;
  dimension:            string;
}

export interface SpecializationGuidance {
  current_specialization:    string;
  current_label:             string;
  transition_target:         string;
  transition_target_label:   string;
  difficulty:                string;
  estimated_timeline:        string;
  gap_skills:                string[];
  gap_description:           string;
  transition_steps:          string[];
  encouragement:             string;
}

export interface RecruiterInsights {
  recruiter_summary: string;
  hiring_risk:       string;
  best_fit_roles:    string[];
  concerns:          string[];
  recruiter_tip:     string;
}

export interface ActionPlan {
  thirty_day_plan:  string[];
  sixty_day_plan:   string[];
  ninety_day_plan:  string[];
}

export interface JobMatchResult {
  job_id:               number;
  job_title:            string;
  company:              string | null;
  parsed:               boolean;
  overall_score:        number | null;
  fit_score:            number | null;
  skill_score:          number;
  title_score:          number;
  experience_score:     number;
  matched_skills:       string[];
  missing_skills:       string[];
  total_job_skills:     number;
  recommendation:       string;
  resume_domain:        string;
  job_domain:           string;
  domain_match:         boolean;
  // QA hiring intelligence
  fit_reasons:          string[];
  matching_strengths:   string[];
  missing_requirements: string[];
}

export interface ParseResumePayload {
  resume_url?: string;
}

// ── Phase 2: Market Intelligence ─────────────────────────────────────────────

export interface SkillDemandEntry {
  skill:        string;
  demand_pct:   number;
  demand_level: string;
  trend:        string;
  trend_label:  string;
  trend_color:  string;
  category:     string;
  db_signal:    boolean;
}

export interface SpecDemandEntry {
  spec:        string;
  label:       string;
  pct:         number;
  demand_pct:  number;
  trend:       string;
  insight:     string;
  salary_band: string;
  competition: string;
  db_signal:   boolean;
}

export interface TrendingSkillEntry {
  skill:      string;
  demand_pct: number;
  label:      string;
}

export interface RisingSpecEntry {
  spec:       string;
  label:      string;
  demand_pct: number;
  insight:    string;
}

export interface HighDemandSkillToAdd {
  skill:      string;
  demand_pct: number;
  trend:      string;
}

export interface MarketIntelligenceResult {
  // Market-wide data
  trending_skills:          TrendingSkillEntry[];
  top_demanded_skills:      SkillDemandEntry[];
  specialization_demand:    SpecDemandEntry[];
  rising_specializations:   RisingSpecEntry[];
  market_highlights:        string[];
  platform_stats:           { active_jobs_analyzed: number; data_source: string; last_updated: string };

  // Personal market alignment
  market_demand_score:            number | null;
  recruiter_demand_level:         string | null;
  specialization_demand_pct:      number | null;
  specialization_trend:           string | null;
  skill_alignment_score:          number | null;
  demonstrated_alignment_score:   number | null;  // keyword score × evidence credibility
  high_demand_skills_you_have:    string[];
  high_demand_skills_to_add:      HighDemandSkillToAdd[];
  market_tip:                     string | null;
}

// ── Phase 7: Dynamic ATS Weight Engine ───────────────────────────────────────

export type WeightDirection = 'up' | 'down' | 'same';

export interface DimensionWeight {
  dimension:        string;
  label:            string;
  base_weight:      number;
  effective_weight: number;
  weight_delta:     number;
  raw_score:        number | null;
  raw_max:          number;
  performance_pct:  number | null;
  dynamic_points:   number | null;
  leverage_score:   number | null;
  rationale:        string | null;
  direction:        WeightDirection;
}

export interface MarketAdjustment {
  dimension: string;
  label:     string;
  delta:     number;
  reason:    string;
}

export interface DynamicWeightResult {
  specialization:               string;
  static_score:                 number | null;
  dynamic_score:                number | null;
  score_delta:                  number | null;
  dimensions:                   DimensionWeight[];
  highest_leverage_dimension:   string | null;
  weight_insight:               string;
  market_adjustments:           MarketAdjustment[];
  seniority_applied:            string | null;
  credibility_adjustment:       number | null;
  enterprise_profiles:          EnterpriseProfileScores | null;
}

// ── Phase 6: Candidate Benchmarking System ───────────────────────────────────

export type TierColor = 'emerald' | 'cyan' | 'blue' | 'amber' | 'red';

export interface BenchmarkResult {
  candidate_score:             number;
  percentile_rank:             number;
  benchmark_tier:              string;
  tier_color:                  TierColor;
  peer_count:                  number;
  platform_avg_score:          number | null;
  platform_median_score:       number | null;
  top_quartile_threshold:      number;
  top_10pct_threshold:         number;
  score_gap_to_average:        number;
  score_gap_to_top:            number;
  skills_top_candidates_have:  string[];
  competitive_insight:         string;
  data_source:                 string;
  score_model_version:         number;
}

// ── Phase 5: Recruiter Feedback Learning Loop ────────────────────────────────

export type HiringOutcome = 'shortlisted' | 'interview' | 'hired' | 'rejected';

export interface HiringSignal {
  id:               number;
  outcome:          HiringOutcome;
  qa_score_at_time: number | null;
  qa_specialization: string | null;
  qa_seniority:     string | null;
  feedback_note:    string | null;
  created_at:       string;
}

export interface HiringSummary {
  total_signals:        number;
  shortlist_count:      number;
  interview_count:      number;
  hired_count:          number;
  rejected_count:       number;
  shortlist_rate:       number;
  avg_positive_score:   number | null;
  avg_rejection_score:  number | null;
  recruiter_notes:      string[];
  has_notes:            boolean;
  insight:              string;
}

export interface HiringSignalsResult {
  signals: HiringSignal[];
  summary: HiringSummary | null;
}

// ── Phase 4: Resume Version History + Progress Tracking ──────────────────────

export interface ResumeVersionSnapshot {
  id:                       number;
  candidate_id:             number;
  version_number:           number;
  qa_match_score:           number | null;
  profile_completion_score: number | null;
  qa_specialization:        string | null;
  qa_seniority:             string | null;
  recruiter_confidence:     string | null;
  skills_count:             number;
  missing_count:            number;
  parsed_at:                string;
}

export type ProgressTrend = 'improving' | 'declining' | 'stable';

export interface ResumeProgress {
  current_score:            number;
  previous_score:           number | null;
  score_delta:              number;
  skills_delta:             number;
  best_score:               number;
  total_parses:             number;
  days_since_first:         number;
  trend:                    ProgressTrend;
  spec_changed:             boolean;
  previous_specialization:  string | null;
  current_specialization:   string | null;
  milestone:                string;
}

export interface ResumeProgressResult {
  versions: ResumeVersionSnapshot[];
  progress: ResumeProgress | null;
}

// ── Phase 3: Learning Resource Intelligence ───────────────────────────────────

export interface CertItem {
  name:     string;
  cost:     string;
  timeline: string;
  why:      string;
}

export interface CertificationAdvice {
  recommended_first: CertItem;
  recommended_next:  CertItem;
  free_option:       CertItem;
  advice:            string;
}

export interface FreeResource {
  name: string;
  url:  string | null;
}

export interface LearningPathItem {
  order:            number;
  skill:            string;
  urgency:          'high' | 'medium' | 'low';
  dimension:        string;
  why_important:    string;
  project_idea:     string;
  project_outcome:  string;
  free_resource:    FreeResource;
  practice_site:    string;
  difficulty:       string;
  estimated_hours:  number;
  certification:    string | null;
  recruiter_impact: string;
  stack_tag:        string;
  reason:           string;
}

export interface LearningInvestment {
  total_hours:       number;
  estimated_weeks:   number;
  weekly_commitment: string;
  summary:           string;
}

export interface LearningRecommendations {
  learning_path:        LearningPathItem[];
  learning_investment:  LearningInvestment;
  certification_advice: CertificationAdvice | null;
  top_skill:            string | null;
  has_learning_data:    boolean;
}

// ── Phase 1: Job Fit Intelligence ─────────────────────────────────────────────

export type FitLevel = 'Excellent Fit' | 'Strong Fit' | 'Partial Fit' | 'Weak Fit' | 'Poor Fit';

export interface JobFitResult {
  job_id:                    number;
  job_title:                 string;
  company:                   string | null;
  parsed:                    boolean;

  // Scores
  overall_qa_quality:        number;
  job_fit_score:             number | null;
  fit_level:                 FitLevel | null;
  tool_overlap_pct:          number;

  // Job context
  inferred_job_spec:         string;
  inferred_job_seniority:    string | null;
  job_required_skills:       string[];

  // Fit analysis
  fit_strengths:             string[];
  fit_gaps:                  string[];
  matched_skills:            string[];
  missing_requirements:      string[];
  high_impact_missing_skills: string[];

  // Recruiter intelligence
  recruiter_fit_summary:     string;
  rejection_risks:           string[];
  shortlist_prediction:      string;
}

// ── Phase 10: Behavioral Hireability Intelligence ─────────────────────────────

export type HireabilityBand = 'Exceptional' | 'Strong' | 'Competent' | 'Developing' | 'Early Career';

export interface BehavioralActionStrength {
  score:       number;
  examples:    string[];
  weak_flags:  string[];
  improvement: string | null;
}

export interface BehavioralQuantification {
  score:       number;
  count:       number;
  examples:    string[];
  improvement: string | null;
}

export interface BehavioralCareerTrajectory {
  score:       number;
  signal:      string;
  explanation: string;
  improvement: string | null;
}

export interface BehavioralLeadership {
  score:       number;
  level:       string;
  indicators:  string[];
  improvement: string | null;
}

export interface BehavioralDepth {
  score:         number;
  word_count:    number;
  project_count: number;
  cert_count:    number;
  improvement:   string | null;
}

export interface BehavioralDimensions {
  action_strength:    BehavioralActionStrength;
  quantification:     BehavioralQuantification;
  career_trajectory:  BehavioralCareerTrajectory;
  leadership:         BehavioralLeadership;
  resume_depth:       BehavioralDepth;
}

export interface BehavioralHireabilityResult {
  parsed:               boolean;
  hireability_score:    number;
  hireability_band:     HireabilityBand;
  dimensions:           BehavioralDimensions;
  strong_behaviors:     string[];
  weak_behaviors:       string[];
  top_behavioral_fix:   string;
  hireability_summary:  string;
}

// ── Phase 9: Semantic Embedding Intelligence ──────────────────────────────────

export interface SemanticHiddenMatch {
  resume_term: string;
  job_term:    string;
}

export interface SemanticThemeAlignment {
  id:               string;
  label:            string;
  job_weight:       number;   // 0–100: how strongly this theme appears in the job
  resume_coverage:  number;   // 0–100: how well resume covers the theme's job terms
  aligned:          boolean;
}

export interface SemanticMatchResult {
  parsed:           boolean;
  job_id:           number;
  job_title:        string;
  semantic_score:   number;           // 0-100 composite
  raw_similarity:   number;           // TF-IDF cosine * 100
  skills_coverage:  number;           // % of job term set covered via synonym expansion
  hidden_matches:   SemanticHiddenMatch[];
  semantic_gaps:    string[];
  theme_alignment:  SemanticThemeAlignment[];
  top_theme:        string | null;
  gap_theme:        string | null;
  semantic_summary: string;
}
