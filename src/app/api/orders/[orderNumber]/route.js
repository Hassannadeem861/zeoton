import { route } from '@/server/http/route';
import { getOrderForUser } from '@/server/services/orderService';

export const GET = route({ auth: 'user' }, async ({ user, params }) => ({
  order: await getOrderForUser(user.id, String(params.orderNumber).toUpperCase()),
}));
