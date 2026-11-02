import { z } from 'zod';
import { route } from '@/server/http/route';
import { pagination } from '@/lib/validation/common';
import { adminListOrders } from '@/server/services/orderService';

const listQuery = z.object({
  ...pagination,
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', '']).optional(),
  q: z.string().trim().max(80).optional(),
});

export const GET = route({ auth: 'admin', query: listQuery }, async ({ query }) => adminListOrders(query));
