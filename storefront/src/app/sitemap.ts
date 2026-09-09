import { MetadataRoute } from 'next';
import { MOCK_COMPOSERS, MOCK_SCORES } from '@/lib/mock-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pianocolombia.com';

  const staticPages = [
    '',
    '/tienda',
    '/compositores',
    '/nosotros',
    '/checkout',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const composerPages = MOCK_COMPOSERS.map((c) => ({
    url: `${baseUrl}/compositores/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const scorePages = MOCK_SCORES.map((s) => ({
    url: `${baseUrl}/partitura/${s.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...composerPages, ...scorePages];
}
