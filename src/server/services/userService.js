import 'server-only';
import mongoose from 'mongoose';
import { Order, Product, User } from '@/server/models';
import { HttpError, conflict, notFound } from '@/server/http/errors';
import { hashPassword, verifyPassword } from '@/server/auth/password';
import { createSession, destroyAllSessionsForUser } from '@/server/auth/session';
import { escapeRegex, plain } from '@/server/utils';

const safeUser = (u) => ({ id: String(u._id), name: u.name, email: u.email, phone: u.phone || '', role: u.role });

export async function registerCustomer(input, request) {
  if (await User.exists({ email: input.email })) {
    throw conflict('An account with this email already exists. Try signing in instead.');
  }
  const user = await User.create({
    name: input.name,
    email: input.email,
    phone: input.phone,
    passwordHash: await hashPassword(input.password),
    role: 'customer',
  });
  await createSession(user, request);
  return safeUser(user);
}

/** @param {'customer'|'admin'} area which login form is used; admins must use the admin login. */
export async function login({ email, password }, request, area = 'customer') {
  const user = await User.findOne({ email }).select('+passwordHash name email phone role isActive');
  const valid = await verifyPassword(password, user?.passwordHash);
  if (!user || !valid || !user.isActive) throw new HttpError(401, 'Invalid email or password.');
  if (area === 'admin' && user.role !== 'admin') throw new HttpError(401, 'Invalid email or password.');
  user.lastLoginAt = new Date();
  await user.save();
  await createSession(user, request);
  return safeUser(user);
}

export async function getProfile(userId) {
  const user = await User.findById(userId).select('name email phone role addresses createdAt').lean();
  if (!user) throw notFound('Account not found.');
  return plain(user);
}

export async function updateProfile(userId, input) {
  const user = await User.findByIdAndUpdate(userId, { $set: input }, { returnDocument: 'after' }).lean();
  return safeUser(user);
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    throw new HttpError(400, 'Your current password is incorrect.', { details: { field: 'currentPassword' } });
  }
  user.passwordHash = await hashPassword(newPassword);
  await user.save();
  await destroyAllSessionsForUser(userId, { exceptCurrent: true });
  return { ok: true };
}

export async function replaceAddresses(userId, addresses) {
  let list = addresses.slice(0, 10);
  if (list.length && !list.some((a) => a.isDefault)) list = list.map((a, i) => ({ ...a, isDefault: i === 0 }));
  if (list.filter((a) => a.isDefault).length > 1) {
    let seen = false;
    list = list.map((a) => ({ ...a, isDefault: a.isDefault && !seen ? (seen = true) : false }));
  }
  const user = await User.findByIdAndUpdate(userId, { $set: { addresses: list } }, { returnDocument: 'after', runValidators: true })
    .select('addresses')
    .lean();
  return plain(user.addresses);
}

// Wishlist: stored on the user for signed-in customers.
export async function getWishlistIds(userId) {
  const user = await User.findById(userId).select('wishlist').lean();
  return (user?.wishlist || []).map(String);
}

export async function setWishlist(userId, ids, { merge = false } = {}) {
  const valid = ids.filter((id) => mongoose.isValidObjectId(id));
  const existing = merge ? await getWishlistIds(userId) : [];
  const unique = [...new Set([...existing, ...valid])].slice(0, 200);
  const live = await Product.find({ _id: { $in: unique } }).select('_id').lean();
  const liveSet = new Set(live.map((p) => String(p._id)));
  const finalIds = unique.filter((id) => liveSet.has(id));
  await User.updateOne({ _id: userId }, { $set: { wishlist: finalIds } });
  return finalIds;
}

// ---------- Admin ----------

export async function adminListCustomers({ q, page = 1, limit = 20 }) {
  const filter = { role: 'customer' };
  if (q) {
    const rx = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  const [users, total] = await Promise.all([
    User.find(filter).select('name email phone isActive createdAt lastLoginAt').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  const stats = await Order.aggregate([
    { $match: { user: { $in: users.map((u) => u._id) }, status: { $ne: 'cancelled' } } },
    { $group: { _id: '$user', orders: { $sum: 1 }, spent: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$total', 0] } } } },
  ]);
  const byUser = new Map(stats.map((s) => [String(s._id), s]));
  return plain({
    items: users.map((u) => ({ ...u, orders: byUser.get(String(u._id))?.orders || 0, deliveredValue: byUser.get(String(u._id))?.spent || 0 })),
    total,
    page,
    limit,
  });
}

export async function adminSetCustomerActive(id, isActive) {
  const user = await User.findOneAndUpdate({ _id: id, role: 'customer' }, { $set: { isActive } }, { returnDocument: 'after' }).lean();
  if (!user) throw notFound('Customer not found.');
  if (!isActive) await destroyAllSessionsForUser(id);
  return plain({ _id: user._id, isActive: user.isActive });
}
