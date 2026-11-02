import { z } from 'zod';
import { route } from '@/server/http/route';
import { objectId } from '@/lib/validation/common';
import { lookupProducts } from '@/server/services/productService';

const schema = z.object({ ids: z.array(objectId).max(60) });

// POST so long ID lists are not limited by URL length; read-only.
export const POST = route({ body: schema }, async ({ body }) => ({ items: await lookupProducts(body.ids) }));
