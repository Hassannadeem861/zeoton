import { route } from '@/server/http/route';

export const GET = route({ withUser: true }, async ({ user }) => ({ user }));
