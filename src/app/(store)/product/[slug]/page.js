import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Banknote, MapPinned, PackageSearch } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import ProductGallery from '@/components/product/ProductGallery';
import ProductPurchase from '@/components/product/ProductPurchase';
import ProductRail from '@/components/product/ProductRail';
import RecentlyViewed, { TrackRecentlyViewed } from '@/components/product/RecentlyViewed';
import { getProductBySlug, getRelatedProducts } from '@/server/services/productService';
import { DemoNotice } from '@/components/product/DemoBadge';
import { buildMetadata } from '@/lib/seo/metadata';
import { productJsonLd } from '@/lib/seo/jsonld';
import { formatPKR } from '@/lib/utils/format';

export const revalidate = 600;

// Pages are generated on first request and cached (ISR); admin edits revalidate them.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product not found', robots: { index: false } };
  const fallbackDescription = `${product.name}${product.brand ? ` by ${product.brand}` : ''} — ${product.variants?.length ? 'from ' : ''}${formatPKR(product.sellPrice)} in Pakistan. ${product.shortDescription || ''}`.slice(0, 158);
  return buildMetadata({
    title: product.seo?.title || `${product.name} Price in Pakistan`,
    description: product.seo?.description || fallbackDescription,
    path: `/product/${product.slug}`,
    image: product.images?.[0]?.url,
    type: 'website',
    // Demo products (placeholder prices/stock) must never be indexed.
    noindex: product.isDemo,
  });
}

function Paragraphs({ text }) {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p, i) => <p key={i}>{p}</p>);
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product, 8);

  const purchaseData = {
    _id: product._id,
    price: product.price,
    salePrice: product.salePrice,
    stock: product.stock,
    isDemo: !!product.isDemo,
    variants: product.variants.map(({ _id, label, price, salePrice, stock }) => ({ _id, label, price, salePrice, stock })),
  };
  const crumbs = [
    { name: 'Shop All', href: '/products' },
    ...(product.category ? [{ name: product.category.name, href: `/category/${product.category.slug}` }] : []),
    { name: product.name },
  ];

  return (
    <>
      {!product.isDemo && <JsonLd data={productJsonLd(product)} />}
      <TrackRecentlyViewed productId={product._id} />

      <div className="container-z py-8">
        <Breadcrumbs items={crumbs} />
        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={product.images} name={product.name} />

          <div className="lg:sticky lg:top-28 lg:self-start">
            {product.isDemo && <DemoNotice />}
            {product.brand && <p className="eyebrow eyebrow-left mb-3">{product.brand}</p>}
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{product.name}</h1>
            <p className="mt-2 text-xs text-mist-500">SKU: {product.sku}</p>
            {product.shortDescription && <p className="mt-4 leading-relaxed text-mist-300">{product.shortDescription}</p>}

            <div className="mt-6">
              <ProductPurchase product={purchaseData} />
            </div>

            <ul className="mt-8 grid gap-3 rounded-2xl border border-line bg-ink-850/60 p-4 text-sm text-mist-300">
              <li className="flex items-center gap-3">
                <Banknote className="h-5 w-5 text-blue-400" aria-hidden /> Pay with Cash on Delivery
              </li>
              <li className="flex items-center gap-3">
                <MapPinned className="h-5 w-5 text-blue-400" aria-hidden /> Delivery all over Pakistan —{' '}
                <Link href="/shipping-policy" className="text-blue-300 hover:underline">
                  shipping details
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <PackageSearch className="h-5 w-5 text-blue-400" aria-hidden /> Track your order online
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          {product.description && (
            <section aria-labelledby="desc-heading">
              <h2 id="desc-heading" className="mb-4 text-xl font-semibold">
                Description
              </h2>
              <div className="prose-z">
                <Paragraphs text={product.description} />
              </div>
            </section>
          )}
          {product.specs?.length > 0 && (
            <section aria-labelledby="specs-heading">
              <h2 id="specs-heading" className="mb-4 text-xl font-semibold">
                Specifications
              </h2>
              <table className="w-full overflow-hidden rounded-xl border border-line text-sm">
                <tbody>
                  {product.specs.map((s, i) => (
                    <tr key={`${s.label}-${i}`} className="border-b border-line last:border-0 odd:bg-ink-850/70">
                      <th scope="row" className="w-2/5 px-4 py-3 text-left font-medium text-mist-400">
                        {s.label}
                      </th>
                      <td className="px-4 py-3 text-mist-100">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>
      </div>

      <ProductRail eyebrow="More like this" title="Related products" products={related} href={product.category ? `/category/${product.category.slug}` : '/products'} />
      <RecentlyViewed excludeId={product._id} />
    </>
  );
}
