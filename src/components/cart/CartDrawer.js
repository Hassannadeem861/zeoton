'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, ShoppingBag, X } from 'lucide-react';
import { closeCart } from '@/store/slices/uiSlice';
import { lockScroll } from '@/lib/scroll/scrollLock';
import { useCartQuote } from './useCartQuote';
import CartLine from './CartLine';
import OrderSummary from './OrderSummary';
import { DemoCartNotice } from '@/components/product/DemoBadge';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const open = useSelector((s) => s.ui.cartOpen);
  const pathname = usePathname();
  const panelRef = useRef(null);
  const { items, data: quote, isFetching, isError } = useCartQuote();
  const [lastPath, setLastPath] = useState(pathname);

  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) dispatch(closeCart());
  }

  useEffect(() => {
    if (!open) return undefined;
    const prevFocus = document.activeElement;
    const onKey = (e) => e.key === 'Escape' && dispatch(closeCart());
    document.addEventListener('keydown', onKey);
    const unlockScroll = lockScroll();
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      unlockScroll();
      prevFocus?.focus?.();
    };
  }, [open, dispatch]);

  if (!open) return null;
  const lines = quote?.lines || [];

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => dispatch(closeCart())} aria-hidden />
      <div ref={panelRef} tabIndex={-1} className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-ink-850 outline-none">
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <h2 id="cart-title" className="text-lg font-semibold">
            Your cart
          </h2>
          <button type="button" className="icon-btn" onClick={() => dispatch(closeCart())} aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <ShoppingBag className="h-10 w-10 text-mist-500" aria-hidden />
            <p className="text-mist-300">Your cart is empty.</p>
            <Link href="/products" className="btn-primary" onClick={() => dispatch(closeCart())}>
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5" data-lenis-prevent>
              {!quote && isFetching && (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-mist-400" aria-label="Loading cart" />
                </div>
              )}
              {isError && <p className="py-6 text-sm text-danger">We could not load your cart. Please try again.</p>}
              <ul className="divide-y divide-line">
                {lines.map((line) => (
                  <CartLine key={`${line.productId}:${line.variantId || ''}`} line={line} />
                ))}
              </ul>
            </div>
            <div className="space-y-4 border-t border-line p-5">
              {quote?.hasDemoItems && <DemoCartNotice />}
              <OrderSummary quote={quote} />
              <div className="grid grid-cols-2 gap-3">
                <Link href="/cart" className="btn-secondary" onClick={() => dispatch(closeCart())}>
                  View cart
                </Link>
                <Link
                  href="/checkout"
                  aria-disabled={quote?.hasIssues}
                  className={`btn-primary ${quote?.hasIssues ? 'pointer-events-none opacity-50' : ''}`}
                  onClick={() => dispatch(closeCart())}
                >
                  Checkout
                </Link>
              </div>
              {quote?.hasIssues && <p className="text-xs text-warning">Please fix the highlighted items before checkout.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
