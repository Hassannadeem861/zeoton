import { formatDate, formatDateTime, formatPKR, ORDER_STATUS_LABELS, PAYMENT_LABELS } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

const STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

export function StatusBadge({ status }) {
  const tone = {
    pending: 'bg-warning/15 text-warning',
    confirmed: 'bg-blue-500/15 text-blue-300',
    shipped: 'bg-blue-500/15 text-blue-300',
    delivered: 'bg-success/15 text-success',
    cancelled: 'bg-danger/15 text-danger',
  }[status];
  return <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-medium', tone)}>{ORDER_STATUS_LABELS[status] || status}</span>;
}

/** order: public order view from orderService (shared by tracking and account pages). */
export default function OrderDetails({ order }) {
  const reached = STEPS.indexOf(order.status);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-mist-400">Order</p>
          <p className="font-display text-2xl font-semibold text-mist-50">{order.orderNumber}</p>
          <p className="text-xs text-mist-500">Placed {formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {order.status !== 'cancelled' && (
        <ol className="grid grid-cols-4 gap-2" aria-label="Order progress">
          {STEPS.map((s, i) => (
            <li key={s} className="text-center">
              <div className={cn('h-1.5 rounded-full', i <= reached ? 'bg-blue-500' : 'bg-ink-600')} />
              <p className={cn('mt-2 text-[11px] sm:text-xs', i <= reached ? 'text-mist-100' : 'text-mist-500')}>
                {ORDER_STATUS_LABELS[s]}
                {i <= reached && <span className="sr-only"> (done)</span>}
              </p>
            </li>
          ))}
        </ol>
      )}

      {order.trackingInfo?.trackingNumber && (
        <p className="rounded-lg bg-ink-800 px-4 py-3 text-sm text-mist-300">
          Courier: <strong className="text-mist-50">{order.trackingInfo.courier || '—'}</strong> · Tracking number:{' '}
          <strong className="text-mist-50">{order.trackingInfo.trackingNumber}</strong>
        </p>
      )}

      <ul className="divide-y divide-line rounded-xl border border-line">
        {order.items.map((i, idx) => (
          <li key={idx} className="flex justify-between gap-4 px-4 py-3 text-sm">
            <span className="text-mist-100">
              {i.name}
              {i.variantLabel && <span className="text-mist-400"> — {i.variantLabel}</span>}
              <span className="text-mist-500"> × {i.quantity}</span>
            </span>
            <span className="shrink-0">{formatPKR(i.lineTotal)}</span>
          </li>
        ))}
      </ul>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between"><dt className="text-mist-400">Subtotal</dt><dd>{formatPKR(order.subtotal)}</dd></div>
        {order.discount > 0 && (
          <div className="flex justify-between text-success"><dt>Discount {order.coupon?.code && `(${order.coupon.code})`}</dt><dd>−{formatPKR(order.discount)}</dd></div>
        )}
        <div className="flex justify-between">
          <dt className="text-mist-400">Shipping</dt>
          <dd>{order.shippingFee == null ? 'To be confirmed' : order.shippingFee === 0 ? 'Free' : formatPKR(order.shippingFee)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><dt>Total</dt><dd>{formatPKR(order.total)}</dd></div>
        <div className="flex justify-between text-xs text-mist-400">
          <dt>Payment</dt>
          <dd>{PAYMENT_LABELS[order.payment.method] || order.payment.method} · {order.payment.status === 'paid' ? 'Paid' : order.payment.status === 'failed' ? 'Payment rejected' : order.payment.method === 'bank_qr' ? 'Payment verification pending' : 'To be paid on delivery'}</dd>
        </div>
      </dl>

      {order.shippingAddress?.addressLine ? (
        <div className="text-sm">
          <p className="mb-1 font-medium text-mist-100">Delivery address</p>
          <p className="text-mist-400">
            {order.shippingAddress.fullName}, {order.shippingAddress.phone}
            <br />
            {order.shippingAddress.addressLine}
            {order.shippingAddress.area && `, ${order.shippingAddress.area}`}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
          </p>
        </div>
      ) : (
        <p className="text-sm text-mist-400">Delivering to {order.shippingAddress.city}, {order.shippingAddress.province}</p>
      )}

      {order.statusHistory?.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-mist-300">Status history</summary>
          <ul className="mt-2 space-y-1 text-mist-400">
            {order.statusHistory.map((h, i) => (
              <li key={i}>
                {formatDateTime(h.at)} — {ORDER_STATUS_LABELS[h.status] || h.status}
                {h.note && ` (${h.note})`}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
