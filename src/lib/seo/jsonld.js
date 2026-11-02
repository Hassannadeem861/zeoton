import { siteConfig } from '@/config/site';
import { resolveOffer, totalStock } from '@/lib/utils/pricing';
import { absoluteUrl } from './metadata';

export function organizationJsonLd(socialLinks = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl(siteConfig.logo),
    email: siteConfig.email,
    telephone: siteConfig.phone,
    areaServed: { '@type': 'Country', name: 'Pakistan' },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: siteConfig.email,
      telephone: siteConfig.phone,
      areaServed: 'PK',
      availableLanguage: ['English', 'Urdu'],
    },
    ...(socialLinks.length ? { sameAs: socialLinks.map((s) => s.url) } : {}),
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: 'en-PK',
    publisher: { '@id': `${siteConfig.url}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${siteConfig.url}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };
}

// Real price and availability only. No ratings/reviews until genuine ones exist.
export function productJsonLd(product) {
  const url = absoluteUrl(`/product/${product.slug}`);
  const availability = (stock) => `https://schema.org/${stock > 0 ? 'InStock' : 'OutOfStock'}`;
  const offers = product.variants?.length
    ? product.variants.map((v) => {
        const o = resolveOffer(product, v);
        return { '@type': 'Offer', sku: v.sku, name: v.label, price: o.unitPrice, priceCurrency: 'PKR', availability: availability(o.stock), url, itemCondition: 'https://schema.org/NewCondition' };
      })
    : (() => {
        const o = resolveOffer(product);
        return { '@type': 'Offer', price: o.unitPrice, priceCurrency: 'PKR', availability: availability(totalStock(product)), url, itemCondition: 'https://schema.org/NewCondition', seller: { '@id': `${siteConfig.url}/#organization` } };
      })();

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku,
    url,
    description: product.seo?.description || product.shortDescription || product.description?.slice(0, 300),
    image: product.images?.map((i) => i.url) || [],
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    ...(product.category?.name ? { category: product.category.name } : {}),
    ...(product.specs?.length
      ? { additionalProperty: product.specs.map((s) => ({ '@type': 'PropertyValue', name: s.label, value: s.value })) }
      : {}),
    offers,
  };
}
