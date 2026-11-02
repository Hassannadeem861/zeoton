import { route } from '@/server/http/route';
import { couponSchema } from '@/lib/validation/admin';
import { adminListCoupons, createCoupon } from '@/server/services/couponService';

export const GET = route({ auth: 'admin' }, async () => ({ items: await adminListCoupons() }));

export const POST = route({ auth: 'admin', body: couponSchema, status: 201 }, async ({ body }) => ({
  coupon: await createCoupon(body),
}));
