import { formatPKR } from '@/lib/utils/format';

/** quote: response of /api/checkout/quote */
export default function OrderSummary({ quote, children }) {
  if (!quote) return null;
  const { subtotal, discount, coupon, shipping, total } = quote;
  return (
    <dl className="space-y-2.5 text-sm">
      <div className="flex justify-between">
        <dt className="text-mist-400">Subtotal</dt>
        <dd>{formatPKR(subtotal)}</dd>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-success">
          <dt>Discount {coupon?.code && `(${coupon.code})`}</dt>
          <dd>−{formatPKR(discount)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-4">
        <dt className="text-mist-400">Shipping</dt>
        <dd className="text-right">
          {shipping.pending ? <span className="text-mist-300">To be confirmed</span> : shipping.fee === 0 ? 'Free' : formatPKR(shipping.fee)}
        </dd>
      </div>
      {shipping.pending && (
        <p className="rounded-lg bg-ink-800 px-3 py-2 text-xs leading-relaxed text-mist-400">
          Shipping charges have not been finalised yet. If a charge applies, it will be added to your order and shown on your order tracking page before dispatch.
        </p>
      )}
      <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
        <dt>Total{shipping.pending && <span className="ml-1 text-xs font-normal text-mist-400">(excl. shipping)</span>}</dt>
        <dd className="font-display text-mist-50">{formatPKR(total)}</dd>
      </div>
      {children}
    </dl>
  );
}
