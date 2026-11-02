import { route } from '@/server/http/route';
import { updateSettings } from '@/server/services/settingsService';
import { revalidateStorefront } from '@/server/utils';

// Body is validated per section inside updateSettings (src/lib/validation/settings.js).
export const PUT = route({ auth: 'admin' }, async ({ params, request, user }) => {
  const input = await request.json().catch(() => ({}));
  const value = await updateSettings(params.key, input, user.id);
  revalidateStorefront();
  return { key: params.key, value };
});
