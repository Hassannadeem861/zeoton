import { route } from '@/server/http/route';
import { trackOrderSchema } from '@/lib/validation/checkout';
import { trackOrder } from '@/server/services/orderService';

export const POST = route(
  { body: trackOrderSchema, rateLimit: { name: 'track', limit: 20, windowSec: 15 * 60 } },
  async ({ body }) => ({ order: await trackOrder(body) }),
);
