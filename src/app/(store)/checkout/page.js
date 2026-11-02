import PageHeader from '@/components/layout/PageHeader';
import CheckoutForm from '@/components/checkout/CheckoutForm';

export const metadata = { title: 'Checkout', robots: { index: false, follow: false } };

export default function CheckoutPage() {
  return (
    <>
      <PageHeader title="Checkout" breadcrumbs={[{ name: 'Cart', href: '/cart' }, { name: 'Checkout' }]} />
      <div className="container-z py-10">
        <CheckoutForm />
      </div>
    </>
  );
}
