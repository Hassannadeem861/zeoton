import { route } from '@/server/http/route';
import { messageUpdateSchema } from '@/lib/validation/admin';
import { adminDeleteMessage, adminUpdateMessage } from '@/server/services/messageService';

export const PATCH = route({ auth: 'admin', body: messageUpdateSchema }, async ({ params, body }) => ({
  message: await adminUpdateMessage(params.id, body),
}));

export const DELETE = route({ auth: 'admin' }, async ({ params }) => adminDeleteMessage(params.id));
