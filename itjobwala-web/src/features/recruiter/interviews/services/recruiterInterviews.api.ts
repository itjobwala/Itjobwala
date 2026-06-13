import { recruiterClient } from '@/src/lib/api/client';
import type {
  RecruiterInterview,
  ScheduleInterviewRequest,
  RecruiterInterviewsResponse,
} from '@/features/recruiter/types';

export async function getRecruiterInterviews(): Promise<RecruiterInterview[]> {
  const res = await recruiterClient.get<RecruiterInterviewsResponse>('/recruiter/interviews');
  return res.data.data.interviews;
}

export async function scheduleRecruiterInterview(
  data: ScheduleInterviewRequest,
): Promise<RecruiterInterview> {
  const res = await recruiterClient.post<{ success: boolean; data: RecruiterInterview }>(
    '/recruiter/interviews',
    data,
  );
  return res.data.data;
}

export async function cancelRecruiterInterview(interviewId: string): Promise<void> {
  await recruiterClient.delete(`/recruiter/interviews/${interviewId}`);
}
