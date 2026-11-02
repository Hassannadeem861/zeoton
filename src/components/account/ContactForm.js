'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { contactSchema } from '@/lib/validation/admin';
import { useSendContactMessageMutation } from '@/store/api/shopApi';
import { applyServerFieldErrors, getErrorMessage } from '@/lib/utils/errors';
import Field, { fieldProps } from '@/components/ui/Field';

export default function ContactForm() {
  const [send, { isLoading }] = useSendContactMessageMutation();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const { register, handleSubmit, reset, setError: setFieldError, formState: { errors } } = useForm({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (values) => {
    setError(null);
    try {
      await send(values).unwrap();
      reset();
      setSent(true);
    } catch (err) {
      if (!applyServerFieldErrors(err, setFieldError)) setError(getErrorMessage(err));
    }
  };

  if (sent) {
    return (
      <div className="surface flex flex-col items-center p-10 text-center" role="status">
        <CheckCircle2 className="h-10 w-10 text-success" aria-hidden />
        <h2 className="mt-4 text-xl font-semibold">Message sent</h2>
        <p className="mt-2 text-sm text-mist-400">Thank you. We have received your message and will reply by email.</p>
        <button type="button" className="btn-secondary mt-6" onClick={() => setSent(false)}>Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="surface space-y-4 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="c-name" label="Name" error={errors.name?.message} required>
          <input {...register('name')} {...fieldProps('c-name', errors.name?.message)} autoComplete="name" />
        </Field>
        <Field id="c-email" label="Email" error={errors.email?.message} required>
          <input {...register('email')} {...fieldProps('c-email', errors.email?.message)} type="email" autoComplete="email" />
        </Field>
        <Field id="c-phone" label="Phone (optional)" error={errors.phone?.message}>
          <input {...register('phone')} {...fieldProps('c-phone', errors.phone?.message)} type="tel" autoComplete="tel" />
        </Field>
        <Field id="c-subject" label="Subject" error={errors.subject?.message}>
          <input {...register('subject')} {...fieldProps('c-subject', errors.subject?.message)} placeholder="e.g. Order ZT-000123" />
        </Field>
      </div>
      <Field id="c-message" label="Message" error={errors.message?.message} required>
        <textarea {...register('message')} {...fieldProps('c-message', errors.message?.message)} rows={6} />
      </Field>
      {/* Honeypot for bots — hidden from people and assistive tech */}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" {...register('company')} />
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <button type="submit" className="btn-primary" disabled={isLoading}>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Send message
      </button>
    </form>
  );
}
