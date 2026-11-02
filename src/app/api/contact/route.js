import { route } from '@/server/http/route';
import { contactSchema } from '@/lib/validation/admin';
import { createMessage } from '@/server/services/messageService';

export const POST = route(
  { body: contactSchema, rateLimit: { name: 'contact', limit: 5, windowSec: 60 * 60 }, status: 201 },
  async ({ body }) => createMessage(body),
);
