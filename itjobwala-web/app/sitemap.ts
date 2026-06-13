import type { MetadataRoute } from 'next';
import { env } from '@/src/env';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${env.siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${env.siteUrl}/candidate/jobs`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
  ];

  try {
    const res = await fetch(`${env.apiUrl}/jobs/sitemap`, { cache: 'no-store' });
    if (!res.ok) return staticRoutes;
    const json = await res.json();
    const jobs: Array<{ id: string; updated_at: string }> = json.data ?? [];
    return [
      ...staticRoutes,
      ...jobs.map(j => ({
        url: `${env.siteUrl}/jobs/${j.id}`,
        lastModified: new Date(j.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
