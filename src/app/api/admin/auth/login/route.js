import { loginRoute } from '@/server/auth/loginRoute';

export const POST = loginRoute('admin', {
  perIp: { limit: 5, windowSec: 15 * 60 },
  perEmail: { limit: 5, windowSec: 15 * 60 },
});
