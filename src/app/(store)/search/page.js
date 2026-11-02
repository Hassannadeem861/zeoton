import PageHeader from '@/components/layout/PageHeader';
import ProductListing from '@/components/product/ProductListing';

export const metadata = { title: 'Search', robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q || '').trim().slice(0, 80);
  return (
    <>
      <PageHeader title={q ? `Results for “${q}”` : 'Search products'} breadcrumbs={[{ name: 'Search' }]} />
      <div className="container-z py-10">
        {q ? (
          <ProductListing basePath="/search" searchParams={sp} emptyTitle="No products found" emptyDescription="Try a different keyword, or browse by category." />
        ) : (
          <p className="text-mist-400">Type a product name, brand or category in the search box above.</p>
        )}
      </div>
    </>
  );
}
