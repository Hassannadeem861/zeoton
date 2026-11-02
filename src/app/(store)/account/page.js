import Link from 'next/link';
import { requireUser } from '@/server/auth/dal';
import { connectDB } from '@/server/db/connect';
import { getOrdersForUser } from '@/server/services/orderService';
import { StatusBadge } from '@/components/account/OrderDetails';
import { formatDate, formatPKR } from '@/lib/utils/format';

export const metadata = { title: 'Overview' };

export default async function AccountOverviewPage() {
  const user = await requireUser('/account');
  await connectDB();
  const { items, total } = await getOrdersForUser(user.id, { page: 1, limit: 5 });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="surface p-5">
          <p className="text-sm text-mist-400">Orders placed</p>
          <p className="mt-1 font-display text-3xl font-semibold">{total}</p>
        </div>
        <div className="surface p-5">
          <p className="text-sm text-mist-400">Signed in as</p>
          <p className="mt-1 truncate font-medium">{user.email}</p>
        </div>
      </div>
      <section className="surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent orders</h2>
          <Link href="/account/orders" className="text-sm text-blue-300 hover:underline">View all</Link>
        </div>
        {items.length ? (
          <ul className="divide-y divide-line">
            {items.map((o) => (
              <li key={o.orderNumber}>
                <Link href={`/account/orders/${o.orderNumber}`} className="flex flex-wrap items-center justify-between gap-3 py-3 hover:text-blue-300">
                  <span className="font-medium">{o.orderNumber}</span>
                  <span className="text-sm text-mist-400">{formatDate(o.createdAt)}</span>
                  <StatusBadge status={o.status} />
                  <span className="text-sm font-medium">{formatPKR(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-mist-400">
            You have not placed any orders yet. <Link href="/products" className="text-blue-300 hover:underline">Start shopping</Link>
          </p>
        )}
      </section>
    </div>
  );
}
