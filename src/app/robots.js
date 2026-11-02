import { siteConfig } from '@/config/site';

export default function robots() {
  // Preview/staging deployments must never be indexed.
  const isProduction = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === 'production' : true;
  if (!isProduction) return { rules: [{ userAgent: '*', disallow: '/' }] };

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/account', '/cart', '/checkout', '/search', '/login', '/register', '/wishlist', '/compare'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
