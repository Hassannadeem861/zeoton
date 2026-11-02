import 'server-only';
import { ContactMessage } from '@/server/models';
import { notFound } from '@/server/http/errors';
import { plain } from '@/server/utils';

export async function createMessage({ company, ...input }) {
  // Honeypot filled → silently accept without storing (bot).
  if (company) return { ok: true };
  await ContactMessage.create(input);
  return { ok: true };
}

export async function adminListMessages({ status, page = 1, limit = 20 }) {
  const filter = status ? { status } : {};
  const [items, total] = await Promise.all([
    ContactMessage.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ContactMessage.countDocuments(filter),
  ]);
  return plain({ items, total, page, limit });
}

export async function adminUpdateMessage(id, { status }) {
  const msg = await ContactMessage.findByIdAndUpdate(id, { $set: { status } }, { returnDocument: 'after' }).lean();
  if (!msg) throw notFound('Message not found.');
  return plain(msg);
}

export async function adminDeleteMessage(id) {
  const res = await ContactMessage.deleteOne({ _id: id });
  if (!res.deletedCount) throw notFound('Message not found.');
  return { ok: true };
}
