import { route } from '@/server/http/route';
import { customerUpdateSchema } from '@/lib/validation/admin';
import { adminSetCustomerActive } from '@/server/services/userService';

export const PATCH = route({ auth: 'admin', body: customerUpdateSchema }, async ({ params, body }) =>
  adminSetCustomerActive(params.id, body.isActive),
);
