import 'server-only';
import { Product } from '@/server/models';
import { computeCouponDiscount, computeShipping, resolveOffer } from '@/lib/utils/pricing';
import { getSettings } from './settingsService';
import { findValidCoupon } from './couponService';

/**
 * Prices a cart from the database (client prices are never trusted).
 * Used for the live cart/checkout summary and, inside a transaction, for order creation.
 */
export async function priceCart({ items, couponCode }, { session } = {}) {
  const ids = [...new Set(items.map((i) => i.productId))];
  const products = await Product.find({ _id: { $in: ids }, isActive: true })
    .select('name slug sku images price salePrice stock variants isDemo')
    .session(session || null)
    .lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const lines = items.map((item) => {
    const product = byId.get(item.productId);
    const base = { productId: item.productId, variantId: item.variantId || null, quantity: item.quantity };
    if (!product) return { ...base, issue: 'unavailable', message: 'This product is no longer available.' };

    let variant = null;
    if (product.variants?.length) {
      variant = product.variants.find((v) => String(v._id) === item.variantId);
      if (!variant) return { ...base, name: product.name, issue: 'variant_required', message: 'Please choose an option for this product.' };
    }
    const offer = resolveOffer(product, variant);
    const line = {
      ...base,
      name: product.name,
      slug: product.slug,
      sku: variant?.sku || product.sku,
      variantLabel: variant?.label || null,
      image: product.images?.[0]?.url || null,
      isDemo: !!product.isDemo,
      price: offer.price,
      salePrice: offer.salePrice,
      unitPrice: offer.unitPrice,
      available: offer.stock,
      lineTotal: offer.unitPrice * item.quantity,
    };
    if (offer.stock <= 0) return { ...line, issue: 'out_of_stock', message: 'Out of stock.' };
    if (offer.stock < item.quantity) {
      return { ...line, issue: 'insufficient_stock', message: `Only ${offer.stock} left in stock.` };
    }
    return line;
  });

  const valid = lines.filter((l) => !l.issue);
  const subtotal = valid.reduce((sum, l) => sum + l.lineTotal, 0);

  const { coupon, error: couponError } = await findValidCoupon(couponCode, subtotal, session);
  const discount = computeCouponDiscount(coupon, subtotal);

  const store = await getSettings('store');
  const shipping = computeShipping(store.shipping, subtotal - discount);

  return {
    lines,
    subtotal,
    discount,
    coupon: coupon ? { _id: coupon._id, code: coupon.code, type: coupon.type, value: coupon.value } : null,
    couponError: couponCode ? couponError || null : null,
    shipping: {
      fee: shipping.fee,
      pending: shipping.pending,
      coverageText: store.shipping.coverageText,
      deliveryTimeText: store.shipping.deliveryTimeText,
      freeShippingThreshold: store.shipping.mode === 'flat' ? store.shipping.freeShippingThreshold : null,
    },
    total: subtotal - discount + (shipping.fee || 0),
    hasIssues: lines.some((l) => l.issue),
    hasDemoItems: lines.some((l) => l.isDemo),
  };
}
