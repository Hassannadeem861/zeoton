import 'server-only';
import { Media } from '@/server/models';
import { HttpError } from '@/server/http/errors';
import { ImageValidationError, optimizeToWebp } from './optimizeImage';
import { uploadWebp } from './cloudinary';

export const PROOF_FOLDER = `${(process.env.CLOUDINARY_FOLDER || 'zeoton/products').split('/')[0]}/payment-proofs`;

/** Stores a customer's payment screenshot (WebP, original size). Readability beats the 250 KB target here. */
export async function uploadPaymentProof(file) {
  if (!file || typeof file.arrayBuffer !== 'function') throw new HttpError(400, 'Please choose your payment screenshot.');
  if (file.type && !file.type.startsWith('image/')) throw new HttpError(400, 'The screenshot must be an image (JPG or PNG).');
  let result;
  try {
    result = await optimizeToWebp(Buffer.from(await file.arrayBuffer()));
  } catch (err) {
    if (err instanceof ImageValidationError) throw new HttpError(400, err.message, { code: err.code });
    throw err;
  }
  const uploaded = await uploadWebp(result.buffer, { folder: PROOF_FOLDER });
  await Media.create({ ...uploaded, originalBytes: result.originalBytes, originalFormat: result.originalFormat, quality: result.quality, withinTarget: result.ok, folder: PROOF_FOLDER });
  return { publicId: uploaded.publicId };
}
