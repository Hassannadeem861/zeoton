import { Suspense } from 'react';
import { listProducts, getListingFacets } from '@/server/services/productService';
import EmptyState from '@/components/ui/EmptyState';
import ProductGrid from './ProductGrid';
import Pagination from './Pagination';
import { Filters, SortSelect } from './ListingControls';

const SORTS = new Set(['newest', 'price-asc', 'price-desc', 'popular', 'name']);
const toInt = (v) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function parseListingParams(sp = {}) {
  const one = (k) => (Array.isArray(sp[k]) ? sp[k][0] : sp[k]);
  return {
    page: Math.max(1, toInt(one('page')) || 1),
    sort: SORTS.has(one('sort')) ? one('sort') : 'newest',
    minPrice: toInt(one('min')),
    maxPrice: toInt(one('max')),
    brands: (one('brand') || '').split(',').map((b) => b.trim()).filter(Boolean).slice(0, 20),
    inStock: one('stock') === '1',
    q: (one('q') || '').trim().slice(0, 80) || undefined,
  };
}

/** Shared server-rendered listing for /products, /category/[slug] and /search. */
export default async function ProductListing({ basePath, searchParams, categoryIds, emptyTitle, emptyDescription }) {
  const filters = parseListingParams(searchParams);
  const [result, facets] = await Promise.all([
    listProducts({ ...filters, categoryIds }),
    getListingFacets({ categoryIds }),
  ]);
  const plainParams = Object.fromEntries(Object.entries(searchParams || {}).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  const hasAnyProducts = facets.maxPrice > 0 || result.total > 0;

  if (!hasAnyProducts && !filters.q) {
    return <EmptyState title={emptyTitle || 'Products coming soon'} description={emptyDescription || 'We are adding products to this collection. Check back shortly.'} actionHref="/products" actionLabel="Browse all products" />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <Suspense>
        <Filters facets={facets} />
      </Suspense>
      <div>
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-mist-400" aria-live="polite">
            {result.total} {result.total === 1 ? 'product' : 'products'}
          </p>
          <Suspense>
            <SortSelect />
          </Suspense>
        </div>
        {result.items.length ? (
          <ProductGrid products={result.items} priorityCount={4} />
        ) : (
          <EmptyState title="No products match these filters" description="Try removing a filter or widening the price range." actionHref={basePath} actionLabel="Clear filters" />
        )}
        <Pagination basePath={basePath} searchParams={plainParams} page={result.page} totalPages={result.totalPages} />
      </div>
    </div>
  );
}
