'use client';

import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { GitCompareArrows, Heart, ShoppingBag } from 'lucide-react';
import { toggleCompare, toggleWishlist, COMPARE_MAX } from '@/store/slices/listsSlice';
import { addToCart } from '@/store/slices/cartSlice';
import { openCart } from '@/store/slices/uiSlice';
import { cn } from '@/lib/utils/cn';

export function WishlistButton({ productId, className, withLabel = false }) {
  const dispatch = useDispatch();
  const active = useSelector((s) => s.lists.wishlist.includes(productId));
  return (
    <button
      type="button"
      onClick={() => dispatch(toggleWishlist(productId))}
      aria-pressed={active}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      className={cn(withLabel ? 'btn-secondary' : 'icon-btn bg-ink-900/70 backdrop-blur', className)}
    >
      <Heart className={cn('h-[18px] w-[18px]', active && 'fill-blue-500 text-blue-500')} />
      {withLabel && <span>{active ? 'Saved' : 'Wishlist'}</span>}
    </button>
  );
}

export function CompareButton({ productId, className, withLabel = false }) {
  const dispatch = useDispatch();
  const list = useSelector((s) => s.lists.compare);
  const active = list.includes(productId);
  const full = !active && list.length >= COMPARE_MAX;
  return (
    <button
      type="button"
      onClick={() => dispatch(toggleCompare(productId))}
      disabled={full}
      aria-pressed={active}
      title={full ? `You can compare up to ${COMPARE_MAX} products` : undefined}
      aria-label={active ? 'Remove from compare' : 'Add to compare'}
      className={cn(withLabel ? 'btn-secondary' : 'icon-btn bg-ink-900/70 backdrop-blur', className)}
    >
      <GitCompareArrows className={cn('h-[18px] w-[18px]', active && 'text-blue-400')} />
      {withLabel && <span>{active ? 'Comparing' : 'Compare'}</span>}
    </button>
  );
}

/** Card-level add: simple products go straight to the cart; variant products open the product page. */
export function QuickAddButton({ product }) {
  const dispatch = useDispatch();
  if (!product.inStock) {
    return (
      <span className="btn-secondary btn-sm w-full cursor-default opacity-60" aria-disabled>
        Out of stock
      </span>
    );
  }
  if (product.hasVariants) {
    return (
      <Link href={`/product/${product.slug}`} className="btn-secondary btn-sm w-full">
        Choose options
      </Link>
    );
  }
  return (
    <button
      type="button"
      className="btn-primary btn-sm w-full"
      onClick={() => {
        dispatch(addToCart({ productId: product.id, quantity: 1 }));
        dispatch(openCart());
      }}
    >
      <ShoppingBag className="h-4 w-4" aria-hidden /> Add to cart
    </button>
  );
}
