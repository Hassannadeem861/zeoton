'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { Loader2, Lock } from 'lucide-react';
import { checkoutSchema } from '@/lib/validation/checkout';

// Cart items come from the store, not form fields; the server validates the full schema.
const formSchema = checkoutSchema.omit({ items: true });
import { useGetMeQuery, useGetProfileQuery, usePlaceOrderMutation } from '@/store/api/shopApi';
import { clearCart } from '@/store/slices/cartSlice';
import { applyServerFieldErrors, getErrorMessage } from '@/lib/utils/errors';
import { formatPKR } from '@/lib/utils/format';
import { useCartQuote } from '@/components/cart/useCartQuote';
import OrderSummary from '@/components/cart/OrderSummary';
import CouponForm from '@/components/cart/CouponForm';
import EmptyState from '@/components/ui/EmptyState';
import Field, { fieldProps } from '@/components/ui/Field';
import ProductImage from '@/components/product/ProductImage';
import AddressFields from './AddressFields';
import PaymentOptions from './PaymentOptions';
import DemoBadge, { DemoCartNotice } from '@/components/product/DemoBadge';

export default function CheckoutForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, couponCode, hydrated, data: quote, isLoading } = useCartQuote();
  const { data: me } = useGetMeQuery();
  const user = me?.user;
  const { data: profile } = useGetProfileQuery(undefined, { skip: !user });
  const [placeOrder, { isLoading: placing }] = usePlaceOrderMutation();
  const [formError, setFormError] = useState(null);
  const [placed, setPlaced] = useState(false);
  const [proofFile, setProofFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', notes: '', paymentMethod: 'cod', saveAddress: true, shippingAddress: { province: '' } },
  });

  const method = useWatch({ control, name: 'paymentMethod' });

  // Prefill from the signed-in customer's default address.
  useEffect(() => {
    if (!profile) return;
    const addr = profile.addresses?.find((a) => a.isDefault) || profile.addresses?.[0];
    reset((prev) => ({
      ...prev,
      email: profile.email,
      shippingAddress: addr
        ? { fullName: addr.fullName, phone: addr.phone, province: addr.province, city: addr.city, area: addr.area || '', addressLine: addr.addressLine, postalCode: addr.postalCode || '' }
        : { ...prev.shippingAddress, fullName: profile.name, phone: profile.phone || '' },
    }));
  }, [profile, reset]);

  if (!hydrated || (items.length && isLoading)) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-mist-400" aria-label="Loading checkout" />
      </div>
    );
  }
  if (!items.length && !placed) {
    return <EmptyState title="Your cart is empty" description="Add products to your cart before checking out." actionHref="/products" actionLabel="Browse products" />;
  }

  // Bank QR: upload the payment screenshot first, then place the order with its reference.
  const uploadProof = async () => {
    const body = new FormData();
    body.append('file', proofFile);
    const res = await fetch('/api/payments/proof', { method: 'POST', body, credentials: 'same-origin' });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || 'Screenshot upload failed. Please try again.');
    return { publicId: json.publicId };
  };

  const onSubmit = async (values) => {
    setFormError(null);
    if (method === 'bank_qr' && !proofFile) return setFormError('Please upload your payment screenshot.');
    try {
      const paymentProof = method === 'bank_qr' ? await uploadProof() : undefined;
      const res = await placeOrder({ ...values, paymentProof, items, couponCode: couponCode || undefined }).unwrap();
      setPlaced(true);
      dispatch(clearCart());
      router.replace(`/checkout/success?order=${encodeURIComponent(res.orderNumber)}&pay=${method}&t=${res.statusToken}`);
    } catch (err) {
      if (!applyServerFieldErrors(err, setError)) setFormError(getErrorMessage(err));
    }
  };

  const hasMethods = quote?.paymentMethods?.length > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <input type="hidden" {...register('paymentMethod')} />
      <div className="space-y-8">
        <section className="surface p-5 sm:p-6" aria-labelledby="contact-h">
          <h2 id="contact-h" className="mb-1 text-lg font-semibold">Contact</h2>
          {!user && (
            <p className="mb-4 text-sm text-mist-400">
              Checking out as a guest.{' '}
              <Link href="/login?next=/checkout" className="text-blue-300 hover:underline">Sign in</Link> to save your address and see your orders later.
            </p>
          )}
          <Field id="email" label="Email (optional)" error={errors.email?.message} hint="We use it only for questions about your order.">
            <input {...register('email')} {...fieldProps('email', errors.email?.message)} type="email" autoComplete="email" />
          </Field>
        </section>

        <section className="surface p-5 sm:p-6" aria-labelledby="ship-h">
          <h2 id="ship-h" className="mb-4 text-lg font-semibold">Delivery address</h2>
          <AddressFields register={register} errors={errors.shippingAddress} prefix="shippingAddress" />
          <Field id="notes" label="Order notes (optional)" error={errors.notes?.message} className="mt-4">
            <textarea {...register('notes')} {...fieldProps('notes', errors.notes?.message)} rows={3} placeholder="Delivery instructions, preferred time to call, etc." />
          </Field>
          {user && (
            <label className="mt-4 flex items-center gap-2.5 text-sm text-mist-300">
              <input type="checkbox" {...register('saveAddress')} className="h-4 w-4 accent-blue-500" /> Save this address to my account
            </label>
          )}
        </section>

        <section className="surface p-5 sm:p-6" aria-labelledby="pay-h">
          <h2 id="pay-h" className="mb-4 text-lg font-semibold">Payment</h2>
          <PaymentOptions
            methods={quote?.paymentMethods}
            value={method}
            onChange={(m) => setValue('paymentMethod', m)}
            codNote={quote?.codNote}
            total={quote?.total}
            shippingPending={quote?.shipping?.pending}
            file={proofFile}
            onFile={setProofFile}
          />
        </section>
      </div>

      <aside className="surface h-fit space-y-5 p-5 lg:sticky lg:top-28" aria-label="Order summary">
        <h2 className="text-lg font-semibold">Your order</h2>
        <ul className="divide-y divide-line">
          {quote?.lines.map((l) => (
            <li key={`${l.productId}:${l.variantId || ''}`} className="flex gap-3 py-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-800 p-1">
                <ProductImage image={l.image ? { url: l.image } : null} alt={l.name || ''} sizes="56px" fill />
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="line-clamp-2 text-mist-100">{l.name}</p>
                {l.variantLabel && <p className="text-xs text-mist-400">{l.variantLabel}</p>}
                {l.isDemo && <DemoBadge className="mt-0.5" />}
                <p className="text-xs text-mist-400">Qty {l.quantity}</p>
                {l.issue && <p className="text-xs text-warning">{l.message}</p>}
              </div>
              <p className="text-sm font-medium">{l.lineTotal != null ? formatPKR(l.lineTotal) : '—'}</p>
            </li>
          ))}
        </ul>
        {quote?.hasDemoItems && <DemoCartNotice />}
        <CouponForm quote={quote} />
        <OrderSummary quote={quote} />
        {formError && (
          <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {formError}
          </p>
        )}
        {quote?.hasIssues && (
          <p className="text-sm text-warning">
            Some items changed. <Link href="/cart" className="underline">Review your cart</Link>.
          </p>
        )}
        <button type="submit" className="btn-primary btn-lg w-full" disabled={placing || !hasMethods || quote?.hasIssues}>
          {placing ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}
          {placing ? 'Placing order…' : 'Place order'}
        </button>
        <p className="text-center text-xs text-mist-500">
          By placing your order you agree to our <Link href="/terms" className="underline hover:text-mist-300">Terms</Link> and{' '}
          <Link href="/privacy-policy" className="underline hover:text-mist-300">Privacy Policy</Link>.
        </p>
      </aside>
    </form>
  );
}
