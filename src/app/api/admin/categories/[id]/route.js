import { route } from '@/server/http/route';
import { categorySchema } from '@/lib/validation/admin';
import { deleteCategory, updateCategory } from '@/server/services/categoryService';
import { revalidateStorefront } from '@/server/utils';

export const PUT = route({ auth: 'admin', body: categorySchema }, async ({ params, body }) => {
  const category = await updateCategory(params.id, body);
  revalidateStorefront();
  return { category };
});

export const DELETE = route({ auth: 'admin' }, async ({ params }) => {
  const res = await deleteCategory(params.id);
  revalidateStorefront();
  return res;
});
