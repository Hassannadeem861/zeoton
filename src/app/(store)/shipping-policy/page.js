import PageHeader from '@/components/layout/PageHeader';
import RichText from '@/components/ui/RichText';
import PendingNotice from '@/components/ui/PendingNotice';
import { getSettings } from '@/server/services/settingsService';
import { buildMetadata } from '@/lib/seo/metadata';
import { formatPKR } from '@/lib/utils/format';

export const revalidate = 600;

export const metadata = buildMetadata({
  title: 'Shipping Policy',
  description: 'How ZEOTON delivers orders across Pakistan, shipping charges and Cash on Delivery.',
  path: '/shipping-policy',
});

export default async function ShippingPolicyPage() {
  const [store, policies] = await Promise.all([getSettings('store'), getSettings('policies')]);
  const { shipping, payment } = store;

  return (
    <>
      <PageHeader title="Shipping policy" breadcrumbs={[{ name: 'Shipping Policy' }]} />
      <div className="container-z py-10">
        <div className="prose-z">
          <h2>Delivery coverage</h2>
          <p>{shipping.coverageText || 'We deliver all over Pakistan.'}</p>

          <h2>Shipping charges</h2>
          {shipping.mode === 'free' && <p>Shipping is free on all orders.</p>}
          {shipping.mode === 'flat' && shipping.flatFee != null && (
            <p>
              A flat shipping charge of {formatPKR(shipping.flatFee)} applies per order
              {shipping.freeShippingThreshold != null && `, and shipping is free on orders of ${formatPKR(shipping.freeShippingThreshold)} or more`}.
            </p>
          )}
          {(shipping.mode === 'pending' || (shipping.mode === 'flat' && shipping.flatFee == null)) && (
            <p>
              Shipping charges have not been finalised yet. If a charge applies to your order, it will be added to the order and shown on your order tracking page before dispatch.
            </p>
          )}

          <h2>Delivery time</h2>
          {shipping.deliveryTimeText ? <p>{shipping.deliveryTimeText}</p> : <p>Delivery timeframes will be published here once finalised.</p>}

          {payment.codEnabled && (
            <>
              <h2>Cash on Delivery</h2>
              <p>{payment.codNote || 'Pay in cash when your order is delivered.'}</p>
            </>
          )}

          <h2>Tracking your order</h2>
          <p>You can check your order status any time on the Track Order page with your order number and phone number.</p>
        </div>

        {policies.shippingPolicy ? <div className="mt-8"><RichText text={policies.shippingPolicy} /></div> : (
          <PendingNotice>Our full shipping policy is being finalised and will be published on this page.</PendingNotice>
        )}
      </div>
    </>
  );
}
