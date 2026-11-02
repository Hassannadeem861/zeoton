import PageHeader from '@/components/layout/PageHeader';
import RichText from '@/components/ui/RichText';
import PendingNotice from '@/components/ui/PendingNotice';
import { getSettings } from '@/server/services/settingsService';
import { buildMetadata } from '@/lib/seo/metadata';

export const revalidate = 600;

export async function generateMetadata() {
  const policies = await getSettings('policies');
  return buildMetadata({
    title: 'Returns & Exchanges',
    description: 'ZEOTON returns and exchange policy for orders delivered in Pakistan.',
    path: '/returns-policy',
    // Keep the placeholder out of search results until the real policy is published.
    noindex: !policies.returnsPolicy,
  });
}

export default async function ReturnsPolicyPage() {
  const policies = await getSettings('policies');
  return (
    <>
      <PageHeader title="Returns & exchanges" breadcrumbs={[{ name: 'Returns & Exchanges' }]} />
      <div className="container-z py-10">
        {policies.returnsPolicy ? (
          <RichText text={policies.returnsPolicy} />
        ) : (
          <PendingNotice>
            Our returns and exchange policy is being finalised and will be published here. Until then, please contact us about any problem with your order and include your order number.
          </PendingNotice>
        )}
      </div>
    </>
  );
}
