import { route } from '@/server/http/route';
import { destroySession } from '@/server/auth/session';

export const POST = route({}, async () => {
  await destroySession();
  return { ok: true };
});
