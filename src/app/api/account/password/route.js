import { route } from '@/server/http/route';
import { changePasswordSchema } from '@/lib/validation/auth';
import { changePassword } from '@/server/services/userService';

export const PATCH = route(
  { auth: 'user', body: changePasswordSchema, rateLimit: { name: 'password', limit: 10, windowSec: 15 * 60 } },
  async ({ user, body }) => changePassword(user.id, body),
);
