import { Suspense } from 'react';
import InventoryTable from '@/components/admin/InventoryTable';

export const metadata = { title: 'Inventory' };

export default function AdminInventoryPage() {
  return (
    <Suspense>
      <InventoryTable />
    </Suspense>
  );
}
