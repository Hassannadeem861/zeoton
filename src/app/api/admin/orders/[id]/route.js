import { route } from '@/server/http/route';
import { orderUpdateSchema } from '@/lib/validation/admin';
import { adminGetOrder, adminUpdateOrder } from '@/server/services/orderService';
import { revalidateStorefront } from '@/server/utils';

export const GET = route({ auth: 'admin' }, async ({ params }) => ({ order: await adminGetOrder(params.id) }));

export const PATCH = route({ auth: 'admin', body: orderUpdateSchema }, async ({ params, body }) => {
  const order = await adminUpdateOrder(params.id, body);
  // Stock and best-seller data can change with status updates.
  if (body.status) revalidateStorefront();
  return { order };
});
