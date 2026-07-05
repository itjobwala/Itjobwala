import { recruiterClient } from '@/src/lib/api/client';
import type { ApiResponse } from '@/src/types/api';
import type { TalentPoolResult } from '../types/candidateSearch.types';

export interface SaveCandidateBody {
  candidate_id: string;
  list_name?:   string;
  note?:        string;
}

export interface BulkMessageResult {
  sent:    { id: string; conversation_id: number }[];
  skipped: { id: string; reason: string }[];
}

export async function getTalentPool(params: {
  list_name?: string;
  page?:      number;
  limit?:     number;
} = {}): Promise<TalentPoolResult> {
  const res = await recruiterClient.get<ApiResponse<TalentPoolResult>>(
    '/recruiter/talent-pool',
    { params },
  );
  return res.data.data!;
}

export async function saveCandidate(body: SaveCandidateBody): Promise<void> {
  await recruiterClient.post('/recruiter/talent-pool', body);
}

export async function removeFromPool(candidateId: string, listName?: string): Promise<void> {
  await recruiterClient.delete(`/recruiter/talent-pool/${candidateId}`, {
    params: listName ? { list_name: listName } : {},
  });
}

export async function bulkMessageCandidates(body: {
  candidate_ids: string[];
  message:       string;
}): Promise<BulkMessageResult> {
  const res = await recruiterClient.post<ApiResponse<BulkMessageResult>>(
    '/recruiter/messages/bulk',
    body,
  );
  return res.data.data!;
}
