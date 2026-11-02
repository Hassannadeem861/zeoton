'use client';

import { Alert, Skeleton } from 'antd';
import { useGetAdminProductQuery } from '@/store/api/adminApi';
import ProductForm from './ProductForm';

export default function ProductEditor({ id }) {
  const { data, isLoading, isError } = useGetAdminProductQuery(id);
  if (isLoading) return <Skeleton active paragraph={{ rows: 12 }} />;
  if (isError || !data) return <Alert type="error" title="Product not found." />;
  return <ProductForm product={data} />;
}
