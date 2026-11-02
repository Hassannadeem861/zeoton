'use client';

import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { removeFromCart, setQuantity } from '@/store/slices/cartSlice';
import { formatPKR } from '@/lib/utils/format';
import ProductImage from '@/components/product/ProductImage';
import DemoBadge from '@/components/product/DemoBadge';

export default function CartLine({ line }) {
  const dispatch = useDispatch();
  const key = { productId: line.productId, variantId: line.variantId };
  const max = Math.max(1, Math.min(20, line.available ?? 20));

  return (
    <li className="flex gap-3 py-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-line bg-ink-800 p-1.5">
        <ProductImage image={line.image ? { url: line.image } : null} alt={line.name || 'Product'} sizes="80px" fill />
      </div>
      <div className="min-w-0 flex-1">
        {line.slug ? (
          <Link href={`/product/${line.slug}`} className="line-clamp-2 text-sm font-medium text-mist-100 hover:text-blue-300">
            {line.name}
          </Link>
        ) : (
          <p className="text-sm text-mist-300">{line.name || 'Unavailable product'}</p>
        )}
        {line.variantLabel && <p className="mt-0.5 text-xs text-mist-400">{line.variantLabel}</p>}
        {line.isDemo && <DemoBadge className="mt-1" />}
        {line.issue && <p className="mt-1 text-xs font-medium text-warning">{line.message}</p>}
        <div className="mt-2 flex items-center justify-between gap-2">
          {line.issue === 'unavailable' ? (
            <span />
          ) : (
            <div className="flex h-8 items-center rounded-md border border-line-strong">
              <button type="button" className="flex h-full w-8 items-center justify-center text-mist-400 hover:text-mist-50 disabled:opacity-40" disabled={line.quantity <= 1} onClick={() => dispatch(setQuantity({ ...key, quantity: line.quantity - 1 }))} aria-label={`Decrease quantity of ${line.name}`}>
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-7 text-center text-sm" aria-label="Quantity">{line.quantity}</span>
              <button type="button" className="flex h-full w-8 items-center justify-center text-mist-400 hover:text-mist-50 disabled:opacity-40" disabled={line.quantity >= max} onClick={() => dispatch(setQuantity({ ...key, quantity: line.quantity + 1 }))} aria-label={`Increase quantity of ${line.name}`}>
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            {line.lineTotal != null && <span className="text-sm font-semibold">{formatPKR(line.lineTotal)}</span>}
            <button type="button" className="icon-btn h-8 w-8" onClick={() => dispatch(removeFromCart(key))} aria-label={`Remove ${line.name || 'item'} from cart`}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
