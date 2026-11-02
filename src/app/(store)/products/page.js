import PageHeader from '@/components/layout/PageHeader';
import ProductListing from '@/components/product/ProductListing';
import { buildMetadata } from '@/lib/seo/metadata';
import { countDemoProducts } from '@/server/services/productService';

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const page = Number.parseInt(sp.page, 10) > 1 ? Number.parseInt(sp.page, 10) : 1;
  const filtered = ['min', 'max', 'brand', 'stock', 'sort'].some((k) => sp[k]);
  return buildMetadata({
    title: page > 1 ? `Gaming Accessories in Pakistan – Page ${page}` : 'Gaming Accessories in Pakistan',
    description: 'Shop gaming mice, keyboards, headsets, controllers and setup accessories online in Pakistan. Prices in PKR with Cash on Delivery nationwide.',
    // Filtered/sorted views canonicalise to the clean listing to avoid duplicate pages.
    path: page > 1 && !filtered ? `/products?page=${page}` : '/products',
    // While demo products are listed, keep the listing out of search results.
    noindex: (await countDemoProducts()) > 0,
  });
}

export default async function ProductsPage({ searchParams }) {
  const sp = await searchParams;
  return (
    <>
      <PageHeader
        title="All gaming accessories"
        description="Browse every product in the ZEOTON store. Filter by price and brand to find gear that fits your setup and budget."
        breadcrumbs={[{ name: 'Shop All' }]}
      />
      <div className="container-z py-10">
        <ProductListing basePath="/products" searchParams={sp} />
      </div>
    </>
  );
}
