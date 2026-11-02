import 'server-only';
import { Coupon } from '@/server/models';
import { conflict, notFound } from '@/server/http/errors';
import { formatPKR } from '@/lib/utils/format';
import { plain } from '@/server/utils';

/** Returns { coupon } when usable for this subtotal, otherwise { error }. */
export async function findValidCoupon(code, subtotal, session) {
  if (!code) return {};
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() }).session(session || null).lean();
  const now = new Date();
  if (!coupon || !coupon.isActive) return { error: 'This coupon code is not valid.' };
  if (coupon.startsAt && coupon.startsAt > now) return { error: 'This coupon is not active yet.' };
  if (coupon.expiresAt && coupon.expiresAt < now) return { error: 'This coupon has expired.' };
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) return { error: 'This coupon has reached its usage limit.' };
  if (subtotal < (coupon.minOrder || 0)) {
    return { error: `This coupon needs a minimum order of ${formatPKR(coupon.minOrder)}.` };
  }
  return { coupon };
}

export async function adminListCoupons() {
  return plain(await Coupon.find().sort({ createdAt: -1 }).lean());
}

export async function createCoupon(input) {
  if (await Coupon.exists({ code: input.code })) throw conflict('A coupon with this code already exists.');
  return plain((await Coupon.create(input)).toObject());
}

export async function updateCoupon(id, input) {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw notFound('Coupon not found.');
  if (input.code !== coupon.code && (await Coupon.exists({ code: input.code }))) {
    throw conflict('A coupon with this code already exists.');
  }
  coupon.set(input);
  await coupon.save();
  return plain(coupon.toObject());
}

export async function deleteCoupon(id) {
  const res = await Coupon.deleteOne({ _id: id });
  if (!res.deletedCount) throw notFound('Coupon not found.');
  return { ok: true };
}
