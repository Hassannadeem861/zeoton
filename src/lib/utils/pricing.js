// Shared price helpers (server and client). Prices are whole PKR.

export function effectivePrice(price, salePrice) {
  return salePrice != null && salePrice < price ? salePrice : price;
}

// Resolves the selling price and stock for a product or one of its variants.
export function resolveOffer(product, variant) {
  if (variant) {
    const price = variant.price ?? product.price;
    const sale = variant.price != null ? variant.salePrice : variant.salePrice ?? product.salePrice;
    return { price, salePrice: sale ?? null, unitPrice: effectivePrice(price, sale), stock: variant.stock ?? 0 };
  }
  return {
    price: product.price,
    salePrice: product.salePrice ?? null,
    unitPrice: effectivePrice(product.price, product.salePrice),
    stock: product.stock ?? 0,
  };
}

export function totalStock(product) {
  if (product.variants?.length) return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  return product.stock || 0;
}

export function discountPercent(price, salePrice) {
  if (salePrice == null || salePrice >= price || price <= 0) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

export function computeCouponDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  let discount = coupon.type === 'percent' ? Math.floor((subtotal * coupon.value) / 100) : Math.floor(coupon.value);
  if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
  return Math.max(0, Math.min(discount, subtotal));
}

// shipping settings -> { fee: number|null, pending: boolean }
export function computeShipping(shipping, subtotalAfterDiscount) {
  if (!shipping || shipping.mode === 'pending') return { fee: null, pending: true };
  if (shipping.mode === 'free') return { fee: 0, pending: false };
  const threshold = shipping.freeShippingThreshold;
  if (threshold != null && subtotalAfterDiscount >= threshold) return { fee: 0, pending: false };
  if (shipping.flatFee == null) return { fee: null, pending: true };
  return { fee: shipping.flatFee, pending: false };
}
