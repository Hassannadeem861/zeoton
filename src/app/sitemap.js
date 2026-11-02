import { siteConfig } from '@/config/site';
import { listActiveCategories } from '@/server/services/categoryService';
import { listIndexableProductSlugs } from '@/server/services/productService';
import { getSettings } from '@/server/services/settingsService';

export const revalidate = 3600;

// Only indexable pages: no private pages, no empty categories, no placeholder policies.
export default async function sitemap() {
  const base = siteConfig.url;
  const [categories, products, policies] = await Promise.all([
    listActiveCategories(),
    listIndexableProductSlugs(),
    getSettings('policies'),
  ]);

  const staticPages = ['/', '/products', '/categories', '/about', '/contact', '/faq', '/shipping-policy', '/track-order', '/privacy-policy', '/terms'];
  if (policies.returnsPolicy) staticPages.push('/returns-policy');

  return [
    ...staticPages.map((path) => ({ url: `${base}${path}`, changeFrequency: path === '/' ? 'daily' : 'monthly', priority: path === '/' ? 1 : 0.5 })),
    ...categories
      .filter((c) => !c.isDemo && c.realProductCount > 0)
      .map((c) => ({ url: `${base}/category/${c.slug}`, lastModified: c.updatedAt, changeFrequency: 'weekly', priority: 0.8 })),
    ...products.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'weekly', priority: 0.7 })),
  ];
}
