import { z } from 'zod';
import { money, nullableMoney, objectId, optionalText, slugSchema } from './common';

const seoSchema = z
  .object({
    title: optionalText(70),
    description: optionalText(160),
  })
  .default({});

export const imageSchema = z.object({
  url: z.url().refine((u) => u.startsWith('https://res.cloudinary.com/'), 'Images must be uploaded to Cloudinary'),
  publicId: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  format: z.string().optional(),
  bytes: z.number().int().positive().optional(),
  alt: optionalText(160),
});

const variantSchema = z.object({
  _id: objectId.optional(),
  label: z.string().trim().min(1, 'Variant label is required').max(80),
  sku: z.string().trim().toUpperCase().min(2).max(60),
  price: nullableMoney.optional(),
  salePrice: nullableMoney.optional(),
  stock: z.coerce.number().int().min(0).default(0),
});

export const productSchema = z
  .object({
    name: z.string().trim().min(2, 'Product name is required').max(140),
    slug: slugSchema.optional().or(z.literal('').transform(() => undefined)),
    sku: z.string().trim().toUpperCase().min(2, 'SKU is required').max(60),
    category: objectId,
    subcategory: objectId.nullable().optional().or(z.literal('').transform(() => null)),
    brand: optionalText(60),
    shortDescription: optionalText(300),
    description: optionalText(10000),
    specs: z
      .array(z.object({ label: z.string().trim().min(1).max(80), value: z.string().trim().min(1).max(300) }))
      .max(60)
      .default([]),
    images: z.array(imageSchema).max(12).default([]),
    price: money,
    salePrice: nullableMoney.optional(),
    stock: z.coerce.number().int().min(0).default(0),
    lowStockThreshold: z.coerce.number().int().min(0).default(5),
    variants: z.array(variantSchema).max(40).default([]),
    tags: z.array(z.string().trim().toLowerCase().max(40)).max(30).default([]),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    seo: seoSchema,
  })
  .refine((p) => p.salePrice == null || p.salePrice < p.price, {
    message: 'Sale price must be lower than the regular price',
    path: ['salePrice'],
  });

export const productUpdateSchema = productSchema;

export const stockUpdateSchema = z.object({
  stock: z.coerce.number().int().min(0).optional(),
  variants: z.array(z.object({ _id: objectId, stock: z.coerce.number().int().min(0) })).optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Category name is required').max(80),
  slug: slugSchema.optional().or(z.literal('').transform(() => undefined)),
  parent: objectId.nullable().optional().or(z.literal('').transform(() => null)),
  description: optionalText(2000),
  image: imageSchema.nullable().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
  seo: seoSchema,
});

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{3,30}$/, 'Use 3–30 letters, numbers, - or _'),
    description: optionalText(200),
    type: z.enum(['percent', 'fixed']),
    value: z.coerce.number().positive('Enter a value above 0'),
    maxDiscount: nullableMoney.optional(),
    minOrder: money.default(0),
    maxUses: z.preprocess((v) => (v === '' || v == null ? null : v), z.coerce.number().int().min(1).nullable()).optional(),
    startsAt: z.coerce.date().nullable().optional(),
    expiresAt: z.coerce.date().nullable().optional(),
    isActive: z.boolean().default(true),
  })
  .refine((c) => c.type !== 'percent' || c.value <= 100, { message: 'Percent cannot exceed 100', path: ['value'] })
  .refine((c) => !c.startsAt || !c.expiresAt || c.expiresAt > c.startsAt, {
    message: 'Expiry must be after the start date',
    path: ['expiresAt'],
  });

export const orderUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  shippingFee: nullableMoney.optional(),
  trackingInfo: z.object({ courier: optionalText(60), trackingNumber: optionalText(80) }).optional(),
  adminNotes: optionalText(2000),
  note: optionalText(300),
});

export const customerUpdateSchema = z.object({ isActive: z.boolean() });

export const messageUpdateSchema = z.object({ status: z.enum(['new', 'read', 'resolved']) });

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80),
  email: z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address')),
  phone: z.string().trim().max(20).optional(),
  subject: optionalText(140),
  message: z.string().trim().min(10, 'Please write at least 10 characters').max(3000),
  // Honeypot: real users never fill this hidden field.
  company: z.string().max(0).optional(),
});
