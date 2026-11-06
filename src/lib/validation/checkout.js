import { z } from 'zod';
import { provinces } from '@/config/pakistan';
import { objectId, optionalText, pkPhone } from './common';

export const addressSchema = z.object({
  label: optionalText(40),
  fullName: z.string().trim().min(2, 'Enter the recipient name').max(80),
  phone: pkPhone,
  province: z.enum(provinces, { error: 'Select a province' }),
  city: z.string().trim().min(2, 'Enter your city').max(60),
  area: optionalText(120),
  addressLine: z.string().trim().min(5, 'Enter your full street address').max(240),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, 'Postal codes in Pakistan have 5 digits')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export const cartItemSchema = z.object({
  productId: objectId,
  variantId: objectId.nullable().optional(),
  quantity: z.coerce.number().int().min(1).max(20),
});

export const cartQuoteSchema = z.object({
  items: z.array(cartItemSchema).max(50),
  couponCode: optionalText(30),
});

export const PAYMENT_METHODS = ['cod', 'bank_qr'];

export const checkoutSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Enter a valid email address'))
    .optional()
    .or(z.literal('').transform(() => undefined)),
  shippingAddress: addressSchema,
  items: z.array(cartItemSchema).min(1, 'Your cart is empty').max(50),
  couponCode: optionalText(30),
  notes: optionalText(500),
  paymentMethod: z.enum(PAYMENT_METHODS).default('cod'),
  paymentProof: z.object({ publicId: z.string().min(1).max(200) }).optional(),
  saveAddress: z.boolean().optional(),
});

export const trackOrderSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^ZT-\d{6,}$/, 'Order numbers look like ZT-000123'),
  phone: pkPhone,
});
