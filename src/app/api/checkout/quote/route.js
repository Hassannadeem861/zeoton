import { route } from '@/server/http/route';
import { cartQuoteSchema } from '@/lib/validation/checkout';
import { priceCart } from '@/server/services/cartService';
import { getSettings } from '@/server/services/settingsService';
import { listEnabledPaymentMethods } from '@/server/payments';

export const POST = route(
  { body: cartQuoteSchema, rateLimit: { name: 'quote', limit: 120, windowSec: 60 } },
  async ({ body }) => {
    const { coupon, ...quote } = await priceCart(body);
    const store = await getSettings('store');
    return {
      ...quote,
      coupon: coupon ? { code: coupon.code, type: coupon.type, value: coupon.value } : null,
      paymentMethods: listEnabledPaymentMethods(store),
      codNote: store.payment.codNote,
    };
  },
);
