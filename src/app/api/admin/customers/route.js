import { z } from 'zod';
import { route } from '@/server/http/route';
import { pagination } from '@/lib/validation/common';
import { adminListCustomers } from '@/server/services/userService';

const listQuery = z.object({ ...pagination, q: z.string().trim().max(80).optional() });

export const GET = route({ auth: 'admin', query: listQuery }, async ({ query }) => adminListCustomers(query));
