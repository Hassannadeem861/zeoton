import { z } from 'zod';

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

const PK_MOBILE = /^(?:\+92|0092|92|0)?(3\d{9})$/;

// Accepts 03XX XXXXXXX, +92 3XX XXXXXXX, 923XXXXXXXXX; normalizes to 03XXXXXXXXX.
export const pkPhone = z
  .string({ error: 'Phone number is required' })
  .trim()
  .transform((v) => v.replace(/[\s\-()]/g, ''))
  .refine((v) => PK_MOBILE.test(v), 'Enter a valid Pakistani mobile number, e.g. 0370 2885718')
  .transform((v) => `0${v.match(PK_MOBILE)[1]}`);

export const optionalText = (max) =>
  z.string().trim().max(max, `Must be ${max} characters or fewer`).optional().or(z.literal('').transform(() => undefined));

export const money = z.coerce.number({ error: 'Enter an amount' }).int('Use whole rupees').min(0, 'Cannot be negative');

export const nullableMoney = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.coerce.number().int('Use whole rupees').min(0, 'Cannot be negative').nullable(),
);

export const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only')
  .max(120);
