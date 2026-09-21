import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://houseofnucci.example';

export default function robots(): MetadataRoute.Robots {
  /* Staging is never indexed while it carries demo records (DECISIONS.md O-7). */
  const isProduction = process.env.COLLECTION_MODE === 'production';

  return {
    rules: isProduction
      ? { userAgent: '*', allow: '/', disallow: ['/admin', '/my-house'] }
      : { userAgent: '*', disallow: '/' },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
