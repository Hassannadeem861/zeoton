import { Suspense } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import TrackOrderForm from '@/components/account/TrackOrderForm';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = {
  ...buildMetadata({
    title: 'Track Your Order',
    description: 'Check the status of your ZEOTON order with your order number and phone number.',
    path: '/track-order',
  }),
};

export default function TrackOrderPage() {
  return (
    <>
      <PageHeader title="Track your order" description="Enter the order number from your confirmation and the mobile number used at checkout." breadcrumbs={[{ name: 'Track Order' }]} />
      <div className="container-z py-10">
        <Suspense>
          <TrackOrderForm />
        </Suspense>
      </div>
    </>
  );
}
