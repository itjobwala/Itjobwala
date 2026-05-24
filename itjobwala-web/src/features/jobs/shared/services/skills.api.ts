import { publicClient } from '@/src/lib/api/client';

export interface SkillOption {
  id: number;
  name: string;
  category: string;
}

export async function fetchSkillSuggestions(q: string, limit = 8): Promise<SkillOption[]> {
  const res = await publicClient.get<{ success: boolean; data: SkillOption[] }>('/skills', {
    params: { q: q.trim(), limit },
  });
  return res.data.data;
}

export async function validateSkillsRemote(skills: string[]): Promise<{ valid: boolean; invalid: string[] }> {
  const res = await publicClient.post<{ success: boolean; data: { valid: boolean; invalid: string[] } }>(
    '/skills/validate',
    { skills },
  );
  return res.data.data;
}
