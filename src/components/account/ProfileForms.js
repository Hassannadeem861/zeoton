'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Star, Trash2 } from 'lucide-react';
import { changePasswordSchema, profileSchema } from '@/lib/validation/auth';
import { addressSchema } from '@/lib/validation/checkout';
import { useChangePasswordMutation, useGetProfileQuery, useSaveAddressesMutation, useUpdateProfileMutation } from '@/store/api/shopApi';
import { applyServerFieldErrors, getErrorMessage } from '@/lib/utils/errors';
import Field, { fieldProps } from '@/components/ui/Field';
import AddressFields from '@/components/checkout/AddressFields';

function Status({ ok, error }) {
  if (error) return <p role="alert" className="text-sm text-danger">{error}</p>;
  if (ok) return <p role="status" className="text-sm text-success">{ok}</p>;
  return null;
}

function ProfileForm({ profile }) {
  const [update, { isLoading }] = useUpdateProfileMutation();
  const [msg, setMsg] = useState({});
  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: profile.name, phone: profile.phone || '' },
  });
  const onSubmit = async (values) => {
    setMsg({});
    try {
      await update(values).unwrap();
      setMsg({ ok: 'Profile saved.' });
    } catch (err) {
      if (!applyServerFieldErrors(err, setError)) setMsg({ error: getErrorMessage(err) });
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="surface space-y-4 p-5">
      <h2 className="text-lg font-semibold">Profile</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="p-name" label="Full name" error={errors.name?.message} required>
          <input {...register('name')} {...fieldProps('p-name', errors.name?.message)} autoComplete="name" />
        </Field>
        <Field id="p-phone" label="Mobile number" error={errors.phone?.message}>
          <input {...register('phone')} {...fieldProps('p-phone', errors.phone?.message)} type="tel" autoComplete="tel" />
        </Field>
      </div>
      <p className="text-xs text-mist-500">Email: {profile.email}</p>
      <Status {...msg} />
      <button type="submit" className="btn-primary" disabled={isLoading}>Save profile</button>
    </form>
  );
}

function PasswordForm() {
  const [change, { isLoading }] = useChangePasswordMutation();
  const [msg, setMsg] = useState({});
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm({ resolver: zodResolver(changePasswordSchema) });
  const onSubmit = async (values) => {
    setMsg({});
    try {
      await change(values).unwrap();
      reset();
      setMsg({ ok: 'Password changed. Other devices have been signed out.' });
    } catch (err) {
      if (err?.data?.details?.field) setError(err.data.details.field, { message: err.data.message });
      else if (!applyServerFieldErrors(err, setError)) setMsg({ error: getErrorMessage(err) });
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="surface space-y-4 p-5">
      <h2 className="text-lg font-semibold">Change password</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="currentPassword" label="Current password" error={errors.currentPassword?.message} required>
          <input {...register('currentPassword')} {...fieldProps('currentPassword', errors.currentPassword?.message)} type="password" autoComplete="current-password" />
        </Field>
        <Field id="newPassword" label="New password" error={errors.newPassword?.message} required>
          <input {...register('newPassword')} {...fieldProps('newPassword', errors.newPassword?.message)} type="password" autoComplete="new-password" />
        </Field>
      </div>
      <Status {...msg} />
      <button type="submit" className="btn-primary" disabled={isLoading}>Update password</button>
    </form>
  );
}

function AddressBook({ addresses }) {
  const [save, { isLoading }] = useSaveAddressesMutation();
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState({});
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(addressSchema), defaultValues: { province: '' } });

  const strip = (a) => ({ label: a.label, fullName: a.fullName, phone: a.phone, province: a.province, city: a.city, area: a.area, addressLine: a.addressLine, postalCode: a.postalCode, isDefault: a.isDefault });
  const persist = async (list, ok) => {
    setMsg({});
    try {
      await save(list.map(strip)).unwrap();
      setMsg({ ok });
      return true;
    } catch (err) {
      setMsg({ error: getErrorMessage(err) });
      return false;
    }
  };

  return (
    <section className="surface space-y-4 p-5" aria-labelledby="addr-h">
      <div className="flex items-center justify-between">
        <h2 id="addr-h" className="text-lg font-semibold">Saved addresses</h2>
        {!adding && addresses.length < 10 && (
          <button type="button" className="btn-secondary btn-sm" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" aria-hidden /> Add address
          </button>
        )}
      </div>
      {addresses.length === 0 && !adding && <p className="text-sm text-mist-400">No saved addresses yet. Addresses you use at checkout can be saved here.</p>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {addresses.map((a, i) => (
          <li key={a._id || i} className="rounded-xl border border-line p-4 text-sm">
            <p className="font-medium text-mist-100">
              {a.fullName} {a.isDefault && <span className="ml-1 rounded bg-blue-500/15 px-1.5 py-0.5 text-[11px] text-blue-300">Default</span>}
            </p>
            <p className="mt-1 text-mist-400">
              {a.addressLine}{a.area && `, ${a.area}`}, {a.city}, {a.province} {a.postalCode}
              <br />
              {a.phone}
            </p>
            <div className="mt-3 flex gap-2">
              {!a.isDefault && (
                <button type="button" className="btn-ghost btn-sm" onClick={() => persist(addresses.map((x, j) => ({ ...x, isDefault: j === i })), 'Default address updated.')}>
                  <Star className="h-3.5 w-3.5" aria-hidden /> Make default
                </button>
              )}
              <button type="button" className="btn-ghost btn-sm hover:text-danger" onClick={() => persist(addresses.filter((_, j) => j !== i), 'Address removed.')}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      {adding && (
        <form
          noValidate
          className="space-y-4 rounded-xl border border-line p-4"
          onSubmit={handleSubmit(async (values) => {
            if (await persist([...addresses, { ...values, isDefault: addresses.length === 0 }], 'Address saved.')) {
              reset({ province: '' });
              setAdding(false);
            }
          })}
        >
          <AddressFields register={register} errors={errors} prefix="" />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={isLoading}>Save address</button>
            <button type="button" className="btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </form>
      )}
      <Status {...msg} />
    </section>
  );
}

export default function ProfileForms() {
  const { data: profile, isLoading, isError } = useGetProfileQuery();
  if (isLoading) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-mist-400" aria-label="Loading profile" />;
  if (isError || !profile) return <p className="text-danger">Could not load your profile.</p>;
  return (
    <div className="space-y-6">
      <ProfileForm profile={profile} />
      <AddressBook addresses={profile.addresses || []} />
      <PasswordForm />
    </div>
  );
}
