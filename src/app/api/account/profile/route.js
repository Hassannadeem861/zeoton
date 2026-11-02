import { route } from '@/server/http/route';
import { profileSchema } from '@/lib/validation/auth';
import { getProfile, updateProfile } from '@/server/services/userService';

export const GET = route({ auth: 'user' }, async ({ user }) => ({ profile: await getProfile(user.id) }));

export const PATCH = route({ auth: 'user', body: profileSchema }, async ({ user, body }) => ({
  user: await updateProfile(user.id, body),
}));
