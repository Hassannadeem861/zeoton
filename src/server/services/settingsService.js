import 'server-only';
import { cache } from 'react';
import { connectDB } from '@/server/db/connect';
import { Setting } from '@/server/models';
import { settingsSchemas } from '@/lib/validation/settings';
import { HttpError } from '@/server/http/errors';
import { siteConfig } from '@/config/site';

// Defaults contain only confirmed facts. Shipping fees, delivery times and the
// returns policy are intentionally empty until the business decides them.
export const SETTINGS_DEFAULTS = {
  store: {
    shipping: {
      mode: 'pending',
      flatFee: null,
      freeShippingThreshold: null,
      coverageText: 'We deliver all over Pakistan.',
      deliveryTimeText: '',
    },
    payment: { codEnabled: true, codNote: 'Pay in cash when your order is delivered.' },
    lowStockDefault: 5,
  },
  policies: { shippingPolicy: '', returnsPolicy: '' },
  content: {
    announcement: { enabled: false, text: '', href: '' },
    hero: {
      eyebrow: 'Gaming Accessories',
      title: 'Gear that keeps up with your game.',
      subtitle:
        'Gaming mice, keyboards, headsets, controllers and setup gear for players across Pakistan. Order online and pay with Cash on Delivery.',
      ctaLabel: 'Shop all gear',
      ctaHref: '/products',
    },
    about: '',
  },
  faq: {
    items: [
      {
        question: 'How do I place an order?',
        answer:
          'Add products to your cart, open the checkout, enter your delivery address and place the order. You will see an order number straight away; keep it to track your order.',
      },
      {
        question: 'Which payment methods do you accept?',
        answer: 'At the moment we accept Cash on Delivery: you pay in cash when your order is delivered.',
      },
      {
        question: 'Do you deliver all over Pakistan?',
        answer: 'Yes. We deliver to addresses all over Pakistan.',
      },
      {
        question: 'Do I need an account to order?',
        answer:
          'No. You can check out as a guest. Creating an account lets you see your order history, save addresses and keep your wishlist across devices.',
      },
      {
        question: 'How can I track my order?',
        answer:
          'Open the Track Order page and enter your order number and the phone number used at checkout. Signed-in customers can also see every order under My Account.',
      },
      {
        question: 'How do I contact ZEOTON?',
        answer: `Email ${siteConfig.email}, call ${siteConfig.phoneDisplay}, or send a message from the Contact page.`,
      },
    ],
  },
  seo: { homeTitle: '', homeDescription: '', googleSiteVerification: '', socialLinks: [] },
};

function mergeDefaults(defaults, value) {
  if (Array.isArray(defaults) || defaults === null || typeof defaults !== 'object') {
    return value === undefined ? defaults : value;
  }
  const out = { ...defaults };
  for (const [k, v] of Object.entries(value || {})) out[k] = k in defaults ? mergeDefaults(defaults[k], v) : v;
  return out;
}

export const getSettings = cache(async (key) => {
  if (!(key in SETTINGS_DEFAULTS)) throw new Error(`Unknown settings key: ${key}`);
  await connectDB();
  const doc = await Setting.findOne({ key }).lean();
  return mergeDefaults(SETTINGS_DEFAULTS[key], doc?.value);
});

export async function getAllSettings() {
  await connectDB();
  const docs = await Setting.find({ key: { $in: Object.keys(SETTINGS_DEFAULTS) } }).lean();
  const byKey = Object.fromEntries(docs.map((d) => [d.key, d.value]));
  return Object.fromEntries(
    Object.entries(SETTINGS_DEFAULTS).map(([key, defaults]) => [key, mergeDefaults(defaults, byKey[key])]),
  );
}

export async function updateSettings(key, input, userId) {
  const schema = settingsSchemas[key];
  if (!schema) throw new HttpError(404, 'Unknown settings section');
  const value = schema.parse(input);
  await Setting.findOneAndUpdate({ key }, { $set: { value, updatedBy: userId } }, { upsert: true });
  return mergeDefaults(SETTINGS_DEFAULTS[key], value);
}
