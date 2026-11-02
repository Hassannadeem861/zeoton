'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { loginSchema, registerFormSchema } from '@/lib/validation/auth';
import { useLoginMutation, useRegisterMutation } from '@/store/api/shopApi';
import { applyServerFieldErrors, getErrorMessage } from '@/lib/utils/errors';
import Field, { fieldProps } from '@/components/ui/Field';

// Only allow same-site relative redirects (prevents open-redirects via ?next=).
function safeNext(next) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/account';
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [login, { isLoading }] = useLoginMutation();
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    setError(null);
    try {
      await login(values).unwrap();
      router.replace(safeNext(params.get('next')));
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Field id="email" label="Email" error={errors.email?.message} required>
        <input {...register('email')} {...fieldProps('email', errors.email?.message)} type="email" autoComplete="email" />
      </Field>
      <Field id="password" label="Password" error={errors.password?.message} required>
        <input {...register('password')} {...fieldProps('password', errors.password?.message)} type="password" autoComplete="current-password" />
      </Field>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Sign in
      </button>
      <p className="text-center text-sm text-mist-400">
        New to ZEOTON?{' '}
        <Link href={`/register${params.get('next') ? `?next=${encodeURIComponent(params.get('next'))}` : ''}`} className="text-blue-300 hover:underline">
          Create an account
        </Link>
      </p>
      <p className="text-center text-xs text-mist-500">
        Forgot your password? Contact us at the email or phone number in the footer and we will help you regain access.
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerFormSchema) });

  const onSubmit = async ({ confirmPassword: _confirm, ...values }) => {
    setError(null);
    try {
      await registerUser(values).unwrap();
      router.replace(safeNext(params.get('next')));
      router.refresh();
    } catch (err) {
      if (!applyServerFieldErrors(err, setFieldError)) setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Field id="name" label="Full name" error={errors.name?.message} required>
        <input {...register('name')} {...fieldProps('name', errors.name?.message)} autoComplete="name" />
      </Field>
      <Field id="email" label="Email" error={errors.email?.message} required>
        <input {...register('email')} {...fieldProps('email', errors.email?.message)} type="email" autoComplete="email" />
      </Field>
      <Field id="phone" label="Mobile number (optional)" error={errors.phone?.message}>
        <input {...register('phone')} {...fieldProps('phone', errors.phone?.message)} type="tel" inputMode="tel" autoComplete="tel" placeholder="03XX XXXXXXX" />
      </Field>
      <Field id="password" label="Password" error={errors.password?.message} hint="At least 8 characters with a letter and a number." required>
        <input {...register('password')} {...fieldProps('password', errors.password?.message)} type="password" autoComplete="new-password" />
      </Field>
      <Field id="confirmPassword" label="Confirm password" error={errors.confirmPassword?.message} required>
        <input {...register('confirmPassword')} {...fieldProps('confirmPassword', errors.confirmPassword?.message)} type="password" autoComplete="new-password" />
      </Field>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Create account
      </button>
      <p className="text-center text-sm text-mist-400">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-300 hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
