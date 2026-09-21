import type { MetadataRoute } from 'next';
import { absoluteUrl, IS_PRODUCTION_MODE } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  /* Only a production build — which by definition carries no demo records — is offered
     to search engines. Staging stays closed while placeholders exist (DECISIONS.md O-7). */
  return {
    rules: IS_PRODUCTION_MODE
      ? { userAgent: '*', allow: '/', disallow: ['/admin', '/my-house'] }
      : { userAgent: '*', disallow: '/' },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
