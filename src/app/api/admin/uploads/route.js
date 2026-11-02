import { route } from '@/server/http/route';
import { HttpError } from '@/server/http/errors';
import { processAdminUpload } from '@/server/media/uploadService';

export const runtime = 'nodejs';
export const maxDuration = 30;

// multipart/form-data: file=<image>, allowOversize=1 (optional, after the admin confirms the warning)
export const POST = route(
  { auth: 'admin', rateLimit: { name: 'upload', limit: 60, windowSec: 10 * 60 }, status: 201 },
  async ({ request, user }) => {
    let form;
    try {
      form = await request.formData();
    } catch {
      throw new HttpError(400, 'Upload must be multipart form data.');
    }
    const image = await processAdminUpload(form.get('file'), {
      allowOversize: form.get('allowOversize') === '1',
      userId: user.id,
    });
    return { image };
  },
);
