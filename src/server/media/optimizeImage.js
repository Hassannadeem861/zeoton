import 'server-only';
import sharp from 'sharp';

export const IMAGE_POLICY = {
  targetBytes: 250 * 1024, // 250 KB target per image
  maxInputBytes: 4 * 1024 * 1024, // Vercel functions accept ~4.5 MB request bodies
  minQuality: 62, // below this WebP artifacts become visible on product photos
  maxQuality: 92,
  minDimension: 300,
  maxDimension: 6000,
  maxPixels: 36_000_000,
  allowedFormats: ['jpeg', 'png', 'webp', 'avif', 'tiff', 'gif'],
};

export class ImageValidationError extends Error {
  constructor(message, code, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

async function encode(input, quality, { hasAlpha, effort = 5 }) {
  return sharp(input, { limitInputPixels: IMAGE_POLICY.maxPixels, animated: false })
    .rotate() // apply EXIF orientation, then strip metadata
    .webp({
      quality,
      alphaQuality: hasAlpha ? Math.min(100, quality + 8) : 100,
      effort,
      smartSubsample: true,
    })
    .toBuffer({ resolveWithObject: true });
}

/**
 * Converts an image to WebP at its original pixel dimensions, choosing the highest
 * quality that fits the 250 KB target (binary search). Never resizes or upscales.
 *
 * Returns { ok: true, ... } when the target is met, or { ok: false, reason: 'TARGET_UNREACHABLE', ... }
 * with the best acceptable encode when it cannot be met without dropping below minQuality.
 * Throws ImageValidationError for invalid input.
 */
export async function optimizeToWebp(buffer, policy = IMAGE_POLICY) {
  if (!buffer?.length) throw new ImageValidationError('The file is empty.', 'EMPTY_FILE');
  if (buffer.length > policy.maxInputBytes) {
    throw new ImageValidationError(
      `The file is ${(buffer.length / 1024 / 1024).toFixed(1)} MB. The maximum upload size is ${policy.maxInputBytes / 1024 / 1024} MB.`,
      'FILE_TOO_LARGE',
    );
  }

  let meta;
  try {
    meta = await sharp(buffer, { limitInputPixels: policy.maxPixels }).metadata();
  } catch {
    throw new ImageValidationError('This file is not a supported image.', 'INVALID_IMAGE');
  }
  if (!policy.allowedFormats.includes(meta.format)) {
    throw new ImageValidationError(`Unsupported format "${meta.format}". Use JPG, PNG, WebP or AVIF.`, 'UNSUPPORTED_FORMAT');
  }

  // Orientations 5–8 swap width/height after rotation.
  const rotated = meta.orientation >= 5;
  const width = rotated ? meta.height : meta.width;
  const height = rotated ? meta.width : meta.height;
  if (Math.min(width, height) < policy.minDimension) {
    throw new ImageValidationError(
      `The image is ${width}×${height}px. Use at least ${policy.minDimension}px on the shortest side so it stays sharp on product pages.`,
      'TOO_SMALL',
    );
  }
  if (Math.max(width, height) > policy.maxDimension) {
    throw new ImageValidationError(
      `The image is ${width}×${height}px. The maximum is ${policy.maxDimension}px on the longest side.`,
      'TOO_LARGE_DIMENSIONS',
    );
  }

  const opts = { hasAlpha: !!meta.hasAlpha };
  const base = { width, height, format: 'webp', originalBytes: buffer.length, originalFormat: meta.format };

  // Fast path: best quality already fits.
  let best = await encode(buffer, policy.maxQuality, opts);
  if (best.data.length <= policy.targetBytes) {
    return { ok: true, ...base, buffer: best.data, bytes: best.data.length, quality: policy.maxQuality };
  }

  // Check the quality floor before searching.
  const floor = await encode(buffer, policy.minQuality, opts);
  if (floor.data.length > policy.targetBytes) {
    return {
      ok: false,
      reason: 'TARGET_UNREACHABLE',
      ...base,
      buffer: floor.data,
      bytes: floor.data.length,
      quality: policy.minQuality,
    };
  }

  // Binary search for the highest quality that still fits the target.
  let lo = policy.minQuality;
  let hi = policy.maxQuality - 1;
  best = { data: floor.data, quality: policy.minQuality };
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const out = await encode(buffer, mid, opts);
    if (out.data.length <= policy.targetBytes) {
      best = { data: out.data, quality: mid };
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return { ok: true, ...base, buffer: best.data, bytes: best.data.length, quality: best.quality };
}
