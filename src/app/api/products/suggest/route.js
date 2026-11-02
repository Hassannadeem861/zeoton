import { z } from 'zod';
import { route } from '@/server/http/route';
import { searchSuggestions } from '@/server/services/productService';

const schema = z.object({ q: z.string().trim().max(80).default('') });

export const GET = route(
  { query: schema, rateLimit: { name: 'suggest', limit: 120, windowSec: 60 } },
  async ({ query }) => searchSuggestions(query.q),
);
