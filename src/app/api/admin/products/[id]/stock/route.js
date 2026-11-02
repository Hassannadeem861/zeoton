import { route } from '@/server/http/route';
import { stockUpdateSchema } from '@/lib/validation/admin';
import { updateStock } from '@/server/services/productService';
import { revalidateStorefront } from '@/server/utils';

export const PATCH = route({ auth: 'admin', body: stockUpdateSchema }, async ({ params, body }) => {
  const result = await updateStock(params.id, body);
  revalidateStorefront();
  return result;
});
