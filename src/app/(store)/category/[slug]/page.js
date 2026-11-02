import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import ProductListing from '@/components/product/ProductListing';
import { getCategoryBySlug, listActiveCategories } from '@/server/services/categoryService';
import { countDemoProducts } from '@/server/services/productService';
import { buildMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category not found', robots: { index: false } };

  const counts = await listActiveCategories();
  const realCount = counts.find((c) => c.slug === slug)?.realProductCount || 0;
  const demoCount = await countDemoProducts([category._id, ...(category.children || []).map((c) => c._id)]);
  const page = Number.parseInt(sp.page, 10) > 1 ? Number.parseInt(sp.page, 10) : 1;
  const filtered = ['min', 'max', 'brand', 'stock', 'sort'].some((k) => sp[k]);
  const base = category.seo?.title || `${category.name} in Pakistan`;

  return buildMetadata({
    title: page > 1 ? `${base} – Page ${page}` : base,
    description: category.seo?.description || category.description?.slice(0, 155),
    path: page > 1 && !filtered ? `/category/${slug}?page=${page}` : `/category/${slug}`,
    image: category.image?.url,
    // Empty categories, demo categories and pages listing demo products stay out of the index.
    noindex: realCount === 0 || category.isDemo || demoCount > 0,
  });
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const crumbs = category.parentCategory
    ? [{ name: 'Categories', href: '/categories' }, { name: category.parentCategory.name, href: `/category/${category.parentCategory.slug}` }, { name: category.name }]
    : [{ name: 'Categories', href: '/categories' }, { name: category.name }];

  return (
    <>
      <PageHeader title={category.name} description={category.description} breadcrumbs={crumbs}>
        {category.children?.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {category.children.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="inline-block rounded-full border border-line-strong px-3.5 py-1.5 text-xs text-mist-300 transition hover:border-blue-500 hover:text-mist-50">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageHeader>
      <div className="container-z py-10">
        <ProductListing
          basePath={`/category/${slug}`}
          searchParams={sp}
          categoryIds={[category._id, ...(category.children || []).map((c) => c._id)]}
          emptyTitle={`${category.name} are coming soon`}
          emptyDescription="We are adding products to this category. Browse other categories or contact us about what you need."
        />
      </div>
    </>
  );
}
