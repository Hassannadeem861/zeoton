import 'server-only';
import crypto from 'node:crypto';

// Minimal signed Cloudinary REST client (upload + destroy) — avoids the full SDK.
function config() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error('Cloudinary environment variables are not set');
  return { cloudName, apiKey, apiSecret, folder: process.env.CLOUDINARY_FOLDER || 'zeoton/products' };
}

function sign(params, apiSecret) {
  const toSign = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== '')
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');
}

async function call(path, form) {
  const { cloudName } = config();
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/${path}`, { method: 'POST', body: form });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Cloudinary ${path} failed: ${json?.error?.message || res.status}`);
  return json;
}

/** Uploads an already-optimized WebP buffer. Cloudinary stores it as-is (no re-encoding). */
export async function uploadWebp(buffer, { folder } = {}) {
  const { apiKey, apiSecret, folder: defaultFolder } = config();
  const params = { folder: folder || defaultFolder, timestamp: Math.floor(Date.now() / 1000), unique_filename: 'true' };
  const form = new FormData();
  form.append('file', new Blob([buffer], { type: 'image/webp' }), 'image.webp');
  Object.entries(params).forEach(([k, v]) => form.append(k, String(v)));
  form.append('api_key', apiKey);
  form.append('signature', sign(params, apiSecret));
  const r = await call('upload', form);
  return { url: r.secure_url, publicId: r.public_id, width: r.width, height: r.height, format: r.format, bytes: r.bytes };
}

export async function destroyImage(publicId) {
  const { apiKey, apiSecret } = config();
  const params = { public_id: publicId, timestamp: Math.floor(Date.now() / 1000), invalidate: 'true' };
  const form = new FormData();
  Object.entries(params).forEach(([k, v]) => form.append(k, String(v)));
  form.append('api_key', apiKey);
  form.append('signature', sign(params, apiSecret));
  return call('destroy', form);
}

/** Best-effort cleanup; failures are logged, never thrown (DB state is already correct). */
export async function destroyImages(publicIds) {
  const { Media } = await import('../models/index.js');
  await Promise.all(
    publicIds.map(async (id) => {
      try {
        await destroyImage(id);
        await Media.deleteOne({ publicId: id });
      } catch (err) {
        console.warn('[cloudinary] destroy failed', id, err.message);
      }
    }),
  );
}
