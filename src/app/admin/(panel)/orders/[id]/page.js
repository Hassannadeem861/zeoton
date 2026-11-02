import OrderManager from '@/components/admin/OrderManager';

export const metadata = { title: 'Order' };

export default async function AdminOrderPage({ params }) {
  const { id } = await params;
  return <OrderManager id={id} />;
}
