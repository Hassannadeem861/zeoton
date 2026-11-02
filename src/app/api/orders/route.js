import { z } from 'zod';
import { route } from '@/server/http/route';
import { checkoutSchema } from '@/lib/validation/checkout';
import { pagination } from '@/lib/validation/common';
import { getOrdersForUser, placeOrder } from '@/server/services/orderService';

export const POST = route(
  { body: checkoutSchema, withUser: true, rateLimit: { name: 'checkout', limit: 10, windowSec: 10 * 60 }, status: 201 },
  async ({ body, user }) => placeOrder(body, user),
);

export const GET = route({ auth: 'user', query: z.object(pagination) }, async ({ user, query }) =>
  getOrdersForUser(user.id, query),
);
