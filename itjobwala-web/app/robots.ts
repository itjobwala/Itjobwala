import type { MetadataRoute } from 'next';
import { env } from '@/src/env';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/jobs/'],
        disallow: ['/candidate/', '/recruiter/', '/admin/', '/api/', '/auth/'],
      },
    ],
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}
