'use client';

import Field, { fieldProps } from '@/components/ui/Field';
import { majorCities, provinces } from '@/config/pakistan';

/** Pakistan address inputs bound to react-hook-form under `prefix` (e.g. "shippingAddress"). */
export default function AddressFields({ register, errors = {}, prefix }) {
  const name = (f) => (prefix ? `${prefix}.${f}` : f);
  const err = (f) => errors?.[f]?.message;
  const id = (f) => `${prefix || 'addr'}-${f}`;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id={id('fullName')} label="Full name" error={err('fullName')} required>
        <input {...register(name('fullName'))} {...fieldProps(id('fullName'), err('fullName'))} autoComplete="name" />
      </Field>
      <Field id={id('phone')} label="Mobile number" error={err('phone')} hint="e.g. 0370 2885718" required>
        <input {...register(name('phone'))} {...fieldProps(id('phone'), err('phone'))} type="tel" inputMode="tel" autoComplete="tel" placeholder="03XX XXXXXXX" />
      </Field>
      <Field id={id('province')} label="Province / Territory" error={err('province')} required>
        <select {...register(name('province'))} {...fieldProps(id('province'), err('province'))} defaultValue="">
          <option value="" disabled>Select province</option>
          {provinces.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </Field>
      <Field id={id('city')} label="City" error={err('city')} required>
        <input {...register(name('city'))} {...fieldProps(id('city'), err('city'))} list={`${id('city')}-list`} autoComplete="address-level2" />
        <datalist id={`${id('city')}-list`}>
          {majorCities.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>
      <Field id={id('addressLine')} label="Street address" error={err('addressLine')} className="sm:col-span-2" required>
        <input {...register(name('addressLine'))} {...fieldProps(id('addressLine'), err('addressLine'))} autoComplete="street-address" placeholder="House/flat number, street, block" />
      </Field>
      <Field id={id('area')} label="Area / Landmark" error={err('area')}>
        <input {...register(name('area'))} {...fieldProps(id('area'), err('area'))} placeholder="e.g. Gulshan-e-Iqbal, near …" />
      </Field>
      <Field id={id('postalCode')} label="Postal code" error={err('postalCode')}>
        <input {...register(name('postalCode'))} {...fieldProps(id('postalCode'), err('postalCode'))} inputMode="numeric" maxLength={5} autoComplete="postal-code" />
      </Field>
    </div>
  );
}
