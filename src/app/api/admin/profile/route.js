import { route } from '@/server/http/route';
import { profileSchema } from '@/lib/validation/auth';
import { updateProfile } from '@/server/services/userService';

export const PATCH = route({ auth: 'admin', body: profileSchema }, async ({ user, body }) => ({
  user: await updateProfile(user.id, body),
}));
