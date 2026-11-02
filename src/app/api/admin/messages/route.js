import { z } from 'zod';
import { route } from '@/server/http/route';
import { pagination } from '@/lib/validation/common';
import { adminListMessages } from '@/server/services/messageService';

const listQuery = z.object({ ...pagination, status: z.enum(['new', 'read', 'resolved', '']).optional() });

export const GET = route({ auth: 'admin', query: listQuery }, async ({ query }) => adminListMessages(query));
