import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/server/auth/dal';
import { connectDB } from '@/server/db/connect';
import { getOrderForUser } from '@/server/services/orderService';
import OrderDetails from '@/components/account/OrderDetails';

export const metadata = { title: 'Order details' };

export default async function AccountOrderPage({ params }) {
  const { orderNumber } = await params;
  const user = await requireUser(`/account/orders/${orderNumber}`);
  await connectDB();
  const order = await getOrderForUser(user.id, String(orderNumber).toUpperCase()).catch(() => null);
  if (!order) notFound();
  return (
    <div className="space-y-4">
      <Link href="/account/orders" className="text-sm text-mist-400 hover:text-mist-50">← All orders</Link>
      <div className="surface p-5 sm:p-6">
        <OrderDetails order={order} />
      </div>
    </div>
  );
}
