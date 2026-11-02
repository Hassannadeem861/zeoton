import { z } from 'zod';
import { route } from '@/server/http/route';
import { productSchema } from '@/lib/validation/admin';
import { objectId, pagination } from '@/lib/validation/common';
import { adminListProducts, createProduct } from '@/server/services/productService';
import { revalidateStorefront } from '@/server/utils';

const listQuery = z.object({
  ...pagination,
  q: z.string().trim().max(80).optional(),
  category: objectId.optional().or(z.literal('').transform(() => undefined)),
  status: z.enum(['active', 'inactive', '']).optional(),
  stock: z.enum(['low', 'out', '']).optional(),
});

export const GET = route({ auth: 'admin', query: listQuery }, async ({ query }) => adminListProducts(query));

export const POST = route({ auth: 'admin', body: productSchema, status: 201 }, async ({ body }) => {
  const product = await createProduct(body);
  revalidateStorefront();
  return { product };
});
