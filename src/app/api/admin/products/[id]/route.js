import { route } from '@/server/http/route';
import { productUpdateSchema } from '@/lib/validation/admin';
import { adminGetProduct, deleteProduct, updateProduct } from '@/server/services/productService';
import { revalidateStorefront } from '@/server/utils';

export const GET = route({ auth: 'admin' }, async ({ params }) => ({ product: await adminGetProduct(params.id) }));

export const PUT = route({ auth: 'admin', body: productUpdateSchema }, async ({ params, body }) => {
  const product = await updateProduct(params.id, body);
  revalidateStorefront();
  return { product };
});

export const DELETE = route({ auth: 'admin' }, async ({ params }) => {
  const res = await deleteProduct(params.id);
  revalidateStorefront();
  return res;
});
