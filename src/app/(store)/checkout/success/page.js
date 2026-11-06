import Link from 'next/link';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import AutoRefresh from '@/components/checkout/AutoRefresh';
import { connectDB } from '@/server/db/connect';
import { getOrderStatusByToken } from '@/server/services/orderService';

export const metadata = { title: 'Order placed', robots: { index: false, follow: false } };

const VIEWS = {
  placed: {
    Icon: CheckCircle2,
    tone: 'text-success',
    title: 'Thank you — your order is placed',
    text: 'Keep your order number. You can check the status at any time using it together with the phone number you entered at checkout. Payment is collected in cash on delivery.',
  },
  pending: {
    Icon: Clock,
    tone: 'text-warning',
    title: 'Order received — payment verification pending',
    text: 'We received your payment screenshot. Your order will be confirmed as soon as our team verifies the payment. This page updates automatically.',
  },
  verified: {
    Icon: CheckCircle2,
    tone: 'text-success',
    title: 'Payment verified — your order is confirmed',
    text: 'Thank you! We have received your payment and your order is being prepared. Track it any time with your order number and phone number.',
  },
  rejected: {
    Icon: XCircle,
    tone: 'text-danger',
    title: 'Payment could not be verified',
    text: 'We could not confirm your payment, so this order was cancelled. If you have paid, please contact us with your order number and payment screenshot.',
  },
};

export default async function CheckoutSuccessPage({ searchParams }) {
  const { order, pay, t } = await searchParams;
  const orderNumber = /^ZT-\d{6,}$/.test(order || '') ? order : null;

  // Live status from the database (token from checkout); falls back to the URL for older links.
  await connectDB();
  const live = orderNumber && t ? await getOrderStatusByToken(orderNumber, t) : null;
  const isQr = (live?.paymentMethod || pay) === 'bank_qr';
  let state = isQr ? 'pending' : 'placed';
  if (live?.paymentStatus === 'paid') state = 'verified';
  else if (live && (live.paymentStatus === 'failed' || live.status === 'cancelled')) state = 'rejected';
  const { Icon, tone, title, text } = VIEWS[state];

  return (
    <div className="container-z flex flex-col items-center py-20 text-center">
      {state === 'pending' && live && <AutoRefresh />}
      <Icon className={`h-14 w-14 ${tone}`} aria-hidden />
      <h1 className="mt-6 text-3xl font-bold" aria-live="polite">{title}</h1>
      {orderNumber && (
        <p className="mt-4 text-mist-300">
          Your order number is <strong className="font-display text-xl text-mist-50">{orderNumber}</strong>
        </p>
      )}
      <p className="mt-3 max-w-lg text-sm text-mist-400">{text}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={orderNumber ? `/track-order?order=${orderNumber}` : '/track-order'} className="btn-primary">
          Track your order
        </Link>
        <Link href={state === 'rejected' ? '/contact' : '/products'} className="btn-secondary">
          {state === 'rejected' ? 'Contact us' : 'Continue shopping'}
        </Link>
      </div>
    </div>
  );
}
