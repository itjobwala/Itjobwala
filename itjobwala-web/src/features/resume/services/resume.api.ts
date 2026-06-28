import apiClient, { ApiError } from '@/src/lib/api/client';
import type { ApiResponse } from '@/src/types/api';
import type { ResumeInsights, JobMatchResult, ParseResumePayload, JobFitResult, MarketIntelligenceResult, LearningRecommendations, ResumeProgressResult, HiringSignalsResult, BenchmarkResult, DynamicWeightResult, SemanticMatchResult, BehavioralHireabilityResult } from '../types/resume.types';

export type NonQaResult = {
  eligible:          false;
  reason:            'non_qa_resume' | 'invalid_document';
  detected_domain:   string;
  domain_confidence: number;
  domain_label:      string;
  message:           string;
  word_count?:       number | null;
};

export type ParseResumeResult = ResumeInsights | NonQaResult;

export function isNonQaResult(r: ParseResumeResult): r is NonQaResult {
  return 'eligible' in r && r.eligible === false;
}

type ParseResumeResponse = ApiResponse<ResumeInsights | NonQaResult>;

export async function parseResume(payload: ParseResumePayload = {}): Promise<ParseResumeResult> {
  try {
    const res  = await apiClient.post<ParseResumeResponse>('/resume/parse', payload, { timeout: 120_000 });
    const body = res.data;
    const data = body.data;

    // Handle any 200-level non-QA response (future-proofing)
    if (!body.success && data && 'eligible' in data && data.eligible === false) {
      const d = data as Omit<NonQaResult, 'message'>;
      return {
        eligible:          false,
        reason:            d.reason,
        detected_domain:   d.detected_domain,
        domain_confidence: d.domain_confidence,
        domain_label:      d.domain_label,
        message:           body.message ?? 'Resume does not belong to the QA domain.',
      };
    }

    return data as ResumeInsights;
  } catch (err) {
    // 422 responses are converted to ApiError by the Axios interceptor.
    // Read the preserved response body to reconstruct the NonQaResult.
    if (err instanceof ApiError && err.status === 422) {
      const body = err.data as { success: boolean; message?: string; data?: Record<string, unknown> } | undefined;
      const data = body?.data;
      if (data && data.eligible === false) {
        return {
          eligible:          false,
          reason:            (data.reason as NonQaResult['reason']) ?? 'non_qa_resume',
          detected_domain:   (data.detected_domain as string)       ?? 'unknown',
          domain_confidence: (data.domain_confidence as number)     ?? 0,
          domain_label:      (data.domain_label as string)          ?? 'Unknown',
          message:           body?.message                          ?? 'Resume not eligible.',
          word_count:        (data.word_count as number | null)     ?? null,
        };
      }
    }
    throw err;
  }
}

export async function getResumeInsights(signal?: AbortSignal): Promise<ResumeInsights> {
  const res = await apiClient.get<ApiResponse<ResumeInsights>>('/resume/insights', { signal });
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
