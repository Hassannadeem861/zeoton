import { z } from 'zod';
import { route } from '@/server/http/route';
import { addressSchema } from '@/lib/validation/checkout';
import { replaceAddresses } from '@/server/services/userService';

const schema = z.object({ addresses: z.array(addressSchema.extend({ isDefault: z.boolean().optional() })).max(10) });

export const PUT = route({ auth: 'user', body: schema }, async ({ user, body }) => ({
  addresses: await replaceAddresses(user.id, body.addresses),
}));
