import ProductEditor from '@/components/admin/ProductEditor';

export const metadata = { title: 'Edit product' };

export default async function EditProductPage({ params }) {
  const { id } = await params;
  return <ProductEditor id={id} />;
}
