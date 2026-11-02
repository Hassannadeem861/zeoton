import { route } from '@/server/http/route';
import { couponSchema } from '@/lib/validation/admin';
import { deleteCoupon, updateCoupon } from '@/server/services/couponService';

export const PUT = route({ auth: 'admin', body: couponSchema }, async ({ params, body }) => ({
  coupon: await updateCoupon(params.id, body),
}));

export const DELETE = route({ auth: 'admin' }, async ({ params }) => deleteCoupon(params.id));
