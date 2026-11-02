import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export const metadata = { title: 'Order placed', robots: { index: false, follow: false } };

export default async function CheckoutSuccessPage({ searchParams }) {
  const { order } = await searchParams;
  const orderNumber = /^ZT-\d{6,}$/.test(order || '') ? order : null;

  return (
    <div className="container-z flex flex-col items-center py-20 text-center">
      <CheckCircle2 className="h-14 w-14 text-success" aria-hidden />
      <h1 className="mt-6 text-3xl font-bold">Thank you — your order is placed</h1>
      {orderNumber && (
        <p className="mt-4 text-mist-300">
          Your order number is <strong className="font-display text-xl text-mist-50">{orderNumber}</strong>
        </p>
      )}
      <p className="mt-3 max-w-lg text-sm text-mist-400">
        Keep your order number. You can check the status at any time using it together with the phone number you entered at checkout. Payment is collected in cash on delivery.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={orderNumber ? `/track-order?order=${orderNumber}` : '/track-order'} className="btn-primary">
          Track your order
        </Link>
        <Link href="/products" className="btn-secondary">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
