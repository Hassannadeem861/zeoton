import { route } from '@/server/http/route';
import { registerSchema } from '@/lib/validation/auth';
import { registerCustomer } from '@/server/services/userService';

export const POST = route(
  { body: registerSchema, rateLimit: { name: 'register', limit: 5, windowSec: 60 * 60 }, status: 201 },
  async ({ body, request }) => ({ user: await registerCustomer(body, request) }),
);
