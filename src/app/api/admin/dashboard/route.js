import { route } from '@/server/http/route';
import { getDashboard } from '@/server/services/dashboardService';

export const GET = route({ auth: 'admin' }, async () => getDashboard());
