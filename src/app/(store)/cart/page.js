import PageHeader from '@/components/layout/PageHeader';
import CartView from '@/components/cart/CartView';

export const metadata = { title: 'Cart', robots: { index: false, follow: false } };

export default function CartPage() {
  return (
    <>
      <PageHeader title="Your cart" breadcrumbs={[{ name: 'Cart' }]} />
      <div className="container-z py-10">
        <CartView />
      </div>
    </>
  );
}
