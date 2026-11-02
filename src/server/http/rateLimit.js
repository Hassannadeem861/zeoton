import 'server-only';
import { RateLimit } from '@/server/models';
import { HttpError } from './errors';

export function getClientIp(request) {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'local';
}

function windowKey(request, { name, windowSec, key }) {
  const windowMs = windowSec * 1000;
  const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
  return { id: `${name}:${key || getClientIp(request)}:${windowStart}`, expiresAt: new Date(windowStart + windowMs) };
}

function tooMany(expiresAt) {
  return new HttpError(429, 'Too many attempts. Please wait a few minutes and try again.', {
    code: 'RATE_LIMITED',
    details: { retryAfter: Math.ceil((expiresAt.getTime() - Date.now()) / 1000) },
  });
}

/** Failure-only limiting (e.g. logins): check first, record only failed attempts. */
export async function assertNotLimited(request, opts) {
  const { id, expiresAt } = windowKey(request, opts);
  const doc = await RateLimit.findOne({ key: id }).lean();
  if (doc && doc.count >= opts.limit) throw tooMany(expiresAt);
}

export async function recordFailure(request, opts) {
  const { id, expiresAt } = windowKey(request, opts);
  await RateLimit.updateOne({ key: id }, { $inc: { count: 1 }, $setOnInsert: { expiresAt } }, { upsert: true }).catch((err) => {
    if (err?.code !== 11000) throw err;
    return RateLimit.updateOne({ key: id }, { $inc: { count: 1 } });
  });
}

/**
 * Fixed-window limiter backed by MongoDB (TTL index cleans old windows).
 * @param {Request} request
 * @param {{ name: string, limit: number, windowSec: number, key?: string }} opts
 */
export async function enforceRateLimit(request, opts) {
  const { id, expiresAt } = windowKey(request, opts);
  const update = { $inc: { count: 1 }, $setOnInsert: { expiresAt } };

  let doc;
  try {
    doc = await RateLimit.findOneAndUpdate({ key: id }, update, { upsert: true, returnDocument: 'after', lean: true });
  } catch (err) {
    if (err?.code !== 11000) throw err;
    doc = await RateLimit.findOneAndUpdate({ key: id }, update, { returnDocument: 'after', lean: true });
  }

  if (doc.count > opts.limit) throw tooMany(expiresAt);
}
