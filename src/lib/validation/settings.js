import { z } from 'zod';
import { nullableMoney, optionalText } from './common';

// Shipping & payment are configurable because the business has not finalised them yet.
// mode 'pending' = charges not decided: checkout shows "to be confirmed" and the admin sets the fee per order.
export const storeSettingsSchema = z.object({
  shipping: z.object({
    mode: z.enum(['pending', 'flat', 'free']).default('pending'),
    flatFee: nullableMoney.optional(),
    freeShippingThreshold: nullableMoney.optional(),
    coverageText: optionalText(200),
    deliveryTimeText: optionalText(200),
  }),
  payment: z.object({
    codEnabled: z.boolean().default(true),
    codNote: optionalText(300),
  }),
  lowStockDefault: z.coerce.number().int().min(0).max(1000).default(5),
});

export const policiesSettingsSchema = z.object({
  shippingPolicy: optionalText(20000),
  returnsPolicy: optionalText(20000),
});

export const contentSettingsSchema = z.object({
  announcement: z.object({ enabled: z.boolean().default(false), text: optionalText(160), href: optionalText(200) }),
  hero: z.object({
    eyebrow: optionalText(60),
    title: z.string().trim().min(3).max(90),
    subtitle: optionalText(260),
    ctaLabel: optionalText(30),
    ctaHref: optionalText(200),
  }),
  about: optionalText(20000),
});

export const faqSettingsSchema = z.object({
  items: z
    .array(z.object({ question: z.string().trim().min(5).max(200), answer: z.string().trim().min(5).max(2000) }))
    .max(50),
});

export const seoSettingsSchema = z.object({
  homeTitle: optionalText(70),
  homeDescription: optionalText(160),
  googleSiteVerification: optionalText(100),
  socialLinks: z
    .array(z.object({ label: z.string().trim().min(2).max(30), url: z.url() }))
    .max(10)
    .default([]),
});

export const settingsSchemas = {
  store: storeSettingsSchema,
  policies: policiesSettingsSchema,
  content: contentSettingsSchema,
  faq: faqSettingsSchema,
  seo: seoSettingsSchema,
};
