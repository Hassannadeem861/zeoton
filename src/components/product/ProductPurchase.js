'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Minus, Plus, ShoppingBag, Zap } from 'lucide-react';
import { addToCart } from '@/store/slices/cartSlice';
import { openCart } from '@/store/slices/uiSlice';
import { resolveOffer } from '@/lib/utils/pricing';
import { cn } from '@/lib/utils/cn';
import Price from './Price';
import { CompareButton, WishlistButton } from './ProductActions';

/** product: { _id, price, salePrice, stock, variants: [{ _id, label, price, salePrice, stock }] } */
export default function ProductPurchase({ product }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const hasVariants = product.variants.length > 0;
  const [variantId, setVariantId] = useState(() => (hasVariants ? product.variants.find((v) => v.stock > 0)?._id || null : null));
  const [qty, setQty] = useState(1);

  const variant = useMemo(() => product.variants.find((v) => v._id === variantId) || null, [product.variants, variantId]);
  const offer = resolveOffer(product, variant);
  const needsChoice = hasVariants && !variant;
  const stock = needsChoice ? 0 : offer.stock;
  const maxQty = Math.max(1, Math.min(20, stock));
  const canBuy = !needsChoice && stock > 0;

  const add = (goToCheckout) => {
    if (!canBuy) return;
    dispatch(addToCart({ productId: product._id, variantId, quantity: Math.min(qty, maxQty) }));
    if (goToCheckout) router.push('/checkout');
    else dispatch(openCart());
  };

  return (
    <div className="space-y-6">
      <div>
        <Price unitPrice={offer.unitPrice} price={offer.price} salePrice={offer.salePrice} size="lg" />
        {product.isDemo && <p className="mt-1 text-xs font-medium text-warning">Demo price — not a real ZEOTON price</p>}
      </div>

      {hasVariants && (
        <fieldset>
          <legend className="mb-2.5 text-sm font-medium text-mist-100">
            Option: <span className="text-mist-400">{variant?.label || 'Choose one'}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v._id}
                type="button"
                onClick={() => {
                  setVariantId(v._id);
                  setQty(1);
                }}
                aria-pressed={v._id === variantId}
                disabled={v.stock <= 0}
                className={cn(
                  'rounded-lg border px-3.5 py-2 text-sm transition disabled:cursor-not-allowed disabled:line-through disabled:opacity-40',
                  v._id === variantId ? 'border-blue-500 bg-blue-500/15 text-mist-50' : 'border-line-strong text-mist-300 hover:border-mist-500',
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <p className={cn('text-sm font-medium', canBuy ? 'text-success' : 'text-danger')} aria-live="polite">
        {needsChoice ? 'Choose an option' : stock > 0 ? (stock <= 5 ? `In stock — only ${stock} left` : 'In stock') : 'Out of stock'}
        {product.isDemo && !needsChoice && <span className="ml-1 font-normal text-warning">(demo stock)</span>}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-12 items-center rounded-lg border border-line-strong bg-ink-850">
          <button type="button" className="flex h-full w-11 items-center justify-center text-mist-300 hover:text-mist-50 disabled:opacity-40" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1 || !canBuy} aria-label="Decrease quantity">
            <Minus className="h-4 w-4" />
          </button>
          <output className="w-10 text-center font-semibold" aria-label="Quantity">{qty}</output>
          <button type="button" className="flex h-full w-11 items-center justify-center text-mist-300 hover:text-mist-50 disabled:opacity-40" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty || !canBuy} aria-label="Increase quantity">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button type="button" className="btn-primary btn-lg flex-1" disabled={!canBuy} onClick={() => add(false)}>
          <ShoppingBag className="h-5 w-5" aria-hidden /> Add to cart
        </button>
      </div>
      <button type="button" className="btn-secondary btn-lg w-full" disabled={!canBuy} onClick={() => add(true)}>
        <Zap className="h-5 w-5 text-blue-400" aria-hidden /> Buy now — Cash on Delivery
      </button>
      <div className="flex gap-2">
        <WishlistButton productId={product._id} withLabel className="flex-1" />
        <CompareButton productId={product._id} withLabel className="flex-1" />
      </div>
    </div>
  );
}
