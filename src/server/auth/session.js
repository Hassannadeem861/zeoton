import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { connectDB } from '@/server/db/connect';
import { Session, User } from '@/server/models';

export const SESSION_COOKIE = 'zt_session';

const TTL_MS = {
  customer: 30 * 24 * 60 * 60 * 1000,
  admin: 12 * 60 * 60 * 1000,
};

function hashToken(token) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must be set (32+ characters)');
  return crypto.createHmac('sha256', secret).update(token).digest('hex');
}

export async function createSession(user, request) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + TTL_MS[user.role === 'admin' ? 'admin' : 'customer']);
  await Session.create({
    tokenHash: hashToken(token),
    user: user._id,
    role: user.role,
    userAgent: request?.headers.get('user-agent')?.slice(0, 300),
    expiresAt,
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await connectDB();
    await Session.deleteOne({ tokenHash: hashToken(token) });
  }
  jar.delete(SESSION_COOKIE);
}

export async function destroyAllSessionsForUser(userId, { exceptCurrent = false } = {}) {
  const filter = { user: userId };
  if (exceptCurrent) {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (token) filter.tokenHash = { $ne: hashToken(token) };
  }
  await Session.deleteMany(filter);
}

/** Reads and validates the session cookie. Returns the safe user object or null. */
export async function readSessionUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;

  await connectDB();
  const session = await Session.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } })
    .select('user')
    .lean();
  if (!session) return null;

  const user = await User.findById(session.user).select('name email phone role isActive').lean();
  if (!user || !user.isActive) return null;

  return { id: String(user._id), name: user.name, email: user.email, phone: user.phone || '', role: user.role };
}
