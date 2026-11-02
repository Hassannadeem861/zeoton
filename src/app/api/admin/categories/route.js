import { route } from '@/server/http/route';
import { categorySchema } from '@/lib/validation/admin';
import { adminListCategories, createCategory } from '@/server/services/categoryService';
import { revalidateStorefront } from '@/server/utils';

export const GET = route({ auth: 'admin' }, async () => ({ items: await adminListCategories() }));

export const POST = route({ auth: 'admin', body: categorySchema, status: 201 }, async ({ body }) => {
  const category = await createCategory(body);
  revalidateStorefront();
  return { category };
});
