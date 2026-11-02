'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { trackOrderSchema } from '@/lib/validation/checkout';
import { useTrackOrderMutation } from '@/store/api/shopApi';
import { getErrorMessage } from '@/lib/utils/errors';
import Field, { fieldProps } from '@/components/ui/Field';
import OrderDetails from './OrderDetails';

export default function TrackOrderForm() {
  const params = useSearchParams();
  const [track, { isLoading }] = useTrackOrderMutation();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(trackOrderSchema), defaultValues: { orderNumber: params.get('order') || '', phone: '' } });

  const onSubmit = async (values) => {
    setError(null);
    try {
      const res = await track(values).unwrap();
      setOrder(res.order);
    } catch (err) {
      setOrder(null);
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="surface h-fit space-y-4 p-5">
        <Field id="orderNumber" label="Order number" error={errors.orderNumber?.message} required>
          <input {...register('orderNumber')} {...fieldProps('orderNumber', errors.orderNumber?.message, 'uppercase')} placeholder="ZT-000123" />
        </Field>
        <Field id="phone" label="Mobile number" error={errors.phone?.message} required>
          <input {...register('phone')} {...fieldProps('phone', errors.phone?.message)} type="tel" inputMode="tel" placeholder="03XX XXXXXXX" />
        </Field>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Track order
        </button>
      </form>
      <div className="surface p-5 sm:p-6" aria-live="polite">
        {order ? <OrderDetails order={order} /> : <p className="text-sm text-mist-400">Your order status will appear here.</p>}
      </div>
    </div>
  );
}
