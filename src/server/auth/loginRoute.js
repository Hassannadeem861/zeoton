import 'server-only';
import { route } from '@/server/http/route';
import { assertNotLimited, recordFailure } from '@/server/http/rateLimit';
import { loginSchema } from '@/lib/validation/auth';
import { login } from '@/server/services/userService';

/**
 * Login handler factory. Only FAILED attempts count toward the limits, per IP and per
 * account email (slows credential stuffing without locking out legitimate sign-ins).
 */
export function loginRoute(area, { perIp, perEmail }) {
  return route({ body: loginSchema }, async ({ body, request }) => {
    const ipLimit = { name: `${area}-login-ip`, ...perIp };
    const emailLimit = { name: `${area}-login-email`, key: body.email, ...perEmail };
    await assertNotLimited(request, ipLimit);
    await assertNotLimited(request, emailLimit);
    try {
      return { user: await login(body, request, area) };
    } catch (err) {
      if (err?.status === 401) {
        await Promise.all([recordFailure(request, ipLimit), recordFailure(request, emailLimit)]);
      }
      throw err;
    }
  });
}
