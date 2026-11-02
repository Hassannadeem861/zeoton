import { route } from '@/server/http/route';
import { getAllSettings } from '@/server/services/settingsService';

export const GET = route({ auth: 'admin' }, async () => ({ settings: await getAllSettings() }));
