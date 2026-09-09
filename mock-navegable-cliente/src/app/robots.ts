import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/compositor/dashboard/', '/api/'],
    },
    sitemap: 'https://pianocolombia.com/sitemap.xml',
  };
}
