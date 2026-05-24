export interface JobMetrics {
  views: number;
  applicants: number;
  shortlisted: number;
  interviews: number;
}

export interface RecruiterInfo {
  recruiterName: string;
  recruiterTitle: string;
  recruiterResponseDays: number;
  isActivelyHiring: boolean;
  metrics?: JobMetrics;
}
