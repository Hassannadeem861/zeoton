import { Suspense } from 'react';
import OrdersTable from '@/components/admin/OrdersTable';

export const metadata = { title: 'Orders' };

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <OrdersTable />
    </Suspense>
  );
}
