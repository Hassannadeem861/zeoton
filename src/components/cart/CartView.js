'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import { useCartQuote } from './useCartQuote';
import CartLine from './CartLine';
import OrderSummary from './OrderSummary';
import CouponForm from './CouponForm';
import { DemoCartNotice } from '@/components/product/DemoBadge';

export default function CartView() {
  const { items, hydrated, data: quote, isLoading, isError, refetch } = useCartQuote();

  if (!hydrated || (items.length > 0 && isLoading)) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-mist-400" aria-label="Loading cart" />
      </div>
    );
  }
  if (!items.length) {
    return <EmptyState title="Your cart is empty" description="Browse the store and add gear to your cart." actionHref="/products" actionLabel="Start shopping" />;
  }
  if (isError) {
    return (
      <div className="surface p-8 text-center">
        <p className="text-danger">We could not load your cart.</p>
        <button type="button" className="btn-secondary mt-4" onClick={refetch}>Try again</button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section aria-label="Cart items" className="surface px-5">
        <ul className="divide-y divide-line">
          {quote?.lines.map((line) => (
            <CartLine key={`${line.productId}:${line.variantId || ''}`} line={line} />
          ))}
        </ul>
      </section>
      <aside className="surface h-fit space-y-5 p-5 lg:sticky lg:top-28" aria-label="Order summary">
        <h2 className="text-lg font-semibold">Order summary</h2>
        {quote?.hasDemoItems && <DemoCartNotice />}
        <CouponForm quote={quote} />
        <OrderSummary quote={quote} />
        {quote?.hasIssues && <p className="text-xs text-warning">Some items need attention before you can check out.</p>}
        <Link href="/checkout" aria-disabled={quote?.hasIssues} className={`btn-primary btn-lg w-full ${quote?.hasIssues ? 'pointer-events-none opacity-50' : ''}`}>
          Proceed to checkout
        </Link>
        <Link href="/products" className="block text-center text-sm text-mist-400 hover:text-mist-50">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
