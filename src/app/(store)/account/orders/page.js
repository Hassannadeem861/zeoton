import Link from 'next/link';
import { requireUser } from '@/server/auth/dal';
import { connectDB } from '@/server/db/connect';
import { getOrdersForUser } from '@/server/services/orderService';
import { StatusBadge } from '@/components/account/OrderDetails';
import Pagination from '@/components/product/Pagination';
import { formatDate, formatPKR } from '@/lib/utils/format';

export const metadata = { title: 'Orders' };

export default async function AccountOrdersPage({ searchParams }) {
  const user = await requireUser('/account/orders');
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam, 10) || 1);
  await connectDB();
  const { items, total, limit } = await getOrdersForUser(user.id, { page, limit: 10 });

  if (!items.length) {
    return (
      <div className="surface p-8 text-center text-mist-400">
        No orders yet. <Link href="/products" className="text-blue-300 hover:underline">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="surface overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <caption className="sr-only">Your orders</caption>
        <thead className="border-b border-line text-left text-mist-400">
          <tr>
            <th scope="col" className="p-4 font-medium">Order</th>
            <th scope="col" className="p-4 font-medium">Date</th>
            <th scope="col" className="p-4 font-medium">Status</th>
            <th scope="col" className="p-4 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((o) => (
            <tr key={o.orderNumber}>
              <td className="p-4">
                <Link href={`/account/orders/${o.orderNumber}`} className="font-medium text-blue-300 hover:underline">{o.orderNumber}</Link>
              </td>
              <td className="p-4 text-mist-300">{formatDate(o.createdAt)}</td>
              <td className="p-4"><StatusBadge status={o.status} /></td>
              <td className="p-4 text-right">{formatPKR(o.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pb-6">
        <Pagination basePath="/account/orders" page={page} totalPages={Math.ceil(total / limit)} />
      </div>
    </div>
  );
}
