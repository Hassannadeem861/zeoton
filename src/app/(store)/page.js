import Link from 'next/link';
import Hero from '@/components/home/Hero';
import CategoryGrid from '@/components/home/CategoryGrid';
import ProductRail from '@/components/product/ProductRail';
import RecentlyViewed from '@/components/product/RecentlyViewed';
import SectionHeading from '@/components/ui/SectionHeading';
import { listActiveCategories } from '@/server/services/categoryService';
import { countDemoProducts, getBestSellers, getFeaturedProducts, getNewArrivals, getTrendingProducts } from '@/server/services/productService';
import { getSettings } from '@/server/services/settingsService';
import { buildMetadata } from '@/lib/seo/metadata';
import { siteConfig } from '@/config/site';

export const revalidate = 600;

export async function generateMetadata() {
  const seo = await getSettings('seo');
  return {
    ...buildMetadata({
      title: seo.homeTitle || 'Gaming Accessories in Pakistan',
      description: seo.homeDescription || siteConfig.description,
      path: '/',
      // The home page shows demo products while the demo catalog exists: keep it out of the index.
      noindex: (await countDemoProducts()) > 0,
    }),
    ...(seo.googleSiteVerification ? { verification: { google: seo.googleSiteVerification } } : {}),
  };
}

export default async function HomePage() {
  const [content, categories, featured, trending, newArrivals, bestSellers] = await Promise.all([
    getSettings('content'),
    listActiveCategories(),
    getFeaturedProducts(8),
    getTrendingProducts(8),
    getNewArrivals(8),
    getBestSellers(8),
  ]);
  const topCategories = categories.filter((c) => !c.parent);
  const hasProducts = newArrivals.length > 0;

  return (
    <>
      <Hero hero={content.hero} />

      <section className="container-z py-14 sm:py-20">
        <SectionHeading eyebrow="Shop by category" title="Build your setup" description="Everything from your mouse to your chair, organised by what you are looking for." href="/categories" linkLabel="All categories" />
        <CategoryGrid categories={topCategories} />
      </section>

      <ProductRail eyebrow="Hand-picked" title="Featured gear" products={featured} href="/products" />
      <ProductRail eyebrow="Popular right now" title="Trending this month" description="Based on orders placed in the last 30 days." products={trending} href="/products?sort=popular" />
      <ProductRail eyebrow="Just landed" title="New arrivals" products={newArrivals} href="/products" />
      <ProductRail eyebrow="Customer favourites" title="Best sellers" description="Ranked by delivered orders." products={bestSellers} href="/products?sort=popular" />

      {!hasProducts && (
        <section className="container-z py-6">
          <div className="surface relative overflow-hidden p-8 text-center sm:p-12">
            <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
            <p className="eyebrow relative mb-4">Catalog</p>
            <h2 className="relative text-2xl font-semibold">Our product catalog is being added</h2>
            <p className="relative mx-auto mt-3 max-w-lg text-sm text-mist-400">
              Products will appear here as soon as they are listed. Have a question about a product you are looking for? Contact us and we will help.
            </p>
            <Link href="/contact" className="btn-primary relative mt-6">
              Contact ZEOTON
            </Link>
          </div>
        </section>
      )}

      <RecentlyViewed />
    </>
  );
}
