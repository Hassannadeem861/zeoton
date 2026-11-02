import { siteConfig } from '@/config/site';

export const absoluteUrl = (path = '/') => `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`;

/**
 * Builds page metadata with canonical URL, Open Graph and Twitter cards.
 * Titles get " | ZEOTON" from the root layout template.
 */
export function buildMetadata({ title, description, path = '/', image, noindex = false, type = 'website' }) {
  const images = [{ url: image || siteConfig.ogImage, width: image ? undefined : 1200, height: image ? undefined : 630, alt: title || siteConfig.name }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      title: title ? `${title} | ${siteConfig.name}` : siteConfig.name,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images,
    },
    twitter: { card: 'summary_large_image', title: title || siteConfig.name, description, images: images.map((i) => i.url) },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export const noindexMetadata = (title) => ({ title, robots: { index: false, follow: false } });
