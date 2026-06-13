export type ReportTargetType = 'job' | 'recruiter' | 'user';

export const REPORT_REASONS: { value: string; label: string }[] = [
  { value: 'Spam or scam',            label: 'Spam or scam' },
  { value: 'Fraudulent job listing',  label: 'Fraudulent job listing' },
  { value: 'Inappropriate content',   label: 'Inappropriate content' },
  { value: 'Fake company',            label: 'Fake company' },
  { value: 'Discriminatory language', label: 'Discriminatory language' },
  { value: 'Misleading information',  label: 'Misleading information' },
  { value: 'Other',                   label: 'Other' },
];

export interface SubmitReportRequest {
  target_type: ReportTargetType;
  target_id: number;
  reason: string;
  details?: string;
}

export interface SubmitReportResponse {
  success: boolean;
  message: string;
  data: { id: number };
}
