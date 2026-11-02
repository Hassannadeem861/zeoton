import { Suspense } from 'react';
import ProductsTable from '@/components/admin/ProductsTable';

export const metadata = { title: 'Products' };

export default function AdminProductsPage() {
  return (
    <Suspense>
      <ProductsTable />
    </Suspense>
  );
}
