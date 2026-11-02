import { z } from 'zod';
import { route } from '@/server/http/route';
import { objectId } from '@/lib/validation/common';
import { getWishlistIds, setWishlist } from '@/server/services/userService';

const schema = z.object({ ids: z.array(objectId).max(200), merge: z.boolean().optional() });

export const GET = route({ auth: 'user' }, async ({ user }) => ({ ids: await getWishlistIds(user.id) }));

export const PUT = route({ auth: 'user', body: schema }, async ({ user, body }) => ({
  ids: await setWishlist(user.id, body.ids, { merge: body.merge }),
}));
