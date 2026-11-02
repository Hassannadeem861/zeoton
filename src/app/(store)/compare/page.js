import PageHeader from '@/components/layout/PageHeader';
import CompareView from '@/components/product/CompareView';

export const metadata = { title: 'Compare Products', robots: { index: false, follow: true } };

export default function ComparePage() {
  return (
    <>
      <PageHeader title="Compare products" description="Compare up to 4 products side by side: price, availability and specifications." breadcrumbs={[{ name: 'Compare' }]} />
      <div className="container-z py-10">
        <CompareView />
      </div>
    </>
  );
}
