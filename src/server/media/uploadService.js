import 'server-only';
import { Media } from '@/server/models';
import { HttpError } from '@/server/http/errors';
import { IMAGE_POLICY, ImageValidationError, optimizeToWebp } from './optimizeImage';
import { uploadWebp } from './cloudinary';

const kb = (b) => `${Math.round(b / 1024)} KB`;

/**
 * Validates, optimizes and uploads one admin image.
 * If the 250 KB target is unreachable at acceptable quality, nothing is uploaded and a
 * 422 warning is returned — unless the admin explicitly confirms with allowOversize.
 */
export async function processAdminUpload(file, { allowOversize = false, userId, folder } = {}) {
  if (!file || typeof file.arrayBuffer !== 'function') throw new HttpError(400, 'No file was uploaded.');
  if (file.type && !file.type.startsWith('image/')) throw new HttpError(400, 'Only image files can be uploaded.');

  let result;
  try {
    result = await optimizeToWebp(Buffer.from(await file.arrayBuffer()));
  } catch (err) {
    if (err instanceof ImageValidationError) throw new HttpError(400, err.message, { code: err.code });
    throw err;
  }

  if (!result.ok && !allowOversize) {
    throw new HttpError(
      422,
      `This image can't be reduced to ${kb(IMAGE_POLICY.targetBytes)} without visible quality loss. ` +
        `The smallest good-quality version is ${kb(result.bytes)} (${result.width}×${result.height}px). ` +
        `Upload it anyway, or crop/resize the original and try again.`,
      {
        code: 'IMAGE_TARGET_UNREACHABLE',
        details: { bytes: result.bytes, width: result.width, height: result.height, quality: result.quality, targetBytes: IMAGE_POLICY.targetBytes },
      },
    );
  }

  const uploaded = await uploadWebp(result.buffer, { folder });
  const media = await Media.create({
    ...uploaded,
    originalBytes: result.originalBytes,
    originalFormat: result.originalFormat,
    quality: result.quality,
    withinTarget: result.ok,
    folder: folder || process.env.CLOUDINARY_FOLDER,
    uploadedBy: userId,
  });

  return {
    url: media.url,
    publicId: media.publicId,
    width: media.width,
    height: media.height,
    format: media.format,
    bytes: media.bytes,
    originalBytes: media.originalBytes,
    quality: media.quality,
    withinTarget: media.withinTarget,
  };
}
