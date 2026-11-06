import { route } from '@/server/http/route';
import { HttpError } from '@/server/http/errors';
import { uploadPaymentProof } from '@/server/media/paymentProof';

export const runtime = 'nodejs';
export const maxDuration = 30;

// multipart/form-data: file=<screenshot>. Used at checkout for Meezan Bank QR payments.
export const POST = route({ rateLimit: { name: 'payment-proof', limit: 10, windowSec: 60 * 60 }, status: 201 }, async ({ request }) => {
  let form;
  try {
    form = await request.formData();
  } catch {
    throw new HttpError(400, 'Upload must be multipart form data.');
  }
  return uploadPaymentProof(form.get('file'));
});
