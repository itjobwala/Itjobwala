import apiClient from '@/src/lib/api/client';
import type { ApiResponse } from '@/src/types/api';
import type { ResumeInsights, JobMatchResult, ParseResumePayload, JobFitResult, MarketIntelligenceResult, LearningRecommendations, ResumeProgressResult, HiringSignalsResult, BenchmarkResult, DynamicWeightResult, SemanticMatchResult, BehavioralHireabilityResult } from '../types/resume.types';

export class NonQaResumeError extends Error {
  reason:            string;
  detected_domain:   string;
  domain_confidence: number;
  domain_label:      string;

  constructor(message: string, reason: string, detected_domain: string, domain_confidence: number, domain_label: string) {
    super(message);
    this.name              = 'NonQaResumeError';
    this.reason            = reason;
    this.detected_domain   = detected_domain;
    this.domain_confidence = domain_confidence;
    this.domain_label      = domain_label;
  }
}

type ParseResumeResponse = ApiResponse<ResumeInsights> & {
  eligible?:         boolean;
  reason?:           string;
  detected_domain?:  string;
  domain_confidence?: number;
  domain_label?:     string;
};

export async function parseResume(payload: ParseResumePayload = {}): Promise<ResumeInsights> {
  const res = await apiClient.post<ParseResumeResponse>('/resume/parse', payload);
  const body = res.data;

  if (body.eligible === false && body.reason === 'non_qa_resume') {
    throw new NonQaResumeError(
      body.message ?? 'Resume does not belong to the QA domain.',
      body.reason,
      body.detected_domain   ?? '',
      body.domain_confidence ?? 0,
      body.domain_label      ?? '',
    );
  }

  return body.data!;
}

export async function getResumeInsights(): Promise<ResumeInsights> {
  const res = await apiClient.get<ApiResponse<ResumeInsights>>('/resume/insights');
  return res.data.data!;
}

export async function matchResumeToJob(jobId: number): Promise<JobMatchResult> {
  const res = await apiClient.post<ApiResponse<JobMatchResult>>(`/resume/match-job/${jobId}`);
  return res.data.data!;
}

export async function getJobFitAnalysis(jobId: number): Promise<JobFitResult> {
  const res = await apiClient.get<ApiResponse<JobFitResult>>(`/resume/job-fit/${jobId}`);
  return res.data.data!;
}

export async function getMarketIntelligence(): Promise<MarketIntelligenceResult> {
  const res = await apiClient.get<ApiResponse<MarketIntelligenceResult>>('/intelligence/market');
  return res.data.data!;
}

export async function getLearningIntelligence(): Promise<LearningRecommendations> {
  const res = await apiClient.get<ApiResponse<LearningRecommendations>>('/intelligence/learning');
  return res.data.data!;
}

export async function getResumeProgress(): Promise<ResumeProgressResult> {
  const res = await apiClient.get<ApiResponse<ResumeProgressResult>>('/resume/progress');
  return res.data.data!;
}

export async function getResumeHiringSignals(): Promise<HiringSignalsResult> {
  const res = await apiClient.get<ApiResponse<HiringSignalsResult>>('/resume/hiring-signals');
  return res.data.data!;
}

export async function getBenchmarking(): Promise<BenchmarkResult | null> {
  const res = await apiClient.get<ApiResponse<BenchmarkResult | null>>('/intelligence/benchmarking');
  return res.data.data ?? null;
}

export async function getWeightEngine(): Promise<DynamicWeightResult> {
  const res = await apiClient.get<ApiResponse<DynamicWeightResult>>('/intelligence/weights');
  return res.data.data!;
}

export async function getBehavioralHireability(): Promise<BehavioralHireabilityResult> {
  const res = await apiClient.get<ApiResponse<BehavioralHireabilityResult>>('/resume/behavioral-hireability');
  return res.data.data!;
}

export async function getSemanticMatch(jobId: number): Promise<SemanticMatchResult> {
  const res = await apiClient.get<ApiResponse<SemanticMatchResult>>(`/resume/semantic-match/${jobId}`);
  return res.data.data!;
}
