import PageHeader from '@/components/layout/PageHeader';
import CategoryGrid from '@/components/home/CategoryGrid';
import { listActiveCategories } from '@/server/services/categoryService';
import { buildMetadata } from '@/lib/seo/metadata';

export const revalidate = 600;

export const metadata = buildMetadata({
  title: 'Shop by Category',
  description: 'Browse ZEOTON gaming accessories by category: gaming mice, keyboards, headsets, controllers, mouse pads, chairs, streaming gear and setup accessories.',
  path: '/categories',
});

export default async function CategoriesPage() {
  const categories = await listActiveCategories();
  return (
    <>
      <PageHeader title="Shop by category" description="Pick a category to see products, prices in PKR and availability." breadcrumbs={[{ name: 'Categories' }]} />
      <div className="container-z py-10">
        <CategoryGrid categories={categories.filter((c) => !c.parent)} />
      </div>
    </>
  );
}
