import { loginRoute } from '@/server/auth/loginRoute';

export const POST = loginRoute('customer', {
  perIp: { limit: 10, windowSec: 15 * 60 },
  perEmail: { limit: 8, windowSec: 15 * 60 },
});
